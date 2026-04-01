// /api/get-sheet.js
export default async function handler(req, res) {
  // ⚠️ CORS header để tránh lỗi từ frontend
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  try {
    const on = await data()
    res.status(200).json(on);
    // res.status(200).json(Object.values(rows));
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error);
    res.status(500).json({ error: "Không thể lấy dữ liệu từ Google Sheet" });
  }
}




// function GET API


async function getAPI(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("getAPI error:", err);
    return null;
  }
}
async function getGoogleSheetData() {
  const sheetId = '1hSEcXxxEkbgq8203f_sTKAi3ZNEnFNoBnr7f3fsfzYE';
  const gid = '2134035673';

  // URL để export ra CSV (dễ xử lý hơn)
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;

  try {
    const response = await fetch(url);
    const csvText = await response.text();

    // Parse CSV thành JSON
    const rows = csvText.split('\n').map(row => row.split(',')); // Lưu ý: Cách split này đơn giản, sẽ lỗi nếu nội dung ô có dấu phẩy
    const headers = rows[0].map(h => h.trim().replace(/^"|"$/g, '')); // Xóa ngoặc kép thừa nếu có

    const jsonData = rows.slice(1).map(row => {
      let obj = {};
      row.forEach((cell, index) => {
        if (headers[index]) {
          // Xử lý cell (xóa ký tự lạ, ngoặc kép CSV)
          obj[headers[index]] = cell.trim().replace(/^"|"$/g, '');
        }
      });
      return obj;
    }).filter(obj => Object.keys(obj).length > 0); // Lọc bỏ hàng rỗng

    const output = {
      src: "sheet",
      data: jsonData
    };

    return output;

  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error);
  }
}


// ======================================================================/
// Đổi thời gian từ timezone sang DD:MM:YY-HH:MM
function formatTimeVN(e) {
  const pad = (n) => String(n).padStart(2, "0");

  // nếu e lỗi → trả về mặc định
  if (!e || isNaN(e)) {
    return "00:00:00-00:00";
  }

  const date = new Date((Number(e) + 7 * 3600) * 1000);

  const day = pad(date.getUTCDate());
  const month = pad(date.getUTCMonth() + 1);
  const year = pad(date.getUTCFullYear()).slice(-2);
  const hour = pad(date.getUTCHours());
  const minute = pad(date.getUTCMinutes());

  return `${day}:${month}:${year}-${hour}:${minute}`;
}

// function đổi thời gian 
function formatDateGMT7(isoString) {
  const date = new Date(isoString);

  // Lấy timestamp UTC
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);

  // Cộng thêm 7 giờ
  const gmt7 = new Date(utc + (3600000 * 7));

  const day = String(gmt7.getDate()).padStart(2, '0');
  const month = String(gmt7.getMonth() + 1).padStart(2, '0');
  const year = String(gmt7.getFullYear()).slice(-2);
  const hours = String(gmt7.getHours()).padStart(2, '0');
  const minutes = String(gmt7.getMinutes()).padStart(2, '0');

  return `${day}:${month}:${year}-${hours}:${minutes}`;
}

//  function check status 
function matchValue(value, conditions, results) {
  const map = {};

  conditions.forEach((dk, index) => {
    map[dk] = results[index];
  });

  return map[value] ?? null; // không có thì trả null
}

function checkTimeStatus(timeStart, timeEnd) {
  // Hàm con: Parse chuỗi DD:MM:YY-HH:MM sang số (Timestamp) giả định
  function parseToVnTimestamp(timeString) {
    if (!timeString) return 0;
    const parts = timeString.split('-');
    if (parts.length !== 2) return 0;
    const [d, m, y] = parts[0].split(':').map(Number);
    const [h, min] = parts[1].split(':').map(Number);
    // Luôn dùng Date.UTC để lấy mốc thời gian tuyệt đối, không phụ thuộc server
    return Date.UTC(2000 + y, m - 1, d, h, min);
  }

  const startMs = parseToVnTimestamp(timeStart);
  const endMs = parseToVnTimestamp(timeEnd);

  // MẤU CHỐT Ở ĐÂY:
  // Lấy giờ UTC hiện tại + 7 tiếng cứng. 
  // Không quan tâm server đang ở Mỹ hay Singapore.
  const nowVnMs = Date.now() + (7 * 3600000);

  if (nowVnMs < startMs) return 0;
  if (nowVnMs >= startMs && nowVnMs <= endMs) return 1;
  return 2;
}




