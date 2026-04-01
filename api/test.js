// ============================================================
// CONSTANTS
// ============================================================

const PROXY_BASE = "https://re.ghiminh1.workers.dev/?url=";
const PROXY_VN   = "https://andanh.site/proxyipvn.php?url=";

const BLACKLIST_ONPLUS = new Set([
  "93a6c5ec-92eb-4ecf-8c50-64072f9dfa7f",
  "eddd7b89-1a5e-44ca-98f3-d6aa993e0bf9",
]);

const WHITELIST_ONPLUS = {
  "f8d1f05f-a12b-463d-ba44-9afdb43629f2": { id: "vtv2hd",      name: "VTV2" },
  "2987336b-ce50-42ae-80a3-d24e0c0f73b3": { id: "vtv5hdtnb",   name: "VTV 5 Tây Nam Bộ" },
  "cdffe455-039a-45ac-9fca-c4d27a24a4b0": { id: "vtv5hd",      name: "VTV 5" },
  "cdd222b8-c8fc-40c6-8baf-540d55469932": { id: "vtv7hd",      name: "VTV 7" },
  "16922d09-8b39-4b85-8703-ba757698acf5": { id: "htv4",        name: "HTV4" },
  "30dd2af9-ff12-4642-ac1f-c4464f86ffdc": { id: "onsportsplus",  name: "ON Sportsplus" },
  "1f039dc2-320d-4365-8fef-9dfe75e58a1c": { id: "ongolf",      name: "ON Golf" },
  "a59d8f32-b0d6-49c6-a1a2-8b7911314fa5": { id: "onfootball",  name: "ON Football" },
  "410dbcf0-2cdb-48c4-bf85-de9449412830": { id: "onsports",    name: "ON Sports" },
  "13c74904-dcf2-45d0-ad0f-7c5f27656ee6": { id: "onsportsnews","name": "ON Sportsnews" },
  "94bdc33b-cfd4-48e1-a996-4332932a504c": { id: "onsport10",   name: "ONSport 10" },
  "c14f01f6-eb20-4621-b0aa-7b15be8faa42": { id: "onsport9",    name: "ONSport 9" },
  "52f4e72c-27a0-4c96-8aa5-4cf81e006521": { id: "onsport8",    name: "ONSport 8" },
  "6e301a6c-7b9c-4129-b014-7f40bbf85c49": { id: "onsport7",    name: "ONSport 7" },
  "41d73347-723c-4303-94dc-8d9f332d3f75": { id: "onsport6",    name: "ONSport 6" },
  "2a941d18-bffc-4c93-ba08-bae7ebfdb1da": { id: "onsport5",    name: "ONSport 5" },
  "763771cc-06bf-42d4-ad7b-12bbe1da1e99": { id: "onsport4",    name: "ONSport 4" },
  "f5aa9e08-6cb8-4f64-8304-0199f18f10d8": { id: "onsport3",    name: "ONSport 3" },
  "9af1dcf4-ba60-4aef-9dcb-fd10242020b2": { id: "onsport1",    name: "ONSport 1" },
  "e2129578-ad42-4a17-b391-253844f6dfc2": { id: "onlivetv9",   name: "ONLiveTV9" },
  "1ced33d8-c821-4ab8-8b53-f17899988440": { id: "onlivetv8",   name: "ONLiveTV8" },
  "709243e6-26ea-4a83-8611-2d6d06faafdb": { id: "onlivetv7",   name: "ONLiveTV7" },
  "02f32877-7365-4ebe-88d1-ed46bad8315a": { id: "onlivetv6",   name: "ONLiveTV6" },
  "db06a173-09a0-407a-8b6d-1e9d83772781": { id: "onlivetv5",   name: "ONLiveTV5" },
  "f92daeb0-6845-4da9-8b32-4b8c479bdfe8": { id: "onlivetv4",   name: "ONLiveTV4" },
  "db2b35ab-69a7-45be-9f28-dff8940eb51f": { id: "onlivetv3",   name: "ONLiveTV3" },
  "afb95e22-13a1-4371-bb07-e14d97054c0b": { id: "onlivetv2",   name: "ONLiveTV2" },
  "7c2426a6-dfcf-4b15-bfce-e2ce5e1e3e67": { id: "onlivetv1",   name: "ONLiveTV1" },
};

