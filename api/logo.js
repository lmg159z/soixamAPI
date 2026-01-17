// /api/get-sheet.js
export default async function handler(req, res) {
  // ⚠️ CORS header để tránh lỗi từ frontend
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const rows = await getDataFromSheetAsKeyValue();



    res.status(200).json(Object.values(classifyChannels(rows)));
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


function classifyChannels(channels) {
  const result = [];
  const groupMap = {};

  // ✅ CHỈ LẤY KÊNH LIVE
  const liveChannels = channels.filter(
    ch => String(ch.status).toLowerCase() === "live"
  );

  liveChannels.forEach(channel => {
    const groups = channel.idGroup.split('|').map(g => g.trim());

    groups.forEach(g => {
      if (!groupMap[g]) {
        groupMap[g] = {
          info: {
            nameGroup: channel.nameGroup,
            idGroup: channel.idGroup,
          },
          channel: []
        };
        result.push(groupMap[g]);
      }

      groupMap[g].channel.push({
        id: channel.id,
        name: channel.name || channel.acronym,
        acronym: channel.acronym,
        nameGroup: channel.nameGroup,
        idGroup: channel.idGroup,
        logo: channel.logo || "",
        thumb: channel.thumb || "",
        watermark: channel.watermark || "",
        status: channel.status
      });
    });
  });

  return result;
}