async function onplus() {
  const backListChannel = [
    "93a6c5ec-92eb-4ecf-8c50-64072f9dfa7f", // => SCTV22HD
    "eddd7b89-1a5e-44ca-98f3-d6aa993e0bf9", // => SCTV15HD
    // "16922d09-8b39-4b85-8703-ba757698acf5", // => HTV4
    // "cdd222b8-c8fc-40c6-8baf-540d55469932", // => INFO_TV_CL | VTV7 
    // "2987336b-ce50-42ae-80a3-d24e0c0f73b3", // => VTV5TNB
    // "30dd2af9-ff12-4642-ac1f-c4464f86ffdc",
    // "1f039dc2-320d-4365-8fef-9dfe75e58a1c",
    // "a59d8f32-b0d6-49c6-a1a2-8b7911314fa5",
    // "410dbcf0-2cdb-48c4-bf85-de9449412830",
    // "13c74904-dcf2-45d0-ad0f-7c5f27656ee6",
    // "f8d1f05f-a12b-463d-ba44-9afdb43629f2", // VTV cần thơ
  ]


  const whiteListChannel = {
    "f8d1f05f-a12b-463d-ba44-9afdb43629f2": { id: "vtv2hd", name: "VTV2" },
    "2987336b-ce50-42ae-80a3-d24e0c0f73b3": { id: "vtv5hdtnb", name: "VTV 5 Tây Nam Bộ" },
    "cdffe455-039a-45ac-9fca-c4d27a24a4b0": { id: "vtv5hd", name: "VTV 5" },
    "cdd222b8-c8fc-40c6-8baf-540d55469932": { id: "vtv7hd", name: "VTV 7" },
    "16922d09-8b39-4b85-8703-ba757698acf5": { id: "htv4", name: "HTV4" },
    "30dd2af9-ff12-4642-ac1f-c4464f86ffdc": { id: "onsportsplus", name: "ON Sportsplus" },
    "1f039dc2-320d-4365-8fef-9dfe75e58a1c": { id: "ongolf", name: "ON Golf" },
    "a59d8f32-b0d6-49c6-a1a2-8b7911314fa5": { id: "onfootball", name: "ON Football" },
    "410dbcf0-2cdb-48c4-bf85-de9449412830": { id: "onsports", name: "ON Sports" },
    "13c74904-dcf2-45d0-ad0f-7c5f27656ee6": { id: "onsportsnews", name: "ON Sportsnews" },
    "94bdc33b-cfd4-48e1-a996-4332932a504c": { id: "onsport10", name: "ONSport 10" },
    "c14f01f6-eb20-4621-b0aa-7b15be8faa42": { id: "onsport9", name: "ONSport 9" },
    "52f4e72c-27a0-4c96-8aa5-4cf81e006521": { id: "onsport8", name: "ONSport 8" },
    "6e301a6c-7b9c-4129-b014-7f40bbf85c49": { id: "onsport7", name: "ONSport 7" },
    "41d73347-723c-4303-94dc-8d9f332d3f75": { id: "onsport6", name: "ONSport 6" },
    "2a941d18-bffc-4c93-ba08-bae7ebfdb1da": { id: "onsport5", name: "ONSport 5" },
    "763771cc-06bf-42d4-ad7b-12bbe1da1e99": { id: "onsport4", name: "ONSport 4" },
    "f5aa9e08-6cb8-4f64-8304-0199f18f10d8": { id: "onsport3", name: "ONSport 3" },
    "9af1dcf4-ba60-4aef-9dcb-fd10242020b2": { id: "onsport1",    name: "ONSport 1" },
    "e2129578-ad42-4a17-b391-253844f6dfc2": { id: "onlivetv9", name: "ONLiveTV9" },
    "1ced33d8-c821-4ab8-8b53-f17899988440": { id: "onlivetv8", name: "ONLiveTV8" },
    "709243e6-26ea-4a83-8611-2d6d06faafdb": { id: "onlivetv7", name: "ONLiveTV7" },
    "02f32877-7365-4ebe-88d1-ed46bad8315a": { id: "onlivetv6", name: "ONLiveTV6" },
    "db06a173-09a0-407a-8b6d-1e9d83772781": { id: "onlivetv5", name: "ONLiveTV5" },
    "f92daeb0-6845-4da9-8b32-4b8c479bdfe8": { id: "onlivetv4", name: "ONLiveTV4" },
    "db2b35ab-69a7-45be-9f28-dff8940eb51f": { id: "onlivetv3", name: "ONLiveTV3" },
    "afb95e22-13a1-4371-bb07-e14d97054c0b": { id: "onlivetv2", name: "ONLiveTV2" },
    "7c2426a6-dfcf-4b15-bfce-e2ce5e1e3e67": { id: "onlivetv1", name: "ONLiveTV1" }
  };
  const dataAPI = await getAPI("https://re.ghiminh1.workers.dev/?url=https://tv-web.api.vinasports.com.vn/api/v2/publish/see-more/events/2")
  let data = [];
  function getBetweenSlash(url) {
    const parts = url.split('/');
    return parts[4];
  }

  if (Array.isArray(dataAPI.data) && dataAPI.data.length > 0) {
    data = dataAPI.data
      .filter(i => !backListChannel.includes(i.channel_id) && i.channel_id !== "")
      .map(i => ({
        id: `onplus-${i.id}`,
        name: i.name,
        start_time: formatDateGMT7(i.start_time),
        over_time: formatDateGMT7(i.over_time),
        thumbnail: i.thumbnail,
        channel_id: whiteListChannel[i.channel_id]?.id || i.channel_id,
        channel_name: whiteListChannel[i.channel_id]?.name || i.channel_id,
        status: matchValue(i.status, ["live", "not_started"], [1, 0])
      }));
  }

  return {
    src: "ONPlus",
    data: data
  };

}