const WHITELIST_TV360 = {
  "20":    { id: "antvhd",        name: "ANTV" },
  "19":    { id: "qpvnhd",        name: "QPVN" },
  "2":     { id: "vtv1hd",        name: "VTV1" },
  "3":     { id: "vtv2hd",        name: "VTV2" },
  "4":     { id: "vtv3hd",        name: "VTV3" },
  "108":   { id: "vtv4hd",        name: "VTV4" },
  "110":   { id: "vtv5hd",        name: "VTV5" },
  "157":   { id: "vtv5hdtnb",     name: "VTV5 Tây Nam Bộ" },
  "207":   { id: "vtv5hdtn",      name: "VTV5 Tây Nguyên" },
  "6":     { id: "vtv7hd",        name: "VTV7" },
  "115":   { id: "vtv8hd",        name: "VTV8" },
  "8":     { id: "vtv9hd",        name: "VTV9" },
  "98":    { id: "vtv10hd",       name: "VTV Cần Thơ" },
  "9951":  { id: "vietnamtoday",  name: "Vietnam Today" },
  "173":   { id: "onsports",      name: "ON Sports" },
  "183":   { id: "onsportsplus",  name: "ON Sports+" },
  "170":   { id: "onsportsnews",  name: "ON Sports News" },
  "174":   { id: "onfootball",    name: "ON Football" },
  "169":   { id: "ongolf",        name: "ON Golf" },
  "180":   { id: "onviegiaitri",  name: "ON Vie Giải Trí" },
  "177":   { id: "onviedramas",   name: "ON Vie Dramas" },
  "175":   { id: "onphimviet",    name: "ON Phim Việt" },
  "176":   { id: "oncine",        name: "ON Cine" },
  "181":   { id: "onmovies",      name: "ON Movies - YouTV" },
  "182":   { id: "onechannel",    name: "ON Echannel" },
  "136":   { id: "ono2tv",        name: "ON O2TV" },
  "178":   { id: "onbibi",        name: "ON Bibi" },
  "179":   { id: "onkids",        name: "ON Kids" },
  "189":   { id: "oninfotv",      name: "ON Info TV" },
  "184":   { id: "onstyle",       name: "ON Style TV" },
  "185":   { id: "onmusic",       name: "ON Music" },
  "186":   { id: "ontrending",    name: "ON Trending TV" },
  "187":   { id: "onvfamily",     name: "ON VFamily" },
  "188":   { id: "onlife",        name: "ON Life" },
  "151":   { id: "btv9bchannel",  name: "BTV9 - Bchannel" },
  "201":   { id: "sctv2hd",       name: "SCTV2 TodayTV" },
  "232":   { id: "sctv6hd",       name: "SCTV6 FIM360" },
  "190":   { id: "htv1",          name: "HTV1" },
  "191":   { id: "htv2hd",        name: "HTV2 - Vie Channel" },
  "192":   { id: "htv3",          name: "HTV3" },
  "9":     { id: "htv4",          name: "HTV 4" },
  "193":   { id: "htv7hd",        name: "HTV7" },
  "194":   { id: "htv9hd",        name: "HTV9" },
  "14":    { id: "htvccanhachd",  name: "HTVC CA NHẠC" },
  "133":   { id: "htvcdulichhd",  name: "HTVC DL&CS" },
  "11":    { id: "htvcgiadinhhd", name: "HTVC GIA ĐÌNH" },
  "15":    { id: "htvcphimhd",    name: "HTVC PHIM" },
  "12":    { id: "htvcphunuhd",   name: "HTVC PHỤ NỮ" },
  "132":   { id: "htvcplushd",    name: "HTVC PLUS" },
  "195":   { id: "htvthethaohd",  name: "HTVC THỂ THAO" },
  "13":    { id: "htvcthuanviet", name: "HTVC THUẦN VIỆT" },
  "66":    { id: "angiang1",      name: "ATV1" },
  "35":    { id: "angiang2",      name: "ATV2" },
  "39":    { id: "bacninh",       name: "Bắc Ninh" },
  "46":    { id: "camau",         name: "Cà Mau" },
  "48":    { id: "caobang",       name: "Cao Bằng" },
  "47":    { id: "cantho1",       name: "Cần Thơ 1" },
  "61":    { id: "cantho2",       name: "Cần Thơ 2" },
  "84":    { id: "cantho3",       name: "Cần Thơ 3" },
  "49":    { id: "danang1",       name: "Đà Nẵng 1" },
  "80":    { id: "danang2",       name: "Đà Nẵng 2" },
  "51":    { id: "daklak",        name: "Đắk Lắk" },
  "52":    { id: "dienbien",      name: "Điện Biên" },
  "53":    { id: "dongnai1",      name: "Đồng Nai 1" },
  "255":   { id: "dongnai2",      name: "Đồng Nai 2" },
  "54":    { id: "dongthap1",     name: "Đồng Tháp 1" },
  "90":    { id: "dongthap2",     name: "Đồng Tháp 2 - Miền Tây" },
  "55":    { id: "gialai",        name: "Gia Lai" },
  "33":    { id: "hanoi1",        name: "Hà Nội 1" },
  "34":    { id: "hanoi2",        name: "Hà Nội 2" },
  "32":    { id: "hitv",          name: "HiTV" },
  "31":    { id: "youtv",         name: "You TV" },
  "58":    { id: "hatinh",        name: "Hà tĩnh" },
  "59":    { id: "haiphong3",     name: "Hải Phòng 3" },
  "60":    { id: "haiphong",      name: "Hải Phòng" },
  "159":   { id: "cinemaworldhd", name: "CinemaWorld" },
  "63":    { id: "hue",           name: "HUETV" },
  "64":    { id: "hungyen",       name: "Hưng Yên" },
  "65":    { id: "khanhhoa",      name: "KTV" },
  "76":    { id: "khanhhoa1",     name: "KTV1" },
  "68":    { id: "laichau",       name: "LTV" },
  "70":    { id: "langson",       name: "LSTV" },
  "71":    { id: "laocai",        name: "THLC" },
  "69":    { id: "lamdong1",      name: "LTV1" },
  "45":    { id: "lamdong2",      name: "LTV2" },
  "74":    { id: "nghean",        name: "NTV" },
  "75":    { id: "ninhbinh",      name: "NBTV" },
  "77":    { id: "phutho",        name: "PTV" },
  "81":    { id: "quangngai",     name: "QNgTV 1" },
  "82":    { id: "quangninh1",    name: "QTV1" },
  "134":   { id: "quangninh3",    name: "QTV3" },
  "83":    { id: "quangtri",      name: "QTTV" },
  "85":    { id: "sonla",         name: "STV" },
  "72":    { id: "tayninh1",      name: "TTV" },
  "89":    { id: "thanhhoa",      name: "TTV" },
  "88":    { id: "thainguyen",    name: "TN" },
  "92":    { id: "tuyenquang",    name: "TTV" },
  "25":    { id: "vinhlong1hd",   name: "THVL1" },
  "26":    { id: "vinhlong2hd",   name: "THVL2" },
  "219":   { id: "vinhlong3hd",   name: "THVL3" },
  "220":   { id: "vinhlong4hd",   name: "THVL4" },
  "91":    { id: "vinhlong5hd",   name: "THVL5" },
  "271":   { id: "hbohd",         name: "HBO" },
  "111":   { id: "arirang",       name: "Arirang" },
  "277":   { id: "cartoonhd",     name: "Cartoon Network" },
  "112":   { id: "cna",           name: "Channel News Asia (CNA)" },
  "239":   { id: "cinemaxhd",     name: "Cinemax" },
  "9855":  { id: "cnbc",          name: "CNBC" },
  "214":   { id: "davinci",       name: "Da Vinci" },
  "279":   { id: "discoveryhd",   name: "Discovery" },
  "235":   { id: "dreamworks",    name: "DreamWorks" },
  "96":    { id: "france24eng",   name: "France 24" },
  "99":    { id: "hgtv",          name: "HGTV" },
  "9856":  { id: "historyhd",     name: "History" },
  "213":   { id: "kbsworld",      name: "KBS World" },
  "9901":  { id: "kix",           name: "KIX" },
  "106":   { id: "nhkworld",      name: "NHK World" },
  "216":   { id: "outdoorhd",     name: "Outdoor Channel" },
  "273":   { id: "warnertvhd",    name: "Warner TV" },
  "281":   { id: "anxhd",         name: "ANX" },
  "283":   { id: "abcaustralia",  name: "ABC Australia" },
  "237":   { id: "bloomberg",     name: "Bloomberg" },
  "275":   { id: "cnn",           name: "CNN" },
  "163":   { id: "fashionhd",     name: "Fashion TV" },
  "9904":  { id: "tv360promo",    name: "TV360Promo" },
  "9888":  { id: "tv360live",     name: "TV360Live" },
  "2554":  { id: "tv360plus1",    name: "TV360P1" },
  "1":     { id: "tv360plus2",    name: "TV360P2" },
  "148":   { id: "tv360plus3",    name: "TV360P3" },
  "2458":  { id: "tv360plus4",    name: "TV360P4" },
  "9867":  { id: "tv360plus5",    name: "TV360P5" },
  "9868":  { id: "tv360plus6",    name: "TV360P6" },
  "9869":  { id: "tv360plus7",    name: "TV360P7" },
  "9870":  { id: "tv360plus8",    name: "TV360P8" },
  "9887":  { id: "tv360plus9",    name: "TV360p9" },
  "9957":  { id: "tv360plus10",   name: "TV360p10" },
  "9958":  { id: "tv360plus11",   name: "TV360p11" },
  "10001": { id: "tv360plus12",   name: "TV360P12" },
};

