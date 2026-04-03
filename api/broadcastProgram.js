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
async function getGoogleSheetData(GID = "2134035673") {
  const sheetId = '1hSEcXxxEkbgq8203f_sTKAi3ZNEnFNoBnr7f3fsfzYE';
  const gid = GID;

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



async function get_id_channel() {
  const id_channels = await getGoogleSheetData("262192122")
  return id_channels.data.reduce((acc, item) => {
    const { APP, ID, IDCHANNEL, NAME } = item;

    // nếu chưa có APP thì tạo
    if (!acc[APP]) {
      acc[APP] = {};
    }

    // gán ID vào trong APP
    acc[APP][ID] = {
      id: IDCHANNEL,
      name: NAME
    };

    return acc;
  }, {});
}


async function data() {

  const idChannel = await get_id_channel()
  // console.log(idChannel.tv360)
  const results = await Promise.allSettled([
    tv360(idChannel.tv360),
    onplus(idChannel.onplus),
    mytv(idChannel.mytv),
    FPTPlay(idChannel.fptplay),
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




// =================================================================================================================================================================



async function onplus(idChannel) {
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


  const whiteListChannel = idChannel
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



async function tv360(idChannel) {
  const backListChannel = [];

  function formatDateTime(str) {
    const [date, time] = str.split(" ");
    const [year, month, day] = date.split("-");
    const [hour, minute] = time.split(":");

    return `${day}:${month}:${year.slice(2)}-${hour}:${minute}`;
  }

  const whiteListChannel = idChannel;

  // ================== CALL API ==================
  const [CTTH, TT] = await Promise.all([
    getAPI("https://re.ghiminh1.workers.dev/?url=https%3A%2F%2Ftv360.vn%2Fpublic%2Fv1%2Fwatch-log%2Fget-recommend%3Fid%3Drcm_program_playing%26page%3Dhome%26itemType%3DLIVE_NOW%26boxType%3DRECOMMEND%26offset%3D0%26limit%3D2000"),
    getAPI("https://re.ghiminh1.workers.dev/?url=https%3A%2F%2Ftv360.vn%2Fpublic%2Fv1%2Fwatch-log%2Fget-recommend%3Fid%3Drcm_live_now%26page%3Dhome%26itemType%3DLIVE_NOW%26boxType%3DRECOMMEND%26offset%3D0%26limit%3D2000")
  ]);

  const dataAPI = [
    ...(CTTH?.data?.content || []),
    ...(TT?.data?.content || [])
  ];

  let data = [];

  if (Array.isArray(dataAPI) && dataAPI.length > 0) {
    data = dataAPI
      .filter(i => i && !backListChannel.includes(i.itemId))
      .map(i => {
        const key = "tv360-" + String(i.itemId);

        return {
          id: `tv360-${i.id}`,
          name: i.description || "",
          start_time: formatDateTime(i.beginTime),
          over_time: formatDateTime(i.endTime),
          thumbnail: i.coverImage || "",

          // ✅ FIX CHÍNH Ở ĐÂY
          channel_id: whiteListChannel[key]?.id ?? i.itemId,

          channel_name:
            whiteListChannel[key]?.name ||
            whiteListChannel[i.itemId]?.name ||
            "",

          status: checkTimeStatus(
            formatDateTime(i.beginTime),
            formatDateTime(i.endTime)
          )
        };
      });
  }

  return {
    src: "TV360",
    data
  };
}

async function mytv(idChannel, page = 1, num = 20) {
  const headers = {
    "Origin": "https://mytv.com.vn",
    "Referer": "https://mytv.com.vn/",
    "User-Agent": "Mozilla/5.0",
    "Accept": "application/json, text/plain, */*"
  };

  const url1 = `https://webapi.mytv.vn/api/v1/home/cate-info/su-kien-truc-tiep?page=${page}&num=${num}`;
  const url2 = `https://webapi.mytv.vn/api/v1/home/cate-info/chuong-trinh-truyen-hinh?page=${page}&num=${num}`;

  // 🚀 gọi song song
  const [res1, res2] = await Promise.all([
    fetch(url1, { headers }),
    fetch(url2, { headers })
  ]);

  if (!res1.ok || !res2.ok) {
    throw new Error(`HTTP error: ${res1.status} - ${res2.status}`);
  }

  const [API1, API2] = await Promise.all([
    res1.json(),
    res2.json()
  ]);

  const dataAPI = [
    ...(API1?.data?.data || []),
    ...(API2?.data?.data || [])
  ];

  const whiteListChannel = idChannel;

  function formatDate(input) {
    const date = new Date(input.replace(" ", "T"));

    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yy = String(date.getFullYear()).slice(-2);
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");

    return `${dd}:${mm}:${yy}-${hh}:${min}`;
  }

  let data = [];

  if (Array.isArray(dataAPI) && dataAPI.length > 0) {
    data = dataAPI
      .map(i => {
        const key1 = String(i.CHANNEL_ID);        // dạng "766"
        const key2 = "mytv-" + key1;              // dạng "mytv-766"

        const channel =
          whiteListChannel[key2] ||
          whiteListChannel[key1];

        if (!channel) return null;

        return {
          id: `mytv-${i.CONTENT_ID}`,
          name: i.CONTENT_NAME || "",
          start_time: formatDate(i.START_TIME),
          over_time: formatDate(i.END_TIME),
          thumbnail: i.CONTENT_HOR_POSTER || "",

          // ✅ an toàn hơn
          channel_id: channel?.id ?? key1,
          channel_name: channel?.name ?? "",

          status: checkTimeStatus(
            formatDate(i.START_TIME),
            formatDate(i.END_TIME)
          )
        };
      })
      .filter(Boolean); // loại null
  }

  return {
    src: "MYTV",
    data
  };
}



async function FPTPlay(idChannel) {
  const API = await getAPI(
    "https://re.ghiminh1.workers.dev/?url=https://andanh.site/proxyipvn.php?url=https://api.fptplay.net/api/v7.1_ios/playos/block/highlight/632f01322089bd00e5c5ed3d?block_type=horizontal_slider&page_index=1&page_size=1000"
  );

  const data = (API?.data || []).map(i => {
    const rawId = i.id ? i.id.replace(/-/g, "") : "";
    const key = "fpt" + rawId;

    console.log(formatTimeVN(i.begin_time));

    return {
      id: `fptplay-${i.id}`,
      name: i.title,
      start_time: formatTimeVN(i.begin_time),
      over_time: formatTimeVN(i.end_time),
      thumbnail: i?.image?.landscape_title,

      // ✅ FIX NHẸ (không phá structure)
      channel_id: idChannel?.[key]?.id ?? "",
      channel_name: idChannel?.[key]?.name ?? "FPT-" + i.id,

      status: checkTimeStatus(
        formatTimeVN(i.begin_time),
        formatTimeVN(i.end_time)
      )
    };
  });

  return {
    src: "FPTPLAY",
    data: data
  };
}
