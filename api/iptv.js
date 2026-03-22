// /api/get-sheet.js

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  const { id } = req.query;
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const jsonIPTV = await iptv(id);

    // // DEBUG: Nếu vẫn không có dữ liệu
    // if (!rawChannels || rawChannels.length === 0) {
    //   return res.status(200).json({ 
    //     message: "Sheet trả về dữ liệu rỗng.", 
    //     data: [] 
    //   });
    // }

    // // Lọc kênh
    // const activeChannels = classifyChannels(rawChannels);
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
res.status(200).send(jsonIPTV);

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Lỗi hệ thống", details: error.message });
  }
}


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



async function getDataFromSheetAsKeyValue(GID, SHEET_ID) {
  // Thêm tqx=out:json để nhận kết quả JSON và headers=1 để xác định hàng 1 là tiêu đề
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?gid=${GID}&tqx=out:json&headers=1`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const text = await response.text();
    const jsonText = text.match(/(?<=setResponse\().*(?=\);)/s)?.[0];
    if (!jsonText) throw new Error("Không tìm thấy dữ liệu JSON");

    const raw = JSON.parse(jsonText);
    const table = raw.table;

    // 1. Lấy Keys từ table.cols (Google tự bóc hàng đầu tiên vào đây khi có headers=1)
    // Ta chỉ lấy những cột có label (tiêu đề) để tránh các cột trống (column_5, column_6...)
    const keys = table.cols.map(col => col.label).map(label => label?.trim());
    
    // Tìm index của các cột có tiêu đề thực sự (loại bỏ cột rỗng)
    const validColumnIndexes = keys
      .map((key, index) => (key ? index : null))
      .filter(index => index !== null);

    // 2. Lấy dữ liệu từ table.rows
    const data = table.rows.map(row => {
      const obj = {};
      validColumnIndexes.forEach(i => {
        const key = keys[i];
        const cell = row.c[i];
        // Lấy giá trị v (raw value), nếu null thì để null
        obj[key] = cell?.v ?? null;
      });
      return obj;
    });

    return data;
  } catch (error) {
    console.error("Lỗi:", error);
    return [];
  }
}

function mapIdToLogo(data) {
  const channelMap = {};
  
  data.forEach(item => {
    item.channel.forEach(chan => {
      channelMap[chan.id] = chan.logo;
    });
  });
  
  return channelMap;
}

async function iptv(GID) {
  const rawChannels = await getDataFromSheetAsKeyValue(
    GID,
    "1s55kJ_HEob8U3AJvZfCw_fqOm1UU8iGpPzXyRIryoDc"
  );
console.log(rawChannels)
  if (!rawChannels) {
    return `Lỗi rồi hãy báo cáo với quản trị viên`;
  }

  const APIlogo = await getAPI("https://soixamapi.vercel.app/api/logo")
  const logo = mapIdToLogo(APIlogo)
  const textIPTV = rawChannels
    .map(k => {
      if (k.drm === "action") {
        return `#EXTINF:-1 tvg-id="${k.id}" group-title="${k.APP}" tvg-logo="${logo[k.id]}" ,${k.acronym} | ${k.name || ""}
#EXTVLCOPT:http-user-agent=Dalvik/2.1.0
#KODIPROP:inputstream.adaptive.manifest_type=mpd
#KODIPROP:inputstream.adaptive.license_type=clearkey
#KODIPROP:inputstream.adaptive.license_key=${k.keyID}:${k.key}
${k.urlStream}
`;
      } else {
        return `#EXTINF:-1 tvg-id="${k.id}" group-title="${k.APP}" tvg-logo="${logo[k.id]}",${k.acronym} | ${k.name || ""}
#EXTVLCOPT:http-user-agent=Dalvik/2.1.0
${k.urlStream}
`;
      }
    })
    .join("\n");

  const textEPG = `#EXTM3U url-tvg="https://vnepg.site/epgu.xml,https://tvbvn.quanlehong539.workers.dev/xml"
# SoiXamTV IPTV Playlist
#========================================================================================`;

  return  textEPG + "\n"  + textIPTV 
}