const WHITELIST_MYTV = {
  "766": { id: "sctvhdpth",  name: "SCTV Phim Tổng hợp" },
  "769": { id: "sctv1hd",    name: "SCTV1 Hài" },
  "772": { id: "sctv2hd",    name: "SCTV2 TodayTV" },
  "775": { id: "sctv3hd",    name: "SCTV3 SeeTV" },
  "778": { id: "sctv4hd",    name: "SCTV 4" },
  "781": { id: "sctv6hd",    name: "SCTV6 FIM360" },
  "784": { id: "sctv7hd",    name: "SCTV7 SHOW TV" },
  "787": { id: "sctv8hd",    name: "SCTV8 VITV" },
  "790": { id: "sctv9hd",    name: "SCTV9 Kinh Tế Thị Trường" },
  "793": { id: "sctv11hd",   name: "SCTV11 TV STAR" },
  "796": { id: "sctv12hd",   name: "SCTV12 Du Lịch Khám Phá" },
  "799": { id: "sctv13hd",   name: "SCTV13 Phụ Nữ & Gia Đình" },
  "823": { id: "sctv15hd",   name: "SCTV15 SPORT2" },
  "826": { id: "sctv17hd",   name: "SCTV17 SPORT" },
  "808": { id: "sctv18hd",   name: "SCTV18" },
  "811": { id: "sctv19hd",   name: "SCTV19 Channel T" },
  "814": { id: "sctv20hd",   name: "SCTV20 Kênh Ca nhạc" },
  "817": { id: "sctv21hd",   name: "SCTV21 Việt Nam Ký Ức" },
  "829": { id: "sctv22hd",   name: "SCTV22 SSPORT1" },
  "632": { id: "spotv1",     name: "SPOTV" },
  "633": { id: "spotv2",     name: "SPOTV2" },
};