async function tv360() {
  const backListChannel = []
  function formatDateTime(str) {
    const [date, time] = str.split(" ");
    const [year, month, day] = date.split("-");
    const [hour, minute] = time.split(":");

    return `${day}:${month}:${year.slice(2)}-${hour}:${minute}`;
  }
  const whiteListChannel = {
    "20": { "id": "antvhd", "name": "ANTV" },
    "19": { "id": "qpvnhd", "name": "QPVN" },
    "2": { "id": "vtv1hd", "name": "VTV1" },
    "3": { "id": "vtv2hd", "name": "VTV2" },
    "4": { "id": "vtv3hd", "name": "VTV3" },
    "108": { "id": "vtv4hd", "name": "VTV4" },
    "110": { "id": "vtv5hd", "name": "VTV5" },
    "157": { "id": "vtv5hdtnb", "name": "VTV5 Tây Nam Bộ" },
    "207": { "id": "vtv5hdtn", "name": "VTV5 Tây Nguyên" },
    "6": { "id": "vtv7hd", "name": "VTV7" },
    "115": { "id": "vtv8hd", "name": "VTV8" },
    "8": { "id": "vtv9hd", "name": "VTV9" },
    "98": { "id": "vtv10hd", "name": "VTV Cần Thơ" },
    "9951": { "id": "vietnamtoday", "name": "Vietnam Today" },
    "173": { "id": "onsports", "name": "ON Sports" },
    "183": { "id": "onsportsplus", "name": "ON Sports+" },
    "170": { "id": "onsportsnews", "name": "ON Sports News" },
    "174": { "id": "onfootball", "name": "ON Football" },
    "169": { "id": "ongolf", "name": "ON Golf" },
    "180": { "id": "onviegiaitri", "name": "ON Vie Giải Trí" },
    "177": { "id": "onviedramas", "name": "ON Vie Dramas" },
    "175": { "id": "onphimviet", "name": "ON Phim Việt" },
    "176": { "id": "oncine", "name": "ON Cine" },
    "181": { "id": "onmovies", "name": "ON Movies - YouTV" },
    "182": { "id": "onechannel", "name": "ON Echannel" },
    "136": { "id": "ono2tv", "name": "ON O2TV" },
    "178": { "id": "onbibi", "name": "ON Bibi" },
    "179": { "id": "onkids", "name": "ON Kids" },
    "189": { "id": "oninfotv", "name": "ON Info TV" },
    "184": { "id": "onstyle", "name": "ON Style TV" },
    "185": { "id": "onmusic", "name": "ON Music" },
    "186": { "id": "ontrending", "name": "ON Trending TV" },
    "187": { "id": "onvfamily", "name": "ON VFamily" },
    "188": { "id": "onlife", "name": "ON Life" },
    "151": { "id": "btv9bchannel", "name": "BTV9 - Bchannel" },
    "201": { "id": "sctv2hd", "name": "SCTV2 TodayTV" },
    "232": { "id": "sctv6hd", "name": "SCTV6 FIM360" },
    "190": { "id": "htv1", "name": "HTV1" },
    "191": { "id": "htv2hd", "name": "HTV2 - Vie Channel" },
    "192": { "id": "htv3", "name": "HTV3" },
    "9": { "id": "htv4", "name": "HTV 4" },
    "193": { "id": "htv7hd", "name": "HTV7" },
    "194": { "id": "htv9hd", "name": "HTV9" },
    "14": { "id": "htvccanhachd", "name": "HTVC CA NHẠC" },
    "133": { "id": "htvcdulichhd", "name": "HTVC DL&CS" },
    "11": { "id": "htvcgiadinhhd", "name": "HTVC GIA ĐÌNH" },
    "15": { "id": "htvcphimhd", "name": "HTVC PHIM" },
    "12": { "id": "htvcphunuhd", "name": "HTVC PHỤ NỮ" },
    "132": { "id": "htvcplushd", "name": "HTVC PLUS" },
    "195": { "id": "htvthethaohd", "name": "HTVC THỂ THAO" },
    "13": { "id": "htvcthuanviet", "name": "HTVC THUẦN VIỆT" },
    "66": { "id": "angiang1", "name": "ATV1" },
    "35": { "id": "angiang2", "name": "ATV2" },
    "39": { "id": "bacninh", "name": "Bắc Ninh" },
    "46": { "id": "camau", "name": "Cà Mau" },
    "48": { "id": "caobang", "name": "Cao Bằng" },
    "47": { "id": "cantho1", "name": "Cần Thơ 1" },
    "61": { "id": "cantho2", "name": "Cần Thơ 2" },
    "84": { "id": "cantho3", "name": "Cần Thơ 3" },
    "49": { "id": "danang1", "name": "Đà Nẵng 1" },
    "80": { "id": "danang2", "name": "Đà Nẵng 2" },
    "51": { "id": "daklak", "name": "Đắk Lắk" },
    "52": { "id": "dienbien", "name": "Điện Biên" },
    "53": { "id": "dongnai1", "name": "Đồng Nai 1" },
    "255": { "id": "dongnai2", "name": "Đồng Nai 2" },
    "54": { "id": "dongthap1", "name": "Đồng Tháp 1" },
    "90": { "id": "dongthap2", "name": "Đồng Tháp 2 - Miền Tây" },
    "55": { "id": "gialai", "name": "Gia Lai" },
    "33": { "id": "hanoi1", "name": "Hà Nội 1" },
    "34": { "id": "hanoi2", "name": "Hà Nội 2" },
    "32": { "id": "hitv", "name": "HiTV" },
    "31": { "id": "youtv", "name": "You TV" },
    "58": { "id": "hatinh", "name": "Hà tĩnh" },
    "59": { "id": "haiphong3", "name": "Hải Phòng 3" },
    "60": { "id": "haiphong", "name": "Hải Phòng" },
    "159": { "id": "cinemaworldhd", "name": "CinemaWorld" },
    "63": { "id": "hue", "name": "HUETV" },
    "64": { "id": "hungyen", "name": "Hưng Yên" },
    "65": { "id": "khanhhoa", "name": "KTV" },
    "76": { "id": "khanhhoa1", "name": "KTV1" },
    "68": { "id": "laichau", "name": "LTV" },
    "70": { "id": "langson", "name": "LSTV" },
    "71": { "id": "laocai", "name": "THLC" },
    "69": { "id": "lamdong1", "name": "LTV1" },
    "45": { "id": "lamdong2", "name": "LTV2" },
    "74": { "id": "nghean", "name": "NTV" },
    "75": { "id": "ninhbinh", "name": "NBTV" },
    "77": { "id": "phutho", "name": "PTV" },
    "81": { "id": "quangngai", "name": "QNgTV 1" },
    "82": { "id": "quangninh1", "name": "QTV1" },
    "134": { "id": "quangninh3", "name": "QTV3" },
    "83": { "id": "quangtri", "name": "QTTV" },
    "85": { "id": "sonla", "name": "STV" },
    "72": { "id": "tayninh1", "name": "TTV" },
    "89": { "id": "thanhhoa", "name": "TTV" },
    "88": { "id": "thainguyen", "name": "TN" },
    "92": { "id": "tuyenquang", "name": "TTV" },
    "25": { "id": "vinhlong1hd", "name": "THVL1" },
    "26": { "id": "vinhlong2hd", "name": "THVL2" },
    "219": { "id": "vinhlong3hd", "name": "THVL3" },
    "220": { "id": "vinhlong4hd", "name": "THVL4" },
    "91": { "id": "vinhlong5hd", "name": "THVL5" },
    "271": { "id": "hbohd", "name": "HBO" },
    "111": { "id": "arirang", "name": "Arirang" },
    "277": { "id": "cartoonhd", "name": "Cartoon Network" },
    "112": { "id": "cna", "name": "Channel News Asia (CNA)" },
    "239": { "id": "cinemaxhd", "name": "Cinemax" },
    "9855": { "id": "cnbc", "name": "CNBC" },
    "214": { "id": "davinci", "name": "Da Vinci" },
    "279": { "id": "discoveryhd", "name": "Discovery" },
    "235": { "id": "dreamworks", "name": "DreamWorks" },
    "96": { "id": "france24eng", "name": "France 24" },
    "99": { "id": "hgtv", "name": "HGTV" },
    "9856": { "id": "historyhd", "name": "History" },
    "213": { "id": "kbsworld", "name": "KBS World" },
    "9901": { "id": "kix", "name": "KIX" },
    "106": { "id": "nhkworld", "name": "NHK World" },
    "216": { "id": "outdoorhd", "name": "Outdoor Channel" },
    "273": { "id": "warnertvhd", "name": "Warner TV" },
    "281": { "id": "anxhd", "name": "ANX" },
    "283": { "id": "abcaustralia", "name": "ABC Australia" },
    "237": { "id": "bloomberg", "name": "Bloomberg" },
    "275": { "id": "cnn", "name": "CNN" },
    "163": { "id": "fashionhd", "name": "Fashion TV" },
    "9904": { "id": "tv360promo", "name": "TV360Promo" },
    "9888": { "id": "tv360live", "name": "TV360Live" },
    "2554": { "id": "tv360plus1", "name": "TV360P1" },
    "1": { "id": "tv360plus2", "name": "TV360P2" },
    "148": { "id": "tv360plus3", "name": "TV360P3" },
    "2458": { "id": "tv360plus4", "name": "TV360P4" },
    "9867": { "id": "tv360plus5", "name": "TV360P5" },
    "9868": { "id": "tv360plus6", "name": "TV360P6" },
    "9869": { "id": "tv360plus7", "name": "TV360P7" },
    "9870": { "id": "tv360plus8", "name": "TV360P8" },
    "9887": { "id": "tv360plus9", "name": "TV360p9" },
    "9957": { "id": "tv360plus10", "name": "TV360p10" },
    "9958": { "id": "tv360plus11", "name": "TV360p11" },
    "10001": { "id": "tv360plus12", "name": "TV360P12" }
  };

  const CTTH = await getAPI
    ("https://re.ghiminh1.workers.dev/?url=https%3A%2F%2Ftv360.vn%2Fpublic%2Fv1%2Fwatch-log%2Fget-recommend%3Fid%3Drcm_program_playing%26page%3Dhome%26itemType%3DLIVE_NOW%26boxType%3DRECOMMEND%26offset%3D0%26limit%3D2000")
  const TT = await getAPI
    ("https://re.ghiminh1.workers.dev/?url=https%3A%2F%2Ftv360.vn%2Fpublic%2Fv1%2Fwatch-log%2Fget-recommend%3Fid%3Drcm_live_now%26page%3Dhome%26itemType%3DLIVE_NOW%26boxType%3DRECOMMEND%26offset%3D0%26limit%3D2000")
  const dataAPI = [...CTTH.data.content, ...TT.data.content]
  let data = []
  if (Array.isArray(dataAPI) && dataAPI.length > 0) {
    data = dataAPI
      .filter(i => !backListChannel.includes(i.itemId))
      .map(i => ({
        id: `tv360-${i.id}`,
        name: i.description,
        start_time: formatDateTime(i.beginTime),
        over_time: formatDateTime(i.endTime),
        thumbnail: i.coverImage,
        channel_id: whiteListChannel[i.itemId]?.id || i.itemId,
        channel_name: whiteListChannel[i.itemId]?.name || "",
        status: checkTimeStatus(formatDateTime(i.beginTime), formatDateTime(i.endTime))
      }));
  }


  return {
    src: "TV360",
    data: data
  }
}

