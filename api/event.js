// /api/get-sheet.js

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const rawChannels = await getDataFromSheetAsKeyValue();

    // DEBUG: Nếu vẫn không có dữ liệu
    if (!rawChannels || rawChannels.length === 0) {
      return res.status(200).json({ 
        message: "Sheet trả về dữ liệu rỗng.", 
        data: [] 
      });
    }

    // Lọc kênh
    const activeChannels = classifyChannels(rawChannels);
    res.status(200).json(activeChannels);

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Lỗi hệ thống", details: error.message });
  }
}

/**
 * HÀM LẤY DATA ĐÃ FIX LỖI HEADER
 */
async function getDataFromSheetAsKeyValue() {
  const GID = "570136065"; 
  const SHEET_ID = "1hSEcXxxEkbgq8203f_sTKAi3ZNEnFNoBnr7f3fsfzYE";
  // Lưu ý: Thêm header=0 để API biết dòng 1 có thể là data raw
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?gid=${GID}&tqx=out:json`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

  const text = await response.text();
  const jsonText = text.match(/google\.visualization\.Query\.setResponse\((.*)\);/s)?.[1];
  
  if (!jsonText) return [];

  const raw = JSON.parse(jsonText);
  
  // --- LOGIC FIX HEADER BẮT ĐẦU TỪ ĐÂY ---
  
  // 1. Lấy danh sách cột từ metadata
  let cols = raw.table.cols.map(col => col.label ? col.label.trim() : "");
  let rows = raw.table.rows;

  // 2. Kiểm tra xem metadata có chứa tên cột đúng không (Ví dụ check cột timeStart)
  // Nếu cột metadata rỗng, nghĩa là Google coi dòng 1 là dữ liệu
  const hasValidHeaderInMetadata = cols.includes("timeStart");

  if (!hasValidHeaderInMetadata && rows.length > 0) {
    // Lấy dòng đầu tiên làm header
    const firstRowCells = rows[0].c;
    cols = firstRowCells.map(cell => cell?.v ? String(cell.v).trim() : "unknown");
    
    // Bỏ dòng đầu tiên đi vì nó là header, không phải data
    rows = rows.slice(1);
  }

  // --- KẾT THÚC LOGIC FIX ---

  if (!rows || rows.length === 0) return [];

  return rows.map(row => {
    const obj = {};
    // Map dữ liệu dựa trên danh sách cols đã xác định ở trên
    row.c.forEach((cell, i) => {
      // Chỉ lấy dữ liệu nếu cột đó có tên (bỏ qua cột unknown hoặc rỗng)
      if (cols[i] && cols[i] !== "unknown" && cols[i] !== "") {
        obj[cols[i]] = cell?.v ? String(cell.v).trim() : null;
      }
    });
    return obj;
  });
}

function classifyChannels(channels) {
  const nowUtc = Date.now();
  const offsetVN = 7 * 60 * 60 * 1000; 
  const nowVN = nowUtc + offsetVN; 
  const buffer = 10 * 60 * 1000; 

  function parseToVnTimestamp(timeStr) {
    if (!timeStr) return null;

    const currentObj = new Date(nowVN);
    const currentYear = currentObj.getUTCFullYear();
    const currentMonth = currentObj.getUTCMonth();
    const currentDayOfWeek = currentObj.getUTCDay(); 
    const currentDate = currentObj.getUTCDate();

    // Regex support: T2, t2, CN, cn (case insensitive)
    const weekMatch = timeStr.match(/^(T[2-7]|CN)-(\d{1,2}):(\d{1,2})$/i);
    if (weekMatch) {
      const dayMap = { 'cn': 0, 't2': 1, 't3': 2, 't4': 3, 't5': 4, 't6': 5, 't7': 6 };
      const targetDayOfWeek = dayMap[weekMatch[1].toLowerCase()];
      const hour = parseInt(weekMatch[2], 10);
      const minute = parseInt(weekMatch[3], 10);

      const diffDay = targetDayOfWeek - currentDayOfWeek;
      return Date.UTC(currentYear, currentMonth, currentDate + diffDay, hour, minute);
    }

    // Regex support: /, -, :
    const dateMatch = timeStr.match(/^(\d{1,2})[:\/-](\d{1,2})[:\/-](\d{2,4})[- ](\d{1,2}):(\d{1,2})$/);
    if (dateMatch) {
      const day = parseInt(dateMatch[1], 10);
      const month = parseInt(dateMatch[2], 10) - 1; 
      let year = parseInt(dateMatch[3], 10);
      const hour = parseInt(dateMatch[4], 10);
      const minute = parseInt(dateMatch[5], 10);

      if (year < 100) year += 2000;
      return Date.UTC(year, month, day, hour, minute);
    }
    return null;
  }

  return channels.filter(item => {
    if (!item.timeStart || !item.timeEnd) return false;
    const start = parseToVnTimestamp(item.timeStart);
    const end = parseToVnTimestamp(item.timeEnd);
    if (start === null || end === null) return false;
    return nowVN >= (start - buffer) && nowVN <= (end + buffer);
  });
}