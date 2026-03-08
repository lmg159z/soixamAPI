// /api/get-sheet.js

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const jsonIPTV = await iptv();

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

/**
 * HÀM LẤY DATA ĐÃ FIX LỖI HEADER
 */
async function getDataFromSheetAsKeyValue(GID, SHEET_ID) {
  // const GID = "2102567147"; 
  // const SHEET_ID = "1hSEcXxxEkbgq8203f_sTKAi3ZNEnFNoBnr7f3fsfzYE";
  // Lưu ý: Thêm header=0 để API biết dòng 1 có thể là data raw
  const url = 
`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?gid=${GID}&tqx=out:json`;

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


async function getDataFromSheetAsKeySheetAsKeyFeed() {
   const url = `https://docs.google.com/spreadsheets/d/1hSEcXxxEkbgq8203f_sTKAi3ZNEnFNoBnr7f3fsfzYE/gviz/tq?gid=1008194429&tqx=out:json`;

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

async function iptv(){
    const rawChannels = await getDataFromSheetAsKeyValue("2102567147","1hSEcXxxEkbgq8203f_sTKAi3ZNEnFNoBnr7f3fsfzYE");
    if (!rawChannels) {
      return `
      Lỗi rồi hãy báo cáo với quản trị viên
      `
    }

    const textIPTV = rawChannels
      .filter(i => i.status === "live" ||  i.status === "liveFEED" )
    .map(k =>{
      if (k.drm === "action"){
        return `
#EXTINF:-1 tvg-id="${k.id}" group-title="${k.nameGroup}" tvg-logo="${k.logo || k.thumb}", ${k.acronym} | ${k.name || ""}
#EXTVLCOPT:http-user-agent=Dalvik/2.1.0
#KODIPROP:inputstream.adaptive.manifest_type=mpd
#KODIPROP:inputstream.adaptive.license_type=clearkey
#KODIPROP:inputstream.adaptive.license_key=${k.keyID}:${k.key}
${k.urlStream}      
`
      }else{
        return `
#EXTINF:-1 tvg-id="${k.id}" group-title="${k.nameGroup}" tvg-logo="${k.logo || k.thumb}",${k.acronym} | ${k.name || ""}
#EXTVLCOPT:http-user-agent=Dalvik/2.1.0
${k.urlStream}
`
      }
    }).join("") 


    const textEPG = `
#EXTM3U url-tvg="https://vnepg.site/epgu.xml"
#EXTM3U url-tvg="https://tvbvn.quanlehong539.workers.dev/xml"
#Bản quyền thuộc về hệ sinh thái SoiXamTV




#========================================================================================

    `
    return textEPG +textIPTV


 
    // return rawChannels
}

// async function iptv(){
//   const rawChannels = await getDataFromSheetAsKeyValue();

//   if (!rawChannels) {
//     return "Lỗi rồi hãy báo cáo với quản trị viên";
//   }

//   const textIPTV = rawChannels
//     .filter(i => i.status === "live")
//     .map(i => {

//       if (i.drm === "action"){
//         return `#EXTINF:-1 tvg-id="${i.id}" group-title="${i.nameGroup}" tvg-logo="${i.logo}", ${i.logo}\r
// #EXTVLCOPT:http-user-agent=Dalvik/2.1.0\r
// #KODIPROP:inputstream.adaptive.manifest_type=mpd\r
// #KODIPROP:inputstream.adaptive.license_type=clearkey\r
// #KODIPROP:inputstream.adaptive.license_key=${i.keyID}:${i.key}\r
// ${i.url}\r
// \r
// `
//       }

//       return `#EXTINF:-1 tvg-id="${i.id}" group-title="${i.nameGroup}" tvg-logo="${i.logo}", ${i.logo}\r
// #EXTVLCOPT:http-user-agent=Dalvik/2.1.0\r
// ${i.url}\r
// \r
// `
//     }).join("")

//   const textEPG =
// `#EXTM3U url-tvg="https://vnepg.site/epgu.xml,https://hnlive.dramahay.xyz/epg.xml,https://tvbvn.quanlehong539.workers.dev/xml"\r
// #Bản quyền thuộc về hệ sinh thái SoiXamTV\r
// \r
// #========================================================================================\r
// \r
// `

//   return textEPG + textIPTV
// }