async function mytv(page = 1, num = 20) {
  const url = `https://webapi.mytv.vn/api/v1/home/cate-info/su-kien-truc-tiep?page=${page}&num=${num}`;
  const url2 = `https://webapi.mytv.vn/api/v1/home/cate-info/chuong-trinh-truyen-hinh?page=${page}&num=${num}`;
  const response1 = await fetch(url, {
    method: "GET",
    headers: {
      "Origin": "https://mytv.com.vn",
      "Referer": "https://mytv.com.vn/",
      "User-Agent": "Mozilla/5.0",
      "Accept": "application/json, text/plain, */*"
    }
  });
  const response2 = await fetch(url2, {
    method: "GET",
    headers: {
      "Origin": "https://mytv.com.vn",
      "Referer": "https://mytv.com.vn/",
      "User-Agent": "Mozilla/5.0",
      "Accept": "application/json, text/plain, */*"
    }
  });

  if (!response1.ok && !response2.ok) {
    throw new Error(`HTTP error ${response1.status}${response2.status}`);
  }


  const API1 = await response1.json();
  const API2 = await response2.json();
  const dataAPI = [...API1.data.data, ...API2.data.data]


  const whiteListChannel = {

    "766": {
      id: "sctvhdpth",
      name: "SCTV Phim Tổng hợp"
    },
    "769": {
      id: "sctv1hd",
      name: "SCTV1 Hài"
    },
    "772": {
      id: "sctv2hd",
      name: "SCTV2 TodayTV"
    },
    "775": {
      id: "sctv3hd",
      name: "SCTV3 SeeTV"
    },
    "778": {
      id: "sctv4hd",
      name: "SCTV 4"
    },
    "781": {
      id: "sctv6hd",
      name: "SCTV6 FIM360"
    },
    "784": {
      id: "sctv7hd",
      name: "SCTV7 SHOW TV"
    },
    "787": {
      id: "sctv8hd",
      name: "SCTV8 VITV"
    },
    "790": {
      id: "sctv9hd",
      name: "SCTV9 Kinh Tế Thị Trường"
    },
    "793": {
      id: "sctv11hd",
      name: "SCTV11 TV STAR"
    },
    "796": {
      id: "sctv12hd",
      name: "SCTV12 Du Lịch Khám Phá"
    },
    "799": {
      id: "sctv13hd",
      name: "SCTV13 Phụ Nữ & Gia Đình"
    },
    "823": {
      id: "sctv15hd",
      name: "SCTV15 SPORT2"
    },
    "826": {
      id: "sctv17hd",
      name: "SCTV17 SPORT"
    },
    "808": {
      id: "sctv18hd",
      name: "SCTV18"
    },
    "811": {
      id: "sctv19hd",
      name: "SCTV19 Channel T"
    },
    "814": {
      id: "sctv20hd",
      name: "SCTV20 Kênh Ca nhạc"
    },
    "817": {
      id: "sctv21hd",
      name: "SCTV21 Việt Nam Ký Ức"
    },
    "829": {
      id: "sctv22hd",
      name: "SCTV22 SSPORT1"
    },
    "632": {
      id: "spotv1",
      name: "SPOTV"
    },
    "633": {
      id: "spotv2",
      name: "SPOTV2"
    }

  }

  function formatDate(input) {
    const date = new Date(input.replace(" ", "T"));

    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yy = String(date.getFullYear()).slice(-2);
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");

    return `${dd}:${mm}:${yy}-${hh}:${min}`;
  }
  let data = []
  if (Array.isArray(dataAPI) && dataAPI.length > 0) {

    data = dataAPI
      .filter(i => Object.hasOwn(whiteListChannel, String(i.CHANNEL_ID)))
      .map(i => ({
        id: `mytv-${i.CONTENT_ID}`,
        name: i.CONTENT_NAME,
        start_time: formatDate(i.START_TIME),
        over_time: formatDate(i.END_TIME),
        thumbnail: i.CONTENT_HOR_POSTER,
        channel_id: whiteListChannel[String(i.CHANNEL_ID)]?.id || "",
        channel_name: whiteListChannel[String(i.CHANNEL_ID)]?.name || "",
        status: checkTimeStatus(formatDate(i.START_TIME), formatDate(i.END_TIME))
      }));
  }




  return {
    src: "MYTV",
    data: data
  };
}



