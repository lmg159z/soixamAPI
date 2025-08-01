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
    const rows = await getDataFromSheet(["STT", "name", "idGroup","group", "logo","streamURL",	"audioURL",	"DRM",	"key",	"keyID",	"kURL",	"typeClearnKey","type"]);
    const unique = [];
      for (const item of rows) {
        if (item.STT == STT && item.idGroup == idGroup){
          unique.push({
            STT: item.STT,
            name: item.name,
            idGroup: item.idGroup,
            group: item.group,
            logo: item.logo,
            url: item.streamURL != null ? customBase64Encode(item.streamURL) :"",
            audio: item.audioURL != null ? customBase64Encode(item.audioURL) :"",
            drm:item.DRM,
            key: item.key != null ? customBase64Encode(item.key) :"",
            keyID: item.keyID != null ? customBase64Encode(item.keyID) :"",
            type: item.type
            });
        }
      }
      
      console.log(unique);

    res.status(200).json(unique);
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
}