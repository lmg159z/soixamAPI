
/*
export default async function handler(req, res) {
  // ⚠️ CORS header để tránh lỗi từ frontend
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Xử lý preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const rows = await getDataFromSheet(["STT", "name", "idGroup","group", "logo","classify","streamURL"]);
    const unique = [];
    for (const item of rows) {
        if (item.classify === "TV_FPT"){
          unique.push({
            STT: item.STT,
            name: item.name,
            idGroup: item.idGroup,
            group: item.group,
            logo: item.logo,
            streamURL: item.streamURL
            });
        }
      }
   const aliveList = await filterAliveURLs(unique);
console.log("URL sống:", aliveList);

res.status(200).json(aliveList);
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error);
    res.status(500).json({ error: "Không thể lấy dữ liệu từ Google Sheet" });
  }
}

async function getDataFromSheet(allowedColumns = []) {
  const url = `https://docs.google.com/spreadsheets/d/1hSEcXxxEkbgq8203f_sTKAi3ZNEnFNoBnr7f3fsfzYE/gviz/tq?gid=0&tqx=out:json`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const text = await response.text();
  const jsonText = text.match(/(?<=setResponse\().*(?=\);)/s)?.[0];
  if (!jsonText) {
    throw new Error("Không tìm thấy dữ liệu JSON trong phản hồi");
  }

  const raw = JSON.parse(jsonText);
  const cols = raw.table.cols.map(col => col.label);

  return raw.table.rows.map(row => {
    const obj = {};
    row.c.forEach((cell, i) => {
      const colName = cols[i];
      if (allowedColumns.includes(colName)) {
        obj[colName] = cell ? cell.v : null;
      }
    });
    return obj;
  });
}
async function filterAliveURLs(inputList, timeoutMs = 5000) {
  const checkURL = async (item) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(item.streamURL, {
        method: "GET",
        headers: {
          "Range": "bytes=0-1000",
          "User-Agent": "Mozilla/5.0"
        },
        signal: controller.signal,
      });
      clearTimeout(id);
      return response.ok ? item : null;
    } catch (e) {
      clearTimeout(id);
      console.error("Lỗi khi fetch:", item.streamURL, e.message);
      return null;
    }
  };

  const checks = await Promise.allSettled(inputList.map(checkURL));
  return checks
    .filter(result => result.status === "fulfilled" && result.value !== null)
    .map(result => result.value);
}

*/

export default async function handler(req, res) {
  // ⚠️ CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const rows = await getDataFromSheet([
      "STT", "name", "idGroup", "group", "logo", "classify", "streamURL"
    ]);

    // Lọc các mục cần kiểm tra
    const filtered = rows.filter(item => item.classify === "TV_FPT" && item.streamURL);
    
    // Giới hạn số lượng để tránh timeout (VD: kiểm tra 20 URL đầu tiên)
    const limited = filtered.slice(0, 20);

    const aliveList = await filterAliveURLs(limited);
    console.log("✅ URL sống:", aliveList.length);
    res.status(200).json(aliveList);
  } catch (error) {
    console.error("❌ Lỗi khi xử lý:", error.message);
    res.status(500).json({ error: "Lỗi xử lý trên server" });
  }
}

async function getDataFromSheet(allowedColumns = []) {
  const url = `https://docs.google.com/spreadsheets/d/1hSEcXxxEkbgq8203f_sTKAi3ZNEnFNoBnr7f3fsfzYE/gviz/tq?gid=0&tqx=out:json`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const text = await response.text();
  const jsonText = text.match(/(?<=setResponse\().*(?=\);)/s)?.[0];

  if (!jsonText) {
    throw new Error("Không tìm thấy dữ liệu JSON trong phản hồi");
  }

  const raw = JSON.parse(jsonText);
  const cols = raw.table.cols.map(col => col.label);

  return raw.table.rows.map(row => {
    const obj = {};
    row.c.forEach((cell, i) => {
      const colName = cols[i];
      if (allowedColumns.includes(colName)) {
        obj[colName] = cell ? cell.v : null;
      }
    });
    return obj;
  });
}

async function filterAliveURLs(inputList, timeoutMs = 4000) {
  const checkURL = async (item) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(item.streamURL, {
        method: "HEAD", // ✅ HEAD nhẹ hơn GET
        headers: {
          "User-Agent": "Mozilla/5.0"
        },
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (response.ok) {
        return item;
      } else {
        console.warn("⚠️ Không hợp lệ:", item.streamURL, response.status);
        return null;
      }
    } catch (err) {
      clearTimeout(timer);
      console.warn("❌ Lỗi khi fetch:", item.streamURL, err.name, err.message);
      return null;
    }
  };

  const results = await Promise.allSettled(inputList.map(checkURL));
  return results
    .filter(result => result.status === "fulfilled" && result.value !== null)
    .map(result => result.value);
}