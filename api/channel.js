// /api/get-sheet.js
export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    const { id } = req.query;
    if (req.method === "OPTIONS") return res.status(200).end();

    try {
        const rows = await getDataFromSheetAsKeyValue();
        console.log(rows);
        res.status(200).json(Object.values(await channels(id, rows)));
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
    const rows = raw.table.rows;
    if (!rows || rows.length === 0) return [];

    const keys = rows[0].c.map(cell => cell?.v ?? null);
    const data = rows.slice(1).map(row => {
        const obj = {};
        row.c.forEach((cell, i) => {
            obj[keys[i]] = cell?.v ?? null;
        });
        return obj;
    });

    return data;
}

async function fetchData(url = null) {
    try {
        if (!url) return null;
        const response = await fetch(url);
        if (!response.ok) return null;
        const data = await response.json();
        return data;
    } catch (error) {
        return null;
    }
}

async function channels(id, data) {
    for (const item of data) {
        if (item.id === id) {
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
                    "schedule": await fetchData(item.schedule),
                    "drm": item.drm === "action" ? true : false,
                    "urlStream": encodeCustom(item.urlStream || ""),
                    "origin": item.origin || "",
                    "keyID": encodeCustom(item.keyID || ""),
                    "key": encodeCustom(item.key || ""),
                    "license": encodeCustom(item.license || ""),
                    "catchUP": item.review || ""
                }
            ];
        }
    }
    return {};
}

function encodeCustom(input) {
    if (!input) return "";
    const base64_1 = Buffer.from(input, 'utf-8').toString('base64');
    const reversed = base64_1.split('').reverse().join('');
    const base64_2 = Buffer.from(reversed, 'utf-8').toString('base64');
    return base64_2;
}