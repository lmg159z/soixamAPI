export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const jsonIPTV = await vieON();
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.status(200).send(jsonIPTV);
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Lỗi hệ thống", details: error.message });
  }
}


// ✅ Thêm fetchWithTimeout còn thiếu
async function fetchWithTimeout(url, timeout = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { signal: controller.signal });
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


async function vieON() {
  const phimBo = await getAPI(
    "https://andanh.site/php/vieON/vieonGETAPI.php?path=ribbon/data-9220831f-ded1-5e88-839d-ea5655fe6564?page=0&limit=50&platform=web&ui=012021"
  );

  // ✅ Kiểm tra null trước khi truy cập .items
  if (!phimBo || !phimBo.items) {
    throw new Error("Không lấy được danh sách phim bộ");
  }

  // ✅ Phải await Promise.all vì phim() là async
  const iptv = await Promise.all(
    phimBo.items.map((i) => phim(i.group_id))
  );

  return `#EXTM3U url-tvg="https://vnepg.site/epgu.xml,https://tvbvn.quanlehong539.workers.dev/xml"
# SoiXamTV IPTV Playlist
#========================================================================================
${iptv.join("")}`;
}


async function phim(key) {
  const data = await getAPI(
    `https://andanh.site/php/vieON/vieonGETAPI.php?path=/episode/${key}?page=0&limit=500`
  );

  // ✅ Kiểm tra null
  if (!data || !data.items) return "";

  // ✅ Phải await Promise.all vì m3u() là async
  const phims = await Promise.all(
    data.items.map((i) => {
      const groupID = i.group_id;
      const ID = i.id;
      const info = {
        id: i.id,
        group: i.movie?.title ?? "Unknown",
        thumb: i.images?.thumbnail_v4_ntc ?? "",
        name: i.title ?? `Tập ${i.id}`, // ✅ Sửa ititle -> i.title
      };
      return m3u(groupID, ID, info);
    })
  );

  return phims.join("");
}


async function m3u(groupID, ID, info) {
  // ✅ Kiểm tra tham số đầu vào trước khi gọi API
  const missing = [];
  if (!groupID) missing.push("groupID");
  if (!ID) missing.push("ID");
  if (!info?.id) missing.push("info.id");
  if (!info?.group) missing.push("info.group");
  if (!info?.name) missing.push("info.name");

  if (missing.length > 0) {
    console.log(`[m3u] Bỏ qua - thiếu tham số: ${missing.join(", ")} | groupID=${groupID} ID=${ID}`);
    return "";
  }

  const phimAPI = await getAPI(
    `https://andanh.site/php/vieON/vieonGETAPI.php?path=/content_detail/${groupID}?eps_id=${ID}`
  );
console.log(phimAPI)
  // ✅ Kiểm tra null và link_play tồn tại
  if (!phimAPI || !phimAPI.link_play?.hls_link_play) {
    console.log(`[m3u] Bỏ qua - không có link_play | groupID=${groupID} ID=${ID}`);
    return "";
  }

  return `
#EXTINF:-1 tvg-id="vieON_${info.id}" group-title="${info.group}" tvg-logo="${info.thumb}", ${info.name}
#EXTVLCOPT:http-user-agent=Dalvik/2.1.0
${phimAPI.link_play.hls_link_play}`;
}