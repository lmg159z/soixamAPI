// /api/get-sheet.js
export default async function handler(req, res) {
    // ⚠️ CORS header để tránh lỗi từ frontend
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    const { id } = req.query;
    if (req.method === "OPTIONS") return res.status(200).end();

    try {
        const rows = await getDataFromSheetAsKeyValue();


        console.log(rows)
        res.status(200).json(Object.values(channels(id, rows)));
        // res.status(200).json(Object.values(rows));
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        res.status(500).json({ error: "Không thể lấy dữ liệu từ Google Sheet" });
    }
}

async function getDataFromSheetAsKeyValue() {
  const url = `https://docs.google.com/spreadsheets/d/1hSEcXxxEkbgq8203f_sTKAi3ZNEnFNoBnr7f3fsfzYE/gviz/tq?gid=2102567147&tqx=out:json`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

  const text = await response.text();
  const jsonText = text.match(/(?<=setResponse\().*(?=\);)/s)?.[0];
  if (!jsonText) throw new Error("Không tìm thấy dữ liệu JSON trong phản hồi");

  const raw = JSON.parse(jsonText);

  // Lấy dữ liệu thô
  const rows = raw.table.rows;

  if (!rows || rows.length === 0) return [];

  // Hàng đầu tiên là key
  const keys = rows[0].c.map(cell => cell?.v ?? null);

  // Các hàng còn lại là value
  const data = rows.slice(1).map(row => {
    const obj = {};
    row.c.forEach((cell, i) => {
      obj[keys[i]] = cell?.v ?? null;
    });
    return obj;
  });

  return data;
}




function channels(id, data) {
//   console.log(data)
    for (const item of data) {
        if (item.id === id) {
            console.log(item.key)
            return [
                {
                    "id": item.id,
                    "name": item.name || "",
                    "acronym": item.acronym || "",
                    "nameGroup": item.nameGroup || "",
                    "idGroup": item.idGroup || "",
                    "logo": item.logo || "",
                    "watermark": item.watermark || "",
                    "status": item.status,
                    "schedule": item.schedule,
                    "drm": item.drm === "action" ? true : false,
                    "urlStream": encodeCustom(item.urlStream || ""),
                    "origin": item.origin || "",
                    "keyID": encodeCustom(item.keyID || ""),
                    "key": encodeCustom(item.key || ""),
                    "license": encodeCustom(item.license || "")
                }
            ];            // trả ra object tìm được
        }
    }
    return {};                // không tìm thấy
}



function encodeCustom(input) {
  // Base64 lần 1
  const base64_1 = btoa(unescape(encodeURIComponent(input)));

  // Đảo ngược chuỗi
  const reversed = base64_1.split('').reverse().join('');

  // Base64 lần 2
  const base64_2 = btoa(reversed);

  return base64_2;
}
