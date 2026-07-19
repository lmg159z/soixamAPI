
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const jsonIPTV = await iptv();
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.status(200).send(jsonIPTV);
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Lỗi hệ thống", details: error.message });
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Fetch với timeout tự động */
async function fetchWithTimeout(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
  } finally {
    clearTimeout(timer);
  }
}

async function getAPI(url) {
  try {
    const res = await fetchWithTimeout(url);
    return await res.json();
  } catch (err) {
    console.error("getAPI error:", url, err.message);
    return null;
  }
}

function safeAtob(str) {
  if (!str || typeof str !== "string") return null;
  let s = str.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4 !== 0) s += "=";
  try { return atob(s); } catch { return null; }
}

function decodeCustom(encoded) {
  if (typeof encoded !== "string") return encoded;
  const step1 = safeAtob(encoded);
  if (!step1) return encoded;
  const reversed = step1.split("").reverse().join("");
  const step2 = safeAtob(reversed);
  if (!step2) return encoded;
  try { return decodeURIComponent(escape(step2)); } catch { return step2; }
}

// ─── Sheet fetcher ───────────────────────────────────────────────────────────

async function getDataFromSheetAsKeyValue(GID, SHEET_ID) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?gid=${GID}&tqx=out:json`;
  const response = await fetchWithTimeout(url);
  const text = await response.text();
  const jsonText = text.match(/google\.visualization\.Query\.setResponse\((.*)\);/s)?.[1];
  if (!jsonText) return [];

  const raw = JSON.parse(jsonText);
  let cols = raw.table.cols.map(col => col.label?.trim() ?? "");
  let rows = raw.table.rows;

  if (!cols.includes("timeStart") && rows.length > 0) {
    cols = rows[0].c.map(cell => cell?.v ? String(cell.v).trim() : "unknown");
    rows = rows.slice(1);
  }

  if (!rows?.length) return [];

  return rows.map(row => {
    const obj = {};
    row.c.forEach((cell, i) => {
      if (cols[i] && cols[i] !== "unknown" && cols[i] !== "") {
        obj[cols[i]] = cell?.v ? String(cell.v).trim() : null;
      }
    });
    return obj;
  });
}

// ─── Template builders ───────────────────────────────────────────────────────

function buildChannelEntry({ tvgId, group, logo, title, drm, keyID, key, url }) {
  const header = `#EXTINF:-1 tvg-id="${tvgId}" group-title="${group}" tvg-logo="${logo}",${title}`;
  const ua = `#EXTVLCOPT:http-user-agent=Dalvik/2.1.0`;
  if (drm) {
    return `${header}\n${ua}\n#KODIPROP:inputstream.adaptive.manifest_type=mpd\n#KODIPROP:inputstream.adaptive.license_type=clearkey\n#KODIPROP:inputstream.adaptive.license_key=${keyID}:${key}\n${url}\n`;
  }
  return `${header}\n${ua}\n${url}\n`;
}

// ─── Main ────────────────────────────────────────────────────────────────────


async function iptv() {

  function buildChannelEntry({
    tvgId,
    group,
    logo,
    title,
    url,
    keyID,
    key,
    license
  }) {

    const header = `#EXTINF:-1 tvg-id="${tvgId}" group-title="${group}" tvg-logo="${logo || ""}",${title}
#EXTVLCOPT:http-user-agent=Dalvik/2.1.0`;

    // Widevine
    if (license) {
      return `${header}
#KODIPROP:inputstream.adaptive.manifest_type=mpd
#KODIPROP:inputstream.adaptive.license_type=com.widevine.alpha
#KODIPROP:inputstream.adaptive.license_key=${license}
${url}
`;
    }

    // ClearKey
    if (keyID && key) {
      return `${header}
#KODIPROP:inputstream.adaptive.manifest_type=mpd
#KODIPROP:inputstream.adaptive.license_type=clearkey
#KODIPROP:inputstream.adaptive.license_key=${keyID}:${key}
${url}
`;
    }

    // Stream thường
    return `${header}
${url}
`;
  }

  // Load dữ liệu song song
  const [rawChannels, broadCastData] = await Promise.all([
    getDataFromSheetAsKeyValue(
      "2102567147",
      "1hSEcXxxEkbgq8203f_sTKAi3ZNEnFNoBnr7f3fsfzYE"
    ),
    getAPI("https://soixamapi.vercel.app/api/broadcastProgram")
  ]);

  if (!rawChannels) {
    return "Lỗi rồi hãy báo cáo với quản trị viên";
  }

  // ==========================
  // CHANNELS TỪ SHEET
  // ==========================
  const textIPTV = rawChannels
    .filter(
      k =>
        k.status === "live" ||
        k.status === "liveFEED"
    )
    .map(k =>
      buildChannelEntry({
        tvgId: k.id,
        group: k.nameGroup,
        logo: k.logo || k.thumb,
        title: `${k.acronym} | ${k.name || ""}`,
        url: k.urlStream,
        keyID: k.keyID,
        key: k.key,
        license: k.license
      })
    )
    .join("\n");

  // ==========================
  // BROADCAST
  // ==========================
  const activeItems =
    broadCastData?.broadCast?.filter(
      item => item.status === 1
    ) || [];

  const uniqueIds = [
    ...new Set(
      activeItems.map(
        item => item.channel_id || "vtv1hd"
      )
    )
  ];

  const channelMap = Object.fromEntries(
    await Promise.all(
      uniqueIds.map(async id => {
        try {
          const data = await getAPI(
            `https://soixamapi.vercel.app/api/channel?id=${id}`
          );

          return [
            id,
            data?.[0] || null
          ];
        } catch {
          return [id, null];
        }
      })
    )
  );

  const textBroadCast = activeItems
    .map(item => {

      const ch =
        channelMap[
        item.channel_id || "vtv1hd"
        ];

      if (!ch) return "";

      return buildChannelEntry({
        tvgId: `broadcast_${item.channel_id}`,
        group: "Chương trình tiêu biểu",
        logo: item.thumbnail,
        title: `${item.name} | ${item.channel_name || ""}`,
        url: decodeCustom(ch.urlStream),
        keyID: ch.keyID
          ? decodeCustom(ch.keyID)
          : null,
        key: ch.key
          ? decodeCustom(ch.key)
          : null,
        license: ch.license
          ? decodeCustom(ch.license)
          : null
      });

    })
    .join("\n");

  // ==========================
  // HEADER
  // ==========================
  const textEPG = `#EXTM3U url-tvg="https://vnepg.site/epgu.xml,https://tvbvn.quanlehong539.workers.dev/xml"
# SoiXamTV IPTV Playlist
#========================================================================================`;

  return [
    textEPG,
    textBroadCast,
    textIPTV
  ].join("\n");
}

