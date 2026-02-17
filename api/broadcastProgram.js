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
    "https://onsportlive.vtvcab.vn/hls/ONQUOCPHONG_CL", // => qpvn
    "https://onsportlive.vtvcab.vn/hls/ONANTV_CL", // => antv
    "VTV1_HD_CL", // => vtv1
    "OS_VTV5", // => vtv5
    "eddd7b89-1a5e-44ca-98f3-d6aa993e0bf9", //  => sctv15
    "a595913f-5b14-42ef-9958-74aa993e0bf9", //  => sctv17
    "d210302f-b013-41e4-8b16-ecaa993e0bf9", //  => htvkey
  ]

  const whiteListChannel = {

    "OS_BONGDA_HD": {
      id: "onfootball",
      name: "ON Football"
    },
    "OS_THETHAO_TINTUC_HD": {
      id: "onsportsnews",
      name: "ON Sportsnews"
    },
    "OS_THETHAO_HD": {
      id: "onsports",
      name: "ON Sports"
    },
    "OS_HAY_TV": {
      id: "onsportsplus",
      name: "ON Sportsplus"
    },
    "OS_THETHAO_GOLF_HD": {
      id: "ongolf",
      name: "ON Golf"
    },
    "OS_ONSPORT1": {
      id: "onsport1",
      name: "ONSport 1"
    },
    "OS_ONSPORT2": {
      id: "onsport2",
      name: "ONSport 2"
    },
    "OS_ONSPORT3": {
      id: "onsport3",
      name: "ONSport 3"
    },
    "OS_ONSPORT4": {
      id: "onsport4",
      name: "ONSport 4"
    },
    "OS_ONSPORT5": {
      id: "onsport5",
      name: "ONSport 5"
    },
    "OS_ONSPORT6": {
      id: "onsport6",
      name: "ONSport 6"
    },
    "OS_ONSPORT7": {
      id: "onsport7",
      name: "ONSport 7"
    },
    "OS_ONSPORT8": {
      id: "onsport8",
      name: "ONSport 8"
    },
    "OS_ONSPORT9": {
      id: "onsport9",
      name: "ONSport 9"
    },
    "OS_ONSPORT10": {
      id: "onplus10",
      name: "ONSport 10"
    },
    "SKTTONSPORT11": {
      id: "onsport11",
      name: "ONSport 11"
    },
    "SKTTONSPORT12": {
      id: "onsport12",
      name: "ONSport 12"
    },
    "SKTTONSPORT13": {
      id: "onsport13",
      name: "ONSport 13"
    },
    "SKTTONSPORT14": {
      id: "onsport14",
      name: "ONSport 14"
    },
    "SKTTONSPORT15": {
      id: "onsport15",
      name: "ONSport 15"
    },
    "SKTTONSPORT16": {
      id: "onsport16",
      name: "ONSport 16"
    },
    

  }



  const dataAPI = await getAPI("https://re.ghiminh1.workers.dev/?url=https://tv-web.api.vinasports.com.vn/api/v2/publish/see-more/events/2")
  let data = [];
function getBetweenSlash(url) {
  const parts = url.split('/');
  return parts[4]; 
}

  if (Array.isArray(dataAPI.data) && dataAPI.data.length > 0) {
    data = dataAPI.data
      .filter(i => !backListChannel.includes(getBetweenSlash(i.url)) && getBetweenSlash(i.url) !== "")
      .map(i => ({
        id: `onplus-${i.id}`,
        name: i.name,
        start_time: formatDateGMT7(i.start_time),
        over_time: formatDateGMT7(i.over_time),
        thumbnail: i.thumbnail,
        channel_id: whiteListChannel[getBetweenSlash(i.url)]?.id || "",
        channel_name: whiteListChannel[getBetweenSlash(i.url)]?.name || "",
        status: matchValue(i.status, ["live", "not_started"], [1, 0])
      }));
  }

  return {
    src: "ONPlus",
    data: data
  };

}