// ============================================================
// UTILS — Thời gian
// ============================================================

const pad = (n) => String(n).padStart(2, "0");

/**
 * Unix timestamp (giây, UTC) → "DD:MM:YY-HH:MM" (GMT+7)
 */
function formatTimeVN(e) {
  if (!e || isNaN(e)) return "00:00:00-00:00";
  const date = new Date((Number(e) + 7 * 3600) * 1000);
  return [
    pad(date.getUTCDate()), ":",
    pad(date.getUTCMonth() + 1), ":",
    String(date.getUTCFullYear()).slice(-2), "-",
    pad(date.getUTCHours()), ":",
    pad(date.getUTCMinutes()),
  ].join("");
}

/**
 * ISO string → "DD:MM:YY-HH:MM" (GMT+7)
 */
function formatDateGMT7(isoString) {
  const utc   = new Date(isoString).getTime();
  const gmt7  = new Date(utc + 3600000 * 7);
  return `${pad(gmt7.getDate())}:${pad(gmt7.getMonth() + 1)}:${String(gmt7.getFullYear()).slice(-2)}-${pad(gmt7.getHours())}:${pad(gmt7.getMinutes())}`;
}

/**
 * "YYYY-MM-DD HH:MM:SS" → "DD:MM:YY-HH:MM"
 */
