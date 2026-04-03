// /api/get-sheet.js
// ✅ Edge Runtime: cold start ~0ms, global distribution
export const config = { runtime: "edge" };

export default async function handler(req) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
    // Cache 60s ở Edge, stale-while-revalidate 30s
    "Cache-Control": "s-maxage=60, stale-while-revalidate=30",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  try {
    const result = await data();
    return new Response(JSON.stringify(result), { status: 200, headers });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Không thể lấy dữ liệu" }),
      { status: 500, headers }
    );
  }
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

async function getAPI(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch {
    return null;
  }
}

// CSV parser xử lý đúng dấu phẩy trong ngoặc kép
function parseCSV(csvText) {
  const lines = csvText.split("\n");
  const parseRow = (line) => {
    const result = [];
    let cur = "", inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQuote = !inQuote; }
      else if (ch === "," && !inQuote) { result.push(cur.trim()); cur = ""; }
      else { cur += ch; }
    }
    result.push(cur.trim());
    return result;
  };

  const rows = lines.map(parseRow);
  const headers = rows[0].map(h => h.replace(/^"|"$/g, ""));
  return rows.slice(1)
    .map(row => {
      const obj = {};
      row.forEach((cell, i) => {
        if (headers[i]) obj[headers[i]] = cell.replace(/^"|"$/g, "");
      });
      return obj;
    })
    .filter(obj => Object.keys(obj).length > 0);
}

