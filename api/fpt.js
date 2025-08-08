export default async function handler(req, res) {
  // ⚠️ CORS header để tránh lỗi từ frontend
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  const { STT, idGroup} = req.query;
  // Xử lý preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    await checkURL(res)
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
}/*
async function getAPI(url, timeoutMs = 7000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    const ok = response.ok;
    return {
      url,
      status: ok
    };
  } catch (error) {
    console.error("Lỗi khi gọi API:", error.message);
    return {
      url,
      status: false
    };
  } finally {
    clearTimeout(timeout);
  }
}
async function checkURL(res){
  const rows = await getDataFromSheet(["STT", "name", "idGroup","group", "logo","streamURL",	"audioURL",	"type"]);
  const dataEND = []
  for (const data of rows){
    if (data.idGroup === "FPTplay"){
      const url = await getAPI(data.streamURL)
      if (url.status === true){
        dataEND.push({
            STT: data.STT,
            name: data.name,
            idGroup: data.idGroup,
            group: data.group,
            logo: data.logo,
            url: data.streamURL === null ? customBase64Encode("https://files.catbox.moe/ez6jnv.mp4") : customBase64Encode(data.streamURL)
            });
      }
    }
  }
  res.status(200).json(dataEND)
}*/
async function getAPI(url, timeoutMs = 3000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    return { url, status: response.ok };
  } catch (error) {
    return { url, status: false };
  } finally {
    clearTimeout(timeout);
  }
}

async function checkURL(res) {
  const rows = await getDataFromSheet([
    "STT", "name", "idGroup", "group", "logo", "streamURL", "audioURL", "type"
  ]);

  const fptRows = rows.filter(r => r.idGroup === "FPTplay");

  const results = await Promise.allSettled(
    fptRows.map(row => getAPI(row.streamURL))
  );

  const dataEND = [];

  for (let i = 0; i < results.length; i++) {
    const result = results[i];

    if (result.status === "fulfilled" && result.value.status === true) {
      const data = fptRows[i];
      dataEND.push({
        STT: data.STT,
        name: data.name,
        idGroup: data.idGroup,
        group: data.group,
        logo: data.logo,
        url: data.streamURL
          ? customBase64Encode(data.streamURL)
          : customBase64Encode("https://files.catbox.moe/ez6jnv.mp4")
      });
    }
  }

  res.status(200).json(dataEND);
}