function formatDatetime(str) {
  const [date, time] = str.split(" ");
  const [year, month, day] = date.split("-");
  const [hour, minute]     = time.split(":");
  return `${day}:${month}:${year.slice(2)}-${hour}:${minute}`;
}

/**
 * "DD:MM:YY-HH:MM" → UTC milliseconds (để so sánh)
 */
function parseVnTime(timeStr) {
  if (!timeStr) return 0;
  const [datePart, timePart] = timeStr.split("-");
  if (!datePart || !timePart) return 0;
  const [d, m, y]   = datePart.split(":").map(Number);
  const [h, min]    = timePart.split(":").map(Number);
  return Date.UTC(2000 + y, m - 1, d, h, min);
}


// ============================================================
// UTILS — Trạng thái & dữ liệu
// ============================================================

/**
 * 0 = chưa bắt đầu | 1 = đang phát | 2 = đã kết thúc
 */
function checkTimeStatus(timeStart, timeEnd) {
  const nowVn = Date.now() + 7 * 3600000;
  const start = parseVnTime(timeStart);
  const end   = parseVnTime(timeEnd);
  if (nowVn < start)              return 0;
  if (nowVn >= start && nowVn <= end) return 1;
  return 2;
}

/**
 * Lấy channel info từ whitelist, fallback về raw value
 */
function resolveChannel(whitelist, key) {
  return whitelist[key] ?? { id: key, name: key };
}

/**
 * Gộp + sort + deduplicate
 */
function sortByStartTime(arr) {
  return [...arr].sort((a, b) => parseVnTime(a.start_time) - parseVnTime(b.start_time));
}

function deduplicatePrograms(arr) {
  const seen = new Map();
  for (const item of arr) {
    const key = `${item.channel_id}|${item.start_time}|${item.over_time}`;
    if (!seen.has(key)) seen.set(key, item);
  }
  return Array.from(seen.values());
}


// ============================================================
// UTILS — Network
// ============================================================

async function fetchJSON(url, options = {}) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`fetchJSON error [${url}]:`, err.message);
    return null;
  }
}

