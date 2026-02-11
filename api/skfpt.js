// /api/get-sheet.js
export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") return res.status(200).end();

    try {
        const rows = await getDataFromSheetAsKeyValue();

        const filtered = await channels(rows);

        res.status(200).json(filtered);

    } catch (error) {
        console.error("Lỗi:", error);
        res.status(500).json({ error: "Không thể xử lý dữ liệu" });
    }
}

async function getDataFromSheetAsKeyValue() {
    const url = `https://docs.google.com/spreadsheets/d/1hSEcXxxEkbgq8203f_sTKAi3ZNEnFNoBnr7f3fsfzYE/gviz/tq?gid=595761795&tqx=out:json`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const text = await response.text();
    const jsonText = text.match(/(?<=setResponse\().*(?=\);)/s)?.[0];
    const raw = JSON.parse(jsonText);

    const rows = raw.table.rows;
    if (!rows || rows.length === 0) return [];

    const keys = rows[0].c.map(cell => cell?.v ?? null);

    return rows.slice(1).map(row => {
        const obj = {};
        row.c.forEach((cell, i) => {
            obj[keys[i]] = cell?.v ?? null;
        });
        return obj;
    });
}

// ===============================
// CHECK URL SỐNG
// ===============================

async function checkAlive(url) {
    try {
        const checkUrl = `https://andanh.site/proxyipvn.php?url=${encodeURIComponent(url)}`;
        const res = await fetch(checkUrl);
        const data = await res.json();
        return data.status === 200;
    } catch {
        return false;
    }
}

// ===============================
// FILTER + ENCODE
// ===============================

async function channels(data) {

    const batchSize = 10; // số request song song
    const results = [];

    for (let i = 0; i < data.length; i += batchSize) {

        const batch = data.slice(i, i + batchSize);

        const checks = batch.map(async (item) => {
            if (!item.url) return null;

            const isAlive = await checkAlive(item.url);

            if (isAlive) {
                return {
                    id: item.id,
                    url: encodeCustom(item.url),
                    name: item.name
                };
            }

            return null;
        });

        const batchResults = await Promise.all(checks);

        results.push(...batchResults.filter(Boolean));
    }

    return results;
}

// ===============================
// ENCODE
// ===============================

function encodeCustom(input) {
    const base64_1 = Buffer.from(input, "utf8").toString("base64");
    const reversed = base64_1.split('').reverse().join('');
    const base64_2 = Buffer.from(reversed).toString("base64");
    return base64_2;
}