// https://andanh.site/proxyipvn.php?url=https://api.fptplay.net/api/v7.1_ios/playos/block/highlight/632f01322089bd00e5c5ed3d?block_type=horizontal_slider&page_index=1&page_size=1000
async function FPTPlay() {
  const API = await getAPI("https://re.ghiminh1.workers.dev/?url=https://andanh.site/proxyipvn.php?url=https://api.fptplay.net/api/v7.1_ios/playos/block/highlight/632f01322089bd00e5c5ed3d?block_type=horizontal_slider&page_index=1&page_size=1000")
  const data = API.data.map(i => {
    console.log(formatTimeVN(i.begin_time))
    return {
      id: `fptplay-${i.id}`,
      name: i.title,
      start_time: formatTimeVN(i.begin_time),
      over_time:  formatTimeVN(i.end_time),
      thumbnail: i.image.landscape_title,
      channel_id: "fpt" + i.id.replace(/-/g, ""),
      channel_name: "fpt-" + i.id,
      status: checkTimeStatus(formatTimeVN(i.begin_time), formatTimeVN(i.end_time))
    }
  })
  return {
    src: "FPTPLAY",
    data: data
  };
}
// console.log(formatTimeVN(1775091300));


function sortByStartTime(arr) {
  function toTimestamp(str) {
    if (!str || typeof str !== "string") return 0; // tránh crash

    const [datePart, timePart] = str.split("-");
    if (!datePart || !timePart) return 0;

    const [dd, mm, yy] = datePart.split(":").map(Number);
    const [hh, min] = timePart.split(":").map(Number);

    return Date.UTC(2000 + yy, mm - 1, dd, hh, min);
  }

  return [...arr].sort((a, b) => {
    return toTimestamp(a.start_time) - toTimestamp(b.start_time);
  });
}
function filterDuplicatePrograms(data) {
  const uniqueMap = new Map();

  data.forEach(item => {
    // Tạo một key kết hợp từ 3 thuộc tính để định danh duy nhất
    const key = `${item.channel_id}|${item.start_time}|${item.over_time}`;

    // Nếu key này chưa tồn tại trong Map thì mới thêm vào
    // (Giữ lại phần tử đầu tiên tìm thấy)
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, item);
    }
  });

  // Chuyển Map values trở lại thành Array
  return Array.from(uniqueMap.values());
}