function proxyURL(url) {
  return `${PROXY_BASE}${encodeURIComponent(url)}`;
}
function proxyVN(url) {
  return `${PROXY_VN}${url}`;
}


// ============================================================
// SOURCE — Google Sheet
// ============================================================

async function getGoogleSheetData() {
  const sheetId = "1hSEcXxxEkbgq8203f_sTKAi3ZNEnFNoBnr7f3fsfzYE";
  const gid     = "2134035673";
  const url     = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;

  try {
    const csvText = await (await fetch(url)).text();
    const rows    = csvText.split("\n").map(row => row.split(","));
    const headers = rows[0].map(h => h.trim().replace(/^"|"$/g, ""));

    const jsonData = rows.slice(1)
      .map(row => {
        const obj = {};
        row.forEach((cell, i) => {
          if (headers[i]) obj[headers[i]] = cell.trim().replace(/^"|"$/g, "");
        });
        return obj;
      })
      .filter(obj => Object.keys(obj).length > 0);

    return { src: "sheet", data: jsonData };
  } catch (err) {
    console.error("getGoogleSheetData error:", err);
    return { src: "sheet", data: [] };
  }
}


// ============================================================
// SOURCE — ON Plus
// ============================================================

async function fetchOnPlus() {
  const url = proxyURL("https://tv-web.api.vinasports.com.vn/api/v2/publish/see-more/events/2");
  const res = await fetchJSON(url);
  if (!Array.isArray(res?.data)) return { src: "ONPlus", data: [] };

  const data = res.data
    .filter(i => i.channel_id && !BLACKLIST_ONPLUS.has(i.channel_id))
    .map(i => {
      const ch = resolveChannel(WHITELIST_ONPLUS, i.channel_id);
      return {
        id:           `onplus-${i.id}`,
        name:         i.name,
        start_time:   formatDateGMT7(i.start_time),
        over_time:    formatDateGMT7(i.over_time),
        thumbnail:    i.thumbnail,
        channel_id:   ch.id,
        channel_name: ch.name,
        status:       i.status === "live" ? 1 : 0,
      };
    });

  return { src: "ONPlus", data };
}


// ============================================================
// SOURCE — TV360
// ============================================================

async function fetchTV360() {
  const baseUrl = "https://tv360.vn/public/v1/watch-log/get-recommend";
  const params  = "page=home&itemType=LIVE_NOW&boxType=RECOMMEND&offset=0&limit=2000";

  const [resCTTH, resTT] = await Promise.all([
    fetchJSON(proxyURL(`${baseUrl}?id=rcm_program_playing&${params}`)),
    fetchJSON(proxyURL(`${baseUrl}?id=rcm_live_now&${params}`)),
  ]);

  const items = [
    ...(resCTTH?.data?.content ?? []),
    ...(resTT?.data?.content   ?? []),
  ];

  const data = items.map(i => {
    const ch = resolveChannel(WHITELIST_TV360, String(i.itemId));
    return {
      id:           `tv360-${i.id}`,
      name:         i.description,
      start_time:   formatDatetime(i.beginTime),
      over_time:    formatDatetime(i.endTime),
      thumbnail:    i.coverImage,
      channel_id:   ch.id,
      channel_name: ch.name,
      status:       checkTimeStatus(formatDatetime(i.beginTime), formatDatetime(i.endTime)),
    };
  });

  return { src: "TV360", data };
}


// ============================================================
// SOURCE — MyTV
// ============================================================

