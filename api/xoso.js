export default async function handler(req, res) {
  // ⚠️ CORS header để tránh lỗi từ frontend
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  try {
   const rows = await getDataFromSheet(["thu", "danhMuc", "kenh", "mss", "url", "timeStart", "timeEnd", "logo"]);
   
    res.status(200).json(getXSKTNow(rows));
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error);
    res.status(500).json({ error: "Không thể lấy dữ liệu từ Google Sheet" });
  }
}

async function getDataFromSheet(allowedColumns = []) {
  const url = `https://docs.google.com/spreadsheets/d/1hSEcXxxEkbgq8203f_sTKAi3ZNEnFNoBnr7f3fsfzYE/gviz/tq?gid=2012690916&tqx=out:json`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const text = await response.text();
  const match = text.match(/setResponse\(([\s\S]*)\);?/);

  if (!match || !match[1]) {
    console.error("Phản hồi không hợp lệ:", text.slice(0, 200));
    throw new Error("Không tìm thấy dữ liệu JSON trong phản hồi");
  }

  const raw = JSON.parse(match[1]);
  const rows = raw.table.rows;

  // lấy dòng 1 làm header
  const headers = rows[0].c.map(cell => cell?.v);

  // dữ liệu từ dòng 2 trở đi
  return rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      if (allowedColumns.includes(h)) {
        obj[h] = row.c[i] ? row.c[i].v : null;
      }
    });
    return obj;
  });
}

/*
function getXSKTNow(data) {
  // Lấy thời gian hiện tại GMT+7
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Ho_Chi_Minh",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  // Tách thông tin ngày/giờ
  const parts = formatter.formatToParts(now);
  const weekdayMap = { Mon: "T2", Tue: "T3", Wed: "T4", Thu: "T5", Fri: "T6", Sat: "T7", Sun: "CN" };
  const thuNow = weekdayMap[parts.find(p => p.type === "weekday").value];
  const timeNow = parts.filter(p => ["hour","minute","second"].includes(p.type)).map(p => p.value).join(":");

  // Hàm so sánh giờ (HH:MM:SS)
  function toSec(t) {
    const [h,m,s] = t.split(":").map(Number);
    return h*3600 + m*60 + s;
  }
  const nowSec = toSec(timeNow);

  // Lấy dữ liệu hôm nay
  let todayData = data.filter(item => item.thu === thuNow);

  // Nếu không có dữ liệu hôm nay → lấy ngày hôm sau
  if (todayData.length === 0) {
    return getTomorrowData(data, thuNow);
  }

  // Kiểm tra theo giờ
  let candidates = todayData.filter(item => toSec(item.timeStart) >= nowSec || (toSec(item.timeStart) <= nowSec && toSec(item.timeEnd) >= nowSec));

  if (candidates.length > 0) {
    // Lấy nhóm có timeStart nhỏ nhất >= nowSec
    const minStart = Math.min(...candidates.map(i => toSec(i.timeStart)));
    return candidates.filter(i => toSec(i.timeStart) === minStart);
  } else {
    // Nếu qua tất cả timeEnd -> lấy ngày hôm sau
    return getTomorrowData(data, thuNow);
  }

  // Hàm lấy ngày mai
  function getTomorrowData(data, thuNow) {
    const thuList = ["T2","T3","T4","T5","T6","T7","CN"];
    let idx = thuList.indexOf(thuNow);
    let nextThu = thuList[(idx+1) % 7];
    let tomorrowData = data.filter(item => item.thu === nextThu);
    if (tomorrowData.length === 0) return []; // không có dữ liệu
    const minStart = Math.min(...tomorrowData.map(i => toSec(i.timeStart)));
    return tomorrowData.filter(i => toSec(i.timeStart) === minStart);
  }
}

*/