async function getGoogleSheetData(GID = "2134035673") {
  const sheetId = "1hSEcXxxEkbgq8203f_sTKAi3ZNEnFNoBnr7f3fsfzYE";
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${GID}`;
  const response = await fetch(url);
  const csvText = await response.text();
  return { src: "sheet", data: parseCSV(csvText) };
}

// ─────────────────────────────────────────────
// Time utils
// ─────────────────────────────────────────────

const pad = (n) => String(n).padStart(2, "0");

function formatTimeVN(e) {
  if (!e || isNaN(e)) return "00:00:00-00:00";
  const date = new Date((Number(e) + 7 * 3600) * 1000);
  return `${pad(date.getUTCDate())}:${pad(date.getUTCMonth() + 1)}:${String(date.getUTCFullYear()).slice(-2)}-${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
}

function formatDateGMT7(isoString) {
  const d = new Date(new Date(isoString).getTime() + 25200000); // +7h ms
  return `${pad(d.getUTCDate())}:${pad(d.getUTCMonth() + 1)}:${String(d.getUTCFullYear()).slice(-2)}-${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

// DD:MM:YY-HH:MM → UTC ms
function parseVnTime(s) {
  if (!s) return 0;
  const [dp, tp] = s.split("-");
  if (!dp || !tp) return 0;
  const [d, m, y] = dp.split(":").map(Number);
  const [h, min] = tp.split(":").map(Number);
  return Date.UTC(2000 + y, m - 1, d, h, min);
}

function checkTimeStatus(timeStart, timeEnd) {
  const nowVn = Date.now() + 25200000; // +7h
  const s = parseVnTime(timeStart);
  const e = parseVnTime(timeEnd);
  if (nowVn < s) return 0;
  if (nowVn <= e) return 1;
  return 2;
}

function formatDateTime(str) {
  const [date, time] = str.split(" ");
  const [year, month, day] = date.split("-");
  const [hour, minute] = time.split(":");
  return `${day}:${month}:${year.slice(2)}-${hour}:${minute}`;
}

function formatMyTV(input) {
  const d = new Date(input.replace(" ", "T"));
  return `${pad(d.getDate())}:${pad(d.getMonth() + 1)}:${String(d.getFullYear()).slice(-2)}-${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ─────────────────────────────────────────────
// De-dup + sort
// ─────────────────────────────────────────────

function sortByStartTime(arr) {
  return [...arr].sort((a, b) => parseVnTime(a.start_time) - parseVnTime(b.start_time));
}

function filterDuplicatePrograms(data) {
  const seen = new Set();
  return data.filter(item => {
    const key = `${item.channel_id}|${item.start_time}|${item.over_time}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ─────────────────────────────────────────────
// Channel ID map
// ─────────────────────────────────────────────

async function get_id_channel() {
  const { data } = await getGoogleSheetData("262192122");
  return data.reduce((acc, { APP, ID, IDCHANNEL, NAME }) => {
    if (!acc[APP]) acc[APP] = {};
    acc[APP][ID] = { id: IDCHANNEL, name: NAME };
    return acc;
  }, {});
}

// ─────────────────────────────────────────────
// Source fetchers
// ─────────────────────────────────────────────

const ON_PLUS_BLACKLIST = new Set([
  "93a6c5ec-92eb-4ecf-8c50-64072f9dfa7f",
  "eddd7b89-1a5e-44ca-98f3-d6aa993e0bf9",
]);

async function onplus(idChannel) {
  const dataAPI = await getAPI(
    "https://re.ghiminh1.workers.dev/?url=https://tv-web.api.vinasports.com.vn/api/v2/publish/see-more/events/2"
  );

  const data = Array.isArray(dataAPI?.data)
    ? dataAPI.data
        .filter(i => i.channel_id && !ON_PLUS_BLACKLIST.has(i.channel_id))
        .map(i => ({
          id: `onplus-${i.id}`,
          name: i.name,
          start_time: formatDateGMT7(i.start_time),
          over_time: formatDateGMT7(i.over_time),
          thumbnail: i.thumbnail,
          channel_id: idChannel[i.channel_id]?.id ?? i.channel_id,
          channel_name: idChannel[i.channel_id]?.name ?? i.channel_id,
          status: i.status === "live" ? 1 : i.status === "not_started" ? 0 : null,
        }))
    : [];

  return { src: "ONPlus", data };
}

async function tv360(idChannel) {
  const [CTTH, TT] = await Promise.all([
    getAPI("https://re.ghiminh1.workers.dev/?url=https%3A%2F%2Ftv360.vn%2Fpublic%2Fv1%2Fwatch-log%2Fget-recommend%3Fid%3Drcm_program_playing%26page%3Dhome%26itemType%3DLIVE_NOW%26boxType%3DRECOMMEND%26offset%3D0%26limit%3D2000"),
    getAPI("https://re.ghiminh1.workers.dev/?url=https%3A%2F%2Ftv360.vn%2Fpublic%2Fv1%2Fwatch-log%2Fget-recommend%3Fid%3Drcm_live_now%26page%3Dhome%26itemType%3DLIVE_NOW%26boxType%3DRECOMMEND%26offset%3D0%26limit%3D2000"),
  ]);

  const dataAPI = [...(CTTH?.data?.content ?? []), ...(TT?.data?.content ?? [])];

  const data = dataAPI
    .filter(Boolean)
    .map(i => {
      const key = `tv360-${i.itemId}`;
      return {
        id: `tv360-${i.id}`,
        name: i.description ?? "",
        start_time: formatDateTime(i.beginTime),
        over_time: formatDateTime(i.endTime),
        thumbnail: i.coverImage ?? "",
        channel_id: idChannel[key]?.id ?? i.itemId,
        channel_name: idChannel[key]?.name ?? idChannel[i.itemId]?.name ?? "",
        status: checkTimeStatus(formatDateTime(i.beginTime), formatDateTime(i.endTime)),
      };
    });

  return { src: "TV360", data };
}

async function mytv(idChannel, page = 1, num = 20) {
  const mytvHeaders = {
    Origin: "https://mytv.com.vn",
    Referer: "https://mytv.com.vn/",
    "User-Agent": "Mozilla/5.0",
    Accept: "application/json, text/plain, */*",
  };

  const [res1, res2] = await Promise.all([
    fetch(`https://webapi.mytv.vn/api/v1/home/cate-info/su-kien-truc-tiep?page=${page}&num=${num}`, { headers: mytvHeaders }),
    fetch(`https://webapi.mytv.vn/api/v1/home/cate-info/chuong-trinh-truyen-hinh?page=${page}&num=${num}`, { headers: mytvHeaders }),
  ]);

  const [API1, API2] = await Promise.all([res1.json(), res2.json()]);
  const dataAPI = [...(API1?.data?.data ?? []), ...(API2?.data?.data ?? [])];

  const data = dataAPI
    .map(i => {
      const key = `mytv-${i.CHANNEL_ID}`;
      const channel = idChannel[key] ?? idChannel[String(i.CHANNEL_ID)];
      if (!channel) return null;
      const start = formatMyTV(i.START_TIME);
      const over = formatMyTV(i.END_TIME);
      return {
        id: `mytv-${i.CONTENT_ID}`,
        name: i.CONTENT_NAME ?? "",
        start_time: start,
        over_time: over,
        thumbnail: i.CONTENT_HOR_POSTER ?? "",
        channel_id: channel.id ?? String(i.CHANNEL_ID),
        channel_name: channel.name ?? "",
        status: checkTimeStatus(start, over),
      };
    })
    .filter(Boolean);

  return { src: "MYTV", data };
}

async function FPTPlay(idChannel) {
  const API = await getAPI(
    "https://re.ghiminh1.workers.dev/?url=https://andanh.site/proxyipvn.php?url=https://api.fptplay.net/api/v7.1_ios/playos/block/highlight/632f01322089bd00e5c5ed3d?block_type=horizontal_slider&page_index=1&page_size=1000"
  );

  const data = (API?.data ?? []).map(i => {
    const key = "fpt" + (i.id ?? "").replace(/-/g, "");
    const start = formatTimeVN(i.begin_time);
    const over = formatTimeVN(i.end_time);
    return {
      id: `fptplay-${i.id}`,
      name: i.title,
      start_time: start,
      over_time: over,
      thumbnail: i?.image?.landscape_title,
      channel_id: idChannel?.[key]?.id ?? "",
      channel_name: idChannel?.[key]?.name ?? `FPT-${i.id}`,
      status: checkTimeStatus(start, over),
    };
  });

  return { src: "FPTPLAY", data };
}

// ─────────────────────────────────────────────
// Main orchestrator
// ─────────────────────────────────────────────

async function data() {
  // ✅ Fetch channel map và Google Sheet song song với nhau
  const [idChannel, sheetResult] = await Promise.all([
    get_id_channel(),
    getGoogleSheetData(),
  ]);

  // ✅ Sau khi có idChannel, gọi tất cả 4 nguồn song song
  const [resTv360, resOnplus, resMytv, resFPTPlay] = await Promise.allSettled([
    tv360(idChannel.tv360),
    onplus(idChannel.onplus),
    mytv(idChannel.mytv),
    FPTPlay(idChannel.fptplay),
  ]);

  const safe = (res) => (res.status === "fulfilled" && res.value?.data) ? res.value.data : [];
  const safeSrc = (res) => res.status === "fulfilled" ? res.value?.src : null;

  const combined = [
    ...safe(resOnplus),
    ...safe(resFPTPlay),
    ...safe(resMytv),
    ...safe(resTv360),
  ];

  return {
    src: [safeSrc(resTv360), safeSrc(resOnplus), safeSrc(resMytv), safeSrc(resFPTPlay)],
    broadCast: filterDuplicatePrograms(sortByStartTime(combined)),
    liveThumB: sheetResult?.data ?? [],
  };
}