async function fetchMyTV(page = 1, num = 20) {
  const headers = {
    "Origin":     "https://mytv.com.vn",
    "Referer":    "https://mytv.com.vn/",
    "User-Agent": "Mozilla/5.0",
    "Accept":     "application/json, text/plain, */*",
  };

  const mkUrl = (slug) =>
    `https://webapi.mytv.vn/api/v1/home/cate-info/${slug}?page=${page}&num=${num}`;

  const [res1, res2] = await Promise.all([
    fetchJSON(mkUrl("su-kien-truc-tiep"),          { method: "GET", headers }),
    fetchJSON(mkUrl("chuong-trinh-truyen-hinh"),   { method: "GET", headers }),
  ]);

  const items = [
    ...(res1?.data?.data ?? []),
    ...(res2?.data?.data ?? []),
  ];

  const formatMytvDate = (str) => {
    const d = new Date(str.replace(" ", "T"));
    return `${pad(d.getDate())}:${pad(d.getMonth() + 1)}:${String(d.getFullYear()).slice(-2)}-${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const data = items
    .filter(i => Object.hasOwn(WHITELIST_MYTV, String(i.CHANNEL_ID)))
    .map(i => {
      const ch  = resolveChannel(WHITELIST_MYTV, String(i.CHANNEL_ID));
      const s   = formatMytvDate(i.START_TIME);
      const e   = formatMytvDate(i.END_TIME);
      return {
        id:           `mytv-${i.CONTENT_ID}`,
        name:         i.CONTENT_NAME,
        start_time:   s,
        over_time:    e,
        thumbnail:    i.CONTENT_HOR_POSTER,
        channel_id:   ch.id,
        channel_name: ch.name,
        status:       checkTimeStatus(s, e),
      };
    });

  return { src: "MYTV", data };
}


// ============================================================
// SOURCE — FPT Play
// ============================================================

async function fetchFPTPlay() {
  const url = "https://andanh.site/proxyipvn.php?url=https://api.fptplay.net/api/v7.1_ios/playos/block/highlight/632f01322089bd00e5c5ed3d?block_type=horizontal_slider&page_index=1&page_size=1000"
  
  const res = await fetchJSON(url);
  if (!Array.isArray(res?.data)) return { src: "FPTPLAY", data: [] };

  const data = res.data.map(i => {
    const s = formatTimeVN(i.begin_time);
    const e = formatTimeVN(i.end_time);
    return {
      id:           `fptplay-${i.id}`,
      name:         i.title,
      start_time:   s,
      over_time:    e,
      thumbnail:    i.image.landscape_title,
      channel_id:   "fpt" + i.id.replace(/-/g, ""),
      channel_name: `fpt-${i.id}`,
      status:       checkTimeStatus(s, e),
    };
  });

  return { src: "FPTPLAY", data };
}


// ============================================================
// AGGREGATOR
// ============================================================

async function aggregateAllSources() {
  const results = await Promise.allSettled([
    fetchTV360(),
    fetchOnPlus(),
    fetchMyTV(),
    fetchFPTPlay(),
    getGoogleSheetData(),
  ]);

  const [resTv360, resOnplus, resMytv, resFPTPlay, resSheet] = results;

  const safeData = (res) =>
    res.status === "fulfilled" && Array.isArray(res.value?.data)
      ? res.value.data
      : [];

  const safeSrc = (res) =>
    res.status === "fulfilled" ? res.value?.src ?? null : null;

  // Log lỗi từng nguồn
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      const names = ["TV360", "ONPlus", "MyTV", "FPTPlay", "Sheet"];
      console.error(`${names[i]} error:`, r.reason);
    }
  });

  const broadCast = deduplicatePrograms(
    sortByStartTime([
      ...safeData(resOnplus),
      ...safeData(resFPTPlay),
      ...safeData(resMytv),
      ...safeData(resTv360),
    ])
  );

  return {
    src: [safeSrc(resTv360), safeSrc(resOnplus), safeSrc(resMytv), safeSrc(resFPTPlay)],
    broadCast,
    liveThumB: safeData(resSheet),
  };
}


// ============================================================
// API HANDLER
// ============================================================

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    const payload = await aggregateAllSources();
    res.status(200).json(payload);
  } catch (err) {
    console.error("Handler error:", err);
    res.status(500).json({ error: "Không thể lấy dữ liệu" });
  }
}