// Sử dụng:
const rawData = [ /* mảng dữ liệu của bạn */];
const filteredData = filterDuplicatePrograms(rawData);
console.log(filteredData);



async function data() {
  // 1. Chạy tất cả các hàm cùng một lúc (Song song)
  // Promise.allSettled sẽ đợi tất cả chạy xong dù có lỗi hay thành công
  const results = await Promise.allSettled([
    tv360(),
    onplus(),
    mytv(),
    FPTPlay(),
    getGoogleSheetData(),
  ]);

  // 2. Phân rã kết quả theo thứ tự mảng đã truyền vào
  const [resTv360, resOnplus, resMytv, resFPTPlay, resSheet] = results;

  // 3. Hàm phụ trợ để lấy dữ liệu an toàn
  // Nếu status là 'fulfilled' (thành công) thì lấy data, nếu lỗi thì trả về mảng rỗng [] hoặc null
  const getSafeData = (res) => (res.status === 'fulfilled' && res.value?.data) ? res.value.data : [];
  const getSafeSrc = (res) => (res.status === 'fulfilled' && res.value?.src) ? res.value.src : null;

  // Lấy danh sách data (nếu lỗi sẽ là mảng rỗng để không bị lỗi khi spread [...])
  const listTv360 = getSafeData(resTv360);
  const listOnplus = getSafeData(resOnplus);
  const listMytv = getSafeData(resMytv);
  const listFPTPlay = getSafeData(resFPTPlay);
  const listSheet = getSafeData(resSheet); // Giả sử sheet cũng trả về object có .data

  // Lấy src
  const srcTv360 = getSafeSrc(resTv360);
  const srcOnplus = getSafeSrc(resOnplus);
  const srcMytv = getSafeSrc(resMytv);
  const srcFPTPlay = getSafeSrc(resFPTPlay);

  // Debug lỗi (tùy chọn: để biết cái nào bị lỗi)
  if (resTv360.status === 'rejected') console.error('TV360 Error:', resTv360.reason);
  if (resOnplus.status === 'rejected') console.error('OnPlus Error:', resOnplus.reason);
  // ...

  // 4. Gộp dữ liệu
  const combinedData = [...listOnplus, ...listFPTPlay, ...listMytv, ...listTv360];

  const src = [
    [srcTv360],
    [srcOnplus],
    [srcMytv],
    [srcFPTPlay]
  ];

  return {
    src: src,
    broadCast: filterDuplicatePrograms(sortByStartTime(combinedData)) || [],
    liveThumB: listSheet || []
  };
}