async function tv360() {
  const backListChannel = [
    173,//     => onsports
    183,//     => onsportsplus
    170,//     => onsportsnews
    174,//     => onfootball
    169,//     => ongolf
    2554, //   => TV360p1
    1,    //	=> TV360p2
    148,  //	=> TV360p3
    2458,  //	=> TV360p4
    9867,  //	=> TV360p5
    9868,  //	=> TV360p6
    9869,  //	=> TV360p7
    9870,  //	=> TV360p8
  ]





  function formatDateTime(str) {
    const [date, time] = str.split(" ");
    const [year, month, day] = date.split("-");
    const [hour, minute] = time.split(":");

    return `${day}:${month}:${year.slice(2)}-${hour}:${minute}`;
  }
  const whiteListChannel = {
    "20": {
      "id": "antv",
      "name": "ANTV"
    },
    "19": {
      "id": "qpvn",
      "name": "QPVN"
    },
    "2": {
      "id": "vtv1",
      "name": "VTV1"
    },
    "3": {
      "id": "vtv2",
      "name": "VTV2"
    },
    "4": {
      "id": "vtv3",
      "name": "VTV3"
    },
    "108": {
      "id": "vtv4",
      "name": "VTV4"
    },
    "110": {
      "id": "vtv5",
      "name": "VTV5"
    },
    "157": {
      "id": "vtv5tnb",
      "name": "VTV5 Tây Nam Bộ"
    },
    "207": {
      "id": "vtv5tn",
      "name": "VTV5 Tây Nguyên"
    },
    "6": {
      "id": "vtv7",
      "name": "VTV7"
    },
    "115": {
      "id": "vtv8",
      "name": "VTV8"
    },
    "8": {
      "id": "vtv9",
      "name": "VTV9"
    },
    "98": {
      "id": "vtvct",
      "name": "VTV Cần Thơ"
    },
    "9951": {
      "id": "vietnamtoday",
      "name": "Vietnam Today"
    },
    "180": {
      "id": "onviegiaitri",
      "name": "ON Vie Giải Trí"
    },
    "177": {
      "id": "onviedramas",
      "name": "ON Vie Dramas"
    },
    "175": {
      "id": "onphimviet",
      "name": "ON Phim Việt"
    },
    "176": {
      "id": "oncine",
      "name": "ON Cine"
    },
    "181": {
      "id": "onmoviesyoutv",
      "name": "ON Movies - YouTV"
    },
    "182": {
      "id": "onechannel",
      "name": "ON Echannel"
    },
    "136": {
      "id": "ono2tv",
      "name": "ON O2TV"
    },
    "178": {
      "id": "onbibi",
      "name": "ON Bibi"
    },
    "179": {
      "id": "onkids",
      "name": "ON Kids"
    },
    "189": {
      "id": "oninfotv",
      "name": "ON Info TV"
    },
    "184": {
      "id": "onstyletv",
      "name": "ON Style TV"
    },
    "185": {
      "id": "onmusic",
      "name": "ON Music"
    },
    "186": {
      "id": "ontrendingtv",
      "name": "ON Trending TV"
    },
    "187": {
      "id": "onvfamily",
      "name": "ON VFamily"
    },
    "188": {
      "id": "onlife",
      "name": "ON Life"
    },
    "151": {
      "id": "btv9bchannel",
      "name": "BTV9 - Bchannel"
    },
    "201": {
      "id": "sctv2",
      "name": "SCTV2 TodayTV"
    },
    "232": {
      "id": "sctv6",
      "name": "SCTV6 FIM360"
    },
    "190": {
      "id": "htv1",
      "name": "HTV1"
    },
    "191": {
      "id": "htv2viechannel",
      "name": "HTV2 - Vie Channel"
    },
    "192": {
      "id": "htv3",
      "name": "HTV3"
    },
    "9": {
      "id": "htvkey",
      "name": "HTV Key"
    },
    "193": {
      "id": "htv7",
      "name": "HTV7"
    },
    "194": {
      "id": "htv9",
      "name": "HTV9"
    },
    "14": {
      "id": "htvccanhac",
      "name": "HTVC CA NHẠC"
    },
    "133": {
      "id": "htvcdlcs",
      "name": "HTVC DL&CS"
    },
    "11": {
      "id": "htvcgiadinh",
      "name": "HTVC GIA ĐÌNH"
    },
    "15": {
      "id": "htvcphim",
      "name": "HTVC PHIM"
    },
    "12": {
      "id": "htvcphunu",
      "name": "HTVC PHỤ NỮ"
    },
    "132": {
      "id": "htvcplus",
      "name": "HTVC PLUS"
    },
    "195": {
      "id": "htvcthethao",
      "name": "HTVC THỂ THAO"
    },
    "13": {
      "id": "htvcthuanviet",
      "name": "HTVC THUẦN VIỆT"
    },
    "66": {
      "id": "atv1",
      "name": "ATV1"
    },
    "35": {
      "id": "atv2",
      "name": "ATV2"
    },
    "39": {
      "id": "btv",
      "name": "BTV"
    },
    "46": {
      "id": "ctv",
      "name": "CTV"
    },
    "48": {
      "id": "crtv",
      "name": "CRTV"
    },
    "47": {
      "id": "cantho1",
      "name": "Cần Thơ 1"
    },
    "61": {
      "id": "cantho2",
      "name": "Cần Thơ 2"
    },
    "84": {
      "id": "cantho3",
      "name": "Cần Thơ 3"
    },
    "49": {
      "id": "dnrt1",
      "name": "DNRT1"
    },
    "80": {
      "id": "dnrt2",
      "name": "DNRT2"
    },
    "51": {
      "id": "drt",
      "name": "DRT"
    },
    "52": {
      "id": "dtv",
      "name": "ĐTV"
    },
    "53": {
      "id": "dn1nrtv",
      "name": "ĐN1-NRTV"
    },
    "255": {
      "id": "dn2nrtv",
      "name": "ĐN2-NRTV"
    },
    "54": {
      "id": "thdt1",
      "name": "THĐT1"
    },
    "90": {
      "id": "thdt2mientay",
      "name": "THĐT2 - Miền Tây"
    },
    "55": {
      "id": "gtv",
      "name": "GTV"
    },
    "33": {
      "id": "h1",
      "name": "H1"
    },
    "34": {
      "id": "h2",
      "name": "H2"
    },
    "32": {
      "id": "hitv",
      "name": "HiTV"
    },
    "31": {
      "id": "youtv",
      "name": "You TV"
    },
    "58": {
      "id": "bhttv",
      "name": "BHTTV"
    },
    "60": {
      "id": "thp",
      "name": "THP"
    },
    "159": {
      "id": "cinemaworld",
      "name": "CinemaWorld"
    },
    "63": {
      "id": "huetv",
      "name": "HUETV"
    },
    "64": {
      "id": "hytv",
      "name": "HYTV"
    },
    "65": {
      "id": "ktv1",
      "name": "KTV1"
    },
    "68": {
      "id": "ltv",
      "name": "LTV"
    },
    "70": {
      "id": "lstv",
      "name": "LSTV"
    },
    "71": {
      "id": "thlc",
      "name": "THLC"
    },
    "69": {
      "id": "ltv1",
      "name": "LTV1"
    },
    "45": {
      "id": "ltv2",
      "name": "LTV2"
    },
    "50": {
      "id": "ltv3",
      "name": "LTV3"
    },
    "74": {
      "id": "ntv",
      "name": "NTV"
    },
    "75": {
      "id": "nbtv",
      "name": "NBTV"
    },
    "77": {
      "id": "ptv",
      "name": "PTV"
    },
    "81": {
      "id": "qngtv1",
      "name": "QNgTV 1"
    },
    "82": {
      "id": "qtv1",
      "name": "QTV1"
    },
    "134": {
      "id": "qtv3",
      "name": "QTV3"
    },
    "83": {
      "id": "qttv",
      "name": "QTTV"
    },
    "85": {
      "id": "stv",
      "name": "STV"
    },
    "72": {
      "id": "tayninhtv",
      "name": "TTV"
    },
    "89": {
      "id": "ttv",
      "name": "TTV"
    },
    "88": {
      "id": "tn",
      "name": "TN"
    },
    "92": {
      "id": "ttv",
      "name": "TTV"
    },
    "25": {
      "id": "thvl1",
      "name": "THVL1"
    },
    "26": {
      "id": "thvl2",
      "name": "THVL2"
    },
    "219": {
      "id": "thvl3",
      "name": "THVL3"
    },
    "220": {
      "id": "thvl4",
      "name": "THVL4"
    },
    "91": {
      "id": "thvl5",
      "name": "THVL5"
    },
    "271": {
      "id": "hbo",
      "name": "HBO"
    },
    "111": {
      "id": "arirang",
      "name": "Arirang"
    },
    "277": {
      "id": "cartoonnetwork",
      "name": "Cartoon Network"
    },
    "112": {
      "id": "channelnewsasiacna",
      "name": "Channel News Asia (CNA)"
    },
    "239": {
      "id": "cinemax",
      "name": "Cinemax"
    },
    "9855": {
      "id": "cnbc",
      "name": "CNBC"
    },
    "214": {
      "id": "davinci",
      "name": "Da Vinci"
    },
    "279": {
      "id": "discovery",
      "name": "Discovery"
    },
    "235": {
      "id": "dreamworks",
      "name": "DreamWorks"
    },
    "96": {
      "id": "france24",
      "name": "France 24"
    },
    "99": {
      "id": "hgtv",
      "name": "HGTV"
    },
    "9856": {
      "id": "history",
      "name": "History"
    },
    "213": {
      "id": "kbsworld",
      "name": "KBS World"
    },
    "9901": {
      "id": "kix",
      "name": "KIX"
    },
    "106": {
      "id": "nhkworld",
      "name": "NHK World"
    },
    "216": {
      "id": "outdoorchannel",
      "name": "Outdoor Channel"
    },
    "273": {
      "id": "warnertv",
      "name": "Warner TV"
    },
    "281": {
      "id": "anx",
      "name": "ANX"
    },
    "283": {
      "id": "abcaustralia",
      "name": "ABC Australia"
    },
    "237": {
      "id": "bloomberg",
      "name": "Bloomberg"
    },
    "275": {
      "id": "cnn",
      "name": "CNN"
    },
    "163": {
      "id": "fashiontv",
      "name": "Fashion TV"
    },
    "9904": {
      "id": "tv360promo",
      "name": "TV360Promo"
    },
    "9888": {
      "id": "tv360live",
      "name": "TV360Live"
    },
    "9887": {
      "id": "TV360p9",
      "name": "TV360p9"
    },
    "9957": {
      "id": "TV360p10",
      "name": "TV360p10"
    },
    "9958": {
      "id": "TV360p11",
      "name": "TV360p11"
    }
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
        over_time:  formatDateTime(i.endTime),
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

async function mytv(page = 1, num = 4000) {
  const url = `https://webapi.mytv.vn/api/v1/home/cate-info/su-kien-truc-tiep?page=${page}&num=${num}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Origin": "https://mytv.com.vn",
      "Referer": "https://mytv.com.vn/",
      "User-Agent": "Mozilla/5.0",
      "Accept": "application/json, text/plain, */*"
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }

  const dataAPI = await response.json();


  const whiteListChannel = {

    "766": {
      id: "sctv0",
      name: "SCTV Phim Tổng hợp"
    },
    "769": {
      id: "sctv1",
      name: "SCTV1 Hài"
    },
    "772": {
      id: "sctv2",
      name: "SCTV2 TodayTV"
    },
    "775": {
      id: "sctv3",
      name: "SCTV3 SeeTV"
    },
    "778": {
      id: "sctv4",
      name: "SCTV 4"
    },
    "781": {
      id: "sctv6",
      name: "SCTV6 FIM360"
    },
    "784": {
      id: "sctv7",
      name: "SCTV7 SHOW TV"
    },
    "787": {
      id: "sctv8",
      name: "SCTV8 VITV"
    },
    "790": {
      id: "sctv9",
      name: "SCTV9 Kinh Tế Thị Trường"
    },
    "793": {
      id: "sctv11",
      name: "SCTV11 TV STAR"
    },
    "796": {
      id: "sctv12",
      name: "SCTV12 Du Lịch Khám Phá"
    },
    "799": {
      id: "sctv13",
      name: "SCTV13 Phụ Nữ & Gia Đình"
    },
    "823": {
      id: "sctv15",
      name: "SCTV15 SPORT2"
    },
    "826": {
      id: "sctv17",
      name: "SCTV17 SPORT"
    },
    "808": {
      id: "sctv18",
      name: "SCTV18"
    },
    "811": {
      id: "sctv19",
      name: "SCTV19 Channel T"
    },
    "814": {
      id: "sctv20",
      name: "SCTV20 Kênh Ca nhạc"
    },
    "817": {
      id: "sctv21",
      name: "SCTV21 Việt Nam Ký Ức"
    },
    "829": {
      id: "sctv22",
      name: "SCTV22 SSPORT1"
    },
    "632": {
      id: "spotv",
      name: "SPOTV"
    },
    "633": {
      id: "spotv2",
      name: "SPOTV2"
    },

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
  if (Array.isArray(dataAPI.data.data) && dataAPI.data.data.length > 0) {
  
     data = dataAPI.data.data
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

function sortByStartTime(arr) {
  function toTimestamp(str) {
    const [datePart, timePart] = str.split("-");
    const [dd, mm, yy] = datePart.split(":").map(Number);
    const [hh, min] = timePart.split(":").map(Number);

    return Date.UTC(2000 + yy, mm - 1, dd, hh, min);
  }

  return [...arr].sort((a, b) => {
    return toTimestamp(a.start_time) - toTimestamp(b.start_time);
  });
}



async function data() {
  const data_tv360 = await tv360()
  const data_onplus = await onplus()
  const data_mytv = await mytv()
  const data_sheet = await getGoogleSheetData()

  console.log(data_onplus.data)
  const data = [...data_onplus.data, ...data_mytv.data, ...data_tv360.data]
  const src =[
  [data_tv360.src],
  [data_onplus.src],
  [data_mytv.src]]

  return {
    src: src,
    broadCast: sortByStartTime(data),
    liveThumB: data_sheet.data

  };
}