function getXSKTNow(data) {
  // ===== Lấy thời gian hiện tại (server GMT+7) =====
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const map = {};
  parts.forEach(p => { if (p.type !== "literal") map[p.type] = p.value; });

  const weekdayMap = { Mon: "T2", Tue: "T3", Wed: "T4", Thu: "T5", Fri: "T6", Sat: "T7", Sun: "CN" };
  const thuNow = weekdayMap[map.weekday];

  // Thời gian server dạng DD:MM:YYYY_HH:MM:SS
  const timeSV = `${map.day}:${map.month}:${map.year}_${map.hour}:${map.minute}:${map.second}`;
  const nowSec = toSec(`${map.hour}:${map.minute}:${map.second}`);

  // ===== Hàm phụ =====
  function toSec(t) {
    const [h, m, s] = t.split(":").map(Number);
    return h * 3600 + m * 60 + s;
  }

  function withDate(baseDay, baseMonth, baseYear, timeStr, isNextDay = false) {
    let day = Number(baseDay), month = Number(baseMonth), year = Number(baseYear);
    if (isNextDay) {
      let d = new Date(`${year}-${month}-${day}T${timeStr}+07:00`);
      d.setDate(d.getDate() + 1);
      day = String(d.getDate()).padStart(2, "0");
      month = String(d.getMonth() + 1).padStart(2, "0");
      year = d.getFullYear();
    }
    return `${day}:${month}:${year}_${timeStr}`;
  }

  // ===== Chuẩn hóa timeStart & timeEnd thành full ngày =====
  data = data.map(item => {
    const startSec = toSec(item.timeStart);
    const endSec = toSec(item.timeEnd);
    let isNextDay = endSec < startSec; // nếu end < start -> qua ngày sau

    return {
      ...item,
      timeStart: withDate(map.day, map.month, map.year, item.timeStart),
      timeEnd: withDate(map.day, map.month, map.year, item.timeEnd, isNextDay),
    };
  });

  // ===== Lọc dữ liệu theo thứ =====
  let todayData = data.filter(item => item.thu === thuNow);

  if (todayData.length === 0) {
    return getTomorrowBlock(data, thuNow, timeSV);
  }

  // Kiểm tra theo giờ
  let candidates = todayData.filter(item => {
    const start = toSec(item.timeStart.split("_")[1]);
    const end = toSec(item.timeEnd.split("_")[1]);
    return start >= nowSec || (start <= nowSec && end >= nowSec);
  });

  if (candidates.length > 0) {
    const minStart = Math.min(...candidates.map(i => toSec(i.timeStart.split("_")[1])));
    const group = candidates.filter(i => toSec(i.timeStart.split("_")[1]) === minStart);
     const channels = []
    for (const i of group){
      channels.push({
      "thu": i.thu,
      "danhMuc": i.danhMuc,
      "kenh": i.kenh,
      "logo": i.logo === null ? "" : i.logo,
      "mss": null,
      "url": i.url === null ? "" : customBase64Encode(i.url),
      "timeStart": i.timeStart,
      "timeEnd": i.timeEnd
      })
    }
    return {
      timeSV,
      timeStart: group[0].timeStart,
      timeEnd: group[0].timeEnd,
      data: channels
    };
  } else {
    return getTomorrowBlock(data, thuNow, timeSV);
  }

  // ===== Hàm lấy ngày mai =====
  function getTomorrowBlock(data, thuNow, timeSV) {
    const thuList = ["T2","T3","T4","T5","T6","T7","CN"];
    let idx = thuList.indexOf(thuNow);
    let nextThu = thuList[(idx+1) % 7];
    let tomorrowData = data.filter(item => item.thu === nextThu);
    if (tomorrowData.length === 0) return { timeSV, timeStart: null, timeEnd: null, data: [] };

    const minStart = Math.min(...tomorrowData.map(i => toSec(i.timeStart.split("_")[1])));
    const group = tomorrowData.filter(i => toSec(i.timeStart.split("_")[1]) === minStart);
    
    const channels = []
    for (const i of group){
      channels.push({
      "thu": i.thu,
      "danhMuc": i.danhMuc,
      "kenh": i.kenh,
      "logo": i.logo === null ? "" : i.logo,
      "mss": null,
      "url": i.url === null ? "" : customBase64Encode(i.url),
      "timeStart": i.timeStart,
      "timeEnd": i.timeEnd
      })
    }
    console.log(channels)
    return {
      timeSV,
      timeStart: group[0].timeStart,
      timeEnd: group[0].timeEnd,
      data: channels
    };
  }
}


function customBase64Encode(text) {
  // Bước 1: Mã hoá Base64
  const base64 = btoa(text);

  // Bước 2: Đảo ngược chuỗi
  const reversed = base64.split('').reverse();

  // Bước 3: Trộn theo kiểu "cuối, đầu, cuối-1, đầu+1, ..."
  let result = '';
  let left = 0;
  let right = reversed.length - 1;

  while (left <= right) {
    if (right >= left) result += reversed[right--]; // cuối
    if (left <= right) result += reversed[left++];  // đầu
  }

  return result;
}