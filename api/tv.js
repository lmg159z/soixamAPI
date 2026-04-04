// // /api/get-sheet.js

// export default async function handler(req, res) {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type");

//   if (req.method === "OPTIONS") return res.status(200).end();

//   try {
//     const jsonIPTV = await iptv();

//     // // DEBUG: Nếu vẫn không có dữ liệu
//     // if (!rawChannels || rawChannels.length === 0) {
//     //   return res.status(200).json({ 
//     //     message: "Sheet trả về dữ liệu rỗng.", 
//     //     data: [] 
//     //   });
//     // }

//     // // Lọc kênh
//     // const activeChannels = classifyChannels(rawChannels);
//     res.setHeader("Content-Type", "text/plain; charset=utf-8");
// res.status(200).send(jsonIPTV);

//   } catch (error) {
//     console.error("Server Error:", error);
//     res.status(500).json({ error: "Lỗi hệ thống", details: error.message });
//   }
// }

// /**
//  * HÀM LẤY DATA ĐÃ FIX LỖI HEADER
//  */
// async function getDataFromSheetAsKeyValue(GID, SHEET_ID) {
//   // const GID = "2102567147"; 
//   // const SHEET_ID = "1hSEcXxxEkbgq8203f_sTKAi3ZNEnFNoBnr7f3fsfzYE";
//   // Lưu ý: Thêm header=0 để API biết dòng 1 có thể là data raw
//   const url = 
// `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?gid=${GID}&tqx=out:json`;

//   const response = await fetch(url);
//   if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

//   const text = await response.text();
//   const jsonText = text.match(/google\.visualization\.Query\.setResponse\((.*)\);/s)?.[1];
  
//   if (!jsonText) return [];

//   const raw = JSON.parse(jsonText);
  
//   // --- LOGIC FIX HEADER BẮT ĐẦU TỪ ĐÂY ---
  
//   // 1. Lấy danh sách cột từ metadata
//   let cols = raw.table.cols.map(col => col.label ? col.label.trim() : "");
//   let rows = raw.table.rows;

//   // 2. Kiểm tra xem metadata có chứa tên cột đúng không (Ví dụ check cột timeStart)
//   // Nếu cột metadata rỗng, nghĩa là Google coi dòng 1 là dữ liệu
//   const hasValidHeaderInMetadata = cols.includes("timeStart");

//   if (!hasValidHeaderInMetadata && rows.length > 0) {
//     // Lấy dòng đầu tiên làm header
//     const firstRowCells = rows[0].c;
//     cols = firstRowCells.map(cell => cell?.v ? String(cell.v).trim() : "unknown");
    
//     // Bỏ dòng đầu tiên đi vì nó là header, không phải data
//     rows = rows.slice(1);
//   }

//   // --- KẾT THÚC LOGIC FIX ---

//   if (!rows || rows.length === 0) return [];

//   return rows.map(row => {
//     const obj = {};
//     // Map dữ liệu dựa trên danh sách cols đã xác định ở trên
//     row.c.forEach((cell, i) => {
//       // Chỉ lấy dữ liệu nếu cột đó có tên (bỏ qua cột unknown hoặc rỗng)
//       if (cols[i] && cols[i] !== "unknown" && cols[i] !== "") {
//         obj[cols[i]] = cell?.v ? String(cell.v).trim() : null;
//       }
//     });
//     return obj;
//   });
// }
// async function getAPI(url) {
//   try {
//     const res = await fetch(url);
//     if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
//     return await res.json();
//   } catch (err) {
//     console.error("getAPI error:", err);
//     return null;
//   }
// }

// function safeAtob(str) {
//   if (!str || typeof str !== "string") return null;

//   // Chuẩn base64url → base64
//   let s = str.replace(/-/g, "+").replace(/_/g, "/");

//   // Padding
//   while (s.length % 4 !== 0) s += "=";

//   try {
//     return atob(s);
//   } catch (e) {
//     return null;
//   }
// }
// function decodeCustom(encoded) {
//   // Nếu không phải string → trả thẳng
//   if (typeof encoded !== "string") return encoded;

//   // Giải base64 lần 2
//   const step1 = safeAtob(encoded);
//   if (!step1) return encoded; // ❗ không phải encodeCustom

//   // Đảo ngược
//   const reversed = step1.split('').reverse().join('');

//   // Giải base64 lần 1
//   const step2 = safeAtob(reversed);
//   if (!step2) return encoded;

//   // Fix Unicode
//   try {
//     return decodeURIComponent(escape(step2));
//   } catch {
//     return step2;
//   }
// }


// async function getDataFromSheetAsKeySheetAsKeyFeed() {
//    const url = `https://docs.google.com/spreadsheets/d/1hSEcXxxEkbgq8203f_sTKAi3ZNEnFNoBnr7f3fsfzYE/gviz/tq?gid=1008194429&tqx=out:json`;
//     const response = await fetch(url);
//     if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

//     const text = await response.text();
//     const jsonText = text.match(/(?<=setResponse\().*(?=\);)/s)?.[0];
//     if (!jsonText) throw new Error("Không tìm thấy dữ liệu JSON trong phản hồi");

//     const raw = JSON.parse(jsonText);

//     // Lấy dữ liệu thô
//     const rows = raw.table.rows;

//     if (!rows || rows.length === 0) return [];

//     // Hàng đầu tiên là key
//     const keys = rows[0].c.map(cell => cell?.v ?? null);

//     // Các hàng còn lại là value
//     const data = rows.slice(1).map(row => {
//         const obj = {};
//         row.c.forEach((cell, i) => {
//             obj[keys[i]] = cell?.v ?? null;
//         });
//         return obj;
//     });

//     return data;
// }

// // async function iptv(){
// //     const rawChannels = await getDataFromSheetAsKeyValue("2102567147","1hSEcXxxEkbgq8203f_sTKAi3ZNEnFNoBnr7f3fsfzYE");
// //     if (!rawChannels) {
// //       return `
// //       Lỗi rồi hãy báo cáo với quản trị viên
// //       `
// //     }

// //     const textIPTV = rawChannels
// //       .filter(i => i.status === "live" ||  i.status === "liveFEED" )
// //     .map(k =>{
// //       if (k.drm === "action"){
// //         return `
// // #EXTINF:-1 tvg-id="${k.id}" group-title="${k.nameGroup}" tvg-logo="${k.logo || k.thumb}", ${k.acronym} | ${k.name || ""}
// // #EXTVLCOPT:http-user-agent=Dalvik/2.1.0
// // #KODIPROP:inputstream.adaptive.manifest_type=mpd
// // #KODIPROP:inputstream.adaptive.license_type=clearkey
// // #KODIPROP:inputstream.adaptive.license_key=${k.keyID}:${k.key}
// // ${k.urlStream}      
// // `
// //       }else{
// //         return `
// // #EXTINF:-1 tvg-id="${k.id}" group-title="${k.nameGroup}" tvg-logo="${k.logo || k.thumb}",${k.acronym} | ${k.name || ""}
// // #EXTVLCOPT:http-user-agent=Dalvik/2.1.0
// // ${k.urlStream}
// // `
// //       }
// //     }).join("") 


// //     const textEPG = `
// // #EXTM3U url-tvg="https://vnepg.site/epgu.xml"
// // #EXTM3U url-tvg="https://tvbvn.quanlehong539.workers.dev/xml"
// // #Bản quyền thuộc về hệ sinh thái SoiXamTV




// // #========================================================================================

// //     `
// //     return textEPG +textIPTV


 
// //     // return rawChannels
// // }




// const onlive = `
// #EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/122477?422", abeomukbang - [Tường thuật] 2025 PMSL SEA GFD3 Fall | Tân Vương Kế Vị
// http://vietanhtv.id.vn/onlive/getlive.php?id=abeomukbang&broad_no=122477
// #EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/122476?111", neoson - [Tường thuật] VCT 2025 Pacific Stage 2 | Chung kết tổng
// http://vietanhtv.id.vn/onlive/getlive.php?id=neoson&broad_no=122476
// #EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/122396?383", up2you - [Tường thuật] CHUNG KẾT TỔNG | VISA VMC WINTER 2025
// http://vietanhtv.id.vn/onlive/getlive.php?id=up2you&broad_no=122396
// #EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/122474?440", phimhaivn - [Tường thuật] Chung Kết Khu Vực APAC | ĐTCL Mùa 15
// http://vietanhtv.id.vn/onlive/getlive.php?id=phimhaivn&broad_no=122474
// #EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/122472?10", Susubay - [Tường thuật] VALORANT Champions Paris — Chung kết tổng
// http://vietanhtv.id.vn/onlive/getlive.php?id=gamerts&broad_no=122472
// #EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/122493?382", bongchuyen - [Tường thuật] Giải bóng chuyền trẻ VĐQG
// http://vietanhtv.id.vn/onlive/getlive.php?id=bongchuyen&broad_no=122493
// #EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/122491?562", bongrovba - [Tường thuật] Giải Bóng Rổ Chuyên Nghiệp Việt Nam – VBA
// http://vietanhtv.id.vn/onlive/getlive.php?id=bongrovba&broad_no=122491
// #EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/122475?87", Temiu - [Tường thuật] QUARTER FINALS AIC 2025
// http://vietanhtv.id.vn/onlive/getlive.php?id=greengame&broad_no=122475
// #EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/122480?239", dancewithme - [Tường thuật] VALORANT Challengers 2025 Southeast Asia: Split 3 
// http://vietanhtv.id.vn/onlive/getlive.php?id=dancewithme&broad_no=122480
// #EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/122473?286", vothuatvn - [Tường thuật] Chung kết FC Pro Champions Cup 2025
// http://vietanhtv.id.vn/onlive/getlive.php?id=vothuatvn&broad_no=122473
// #EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/122479?800", Emmy - [Tường thuật] BLAST Rivals Season 2
// http://vietanhtv.id.vn/onlive/getlive.php?id=kenhcs2&broad_no=122479
// #EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/122395?479", Sunix - [Tường thuật] Red Bull Home Ground 2025
// http://vietanhtv.id.vn/onlive/getlive.php?id=kenhfps&broad_no=122395
// #EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/122397?572", cookstory - [Tường thuật] FC Pro Festival 2025
// http://vietanhtv.id.vn/onlive/getlive.php?id=cookstory&broad_no=122397
// #EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/122398?843", gummyon - [Tường thuật] SAIGON PHANTOM vs FPT X FLASH | CHUNG KẾT TỔNG | ĐTDV MÙA ĐÔN
// http://vietanhtv.id.vn/onlive/getlive.php?id=gummyon&broad_no=122398
// #EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/122399?856", haivolo - [Tường thuật] Giải đấu Audition VietNam Championship 2025
// http://vietanhtv.id.vn/onlive/getlive.php?id=haivolo&broad_no=122399
// #EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/122401?860", angelclubvn - [Tường thuật] CHUNG KẾT THẾ GIỚI: VƯƠNG MIỆN CHIẾN THUẬT | ĐTCL MÙA 15
// http://vietanhtv.id.vn/onlive/getlive.php?id=angelclubvn&broad_no=122401
// #EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/122402?855", keohanaa - [Tường thuật] CÚP VỆ BINH TINH TÚ | ĐTCL Mùa 15
// http://vietanhtv.id.vn/onlive/getlive.php?id=keohanaa&broad_no=122402
// #EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/120102?240", tvshow - Võ thuật đối kháng
// http://vietanhtv.id.vn/onlive/getlive.php?id=tvshow&broad_no=120102
// #EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/124468?97", streetdance - [Tường thuật] VALORANT Challengers SEA: 2025 Split 3 | Chung Kết Tổng
// http://vietanhtv.id.vn/onlive/getlive.php?id=streetdance&broad_no=124468
// #EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/124469?373", sportquocte - [Tường thuật] BLAST Rivals Season 2 | Furia vs Falcons
// http://vietanhtv.id.vn/onlive/getlive.php?id=sportquocte&broad_no=124469
// #EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/124470?151", dailyhihi - [Tường thuật] LCP 2025 Giai Đoạn Chung Kết Mùa - Vòng Playoffs
// http://vietanhtv.id.vn/onlive/getlive.php?id=dailyhihi&broad_no=124470
// #EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/124471?778", haitonghop - [Tường thuật] GAME CHANGERS CHAMPIONSHIP 2025 | Playoffs | Ngày 10
// http://vietanhtv.id.vn/onlive/getlive.php?id=haitonghop&broad_no=124471
// #EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/124472?125", pandabizvn - [Tường thuật] PMNC 2025 - VÒNG CHUNG KẾT - NGÀY 4
// http://vietanhtv.id.vn/onlive/getlive.php?id=pandabizvn&broad_no=124472
// #EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/122425?1", veramadsen - [Tường thuật] SOOP VALORANT League 2025 | GROUP STAGE | Ngày 2
// http://vietanhtv.id.vn/onlive/getlive.php?id=veramadsen&broad_no=122425
// #EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/124473?614", honghotdrama - [Tường thuật] Vòng Thăng Hạng LCP 2025
// http://vietanhtv.id.vn/onlive/getlive.php?id=honghotdrama&broad_no=124473
// #EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/122426?366", kattyy - [Tường thuật] FCI x VRE | CSC 2025 S2 FINAL NGÀY 11.08
// http://vietanhtv.id.vn/onlive/getlive.php?id=kattyy&broad_no=122426
// #EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/122478?189", tinesport - [Tường thuật] CKTG 2025 - Tứ Kết - T1 vs AL
// http://vietanhtv.id.vn/onlive/getlive.php?id=tinesport&broad_no=122478
// #EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/122482?817", Ligue1 - Sôi động bóng đá Pháp
// http://vietanhtv.id.vn/onlive/getlive.php?id=ligue1&broad_no=122482
// #EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/122483?675", ONSports+ - Lion Actions Số 25-25 - Điểm Nhấn Sự Kiện Mma Cuối Năm
// http://vietanhtv.id.vn/onlive/getlive.php?id=onsportsplus&broad_no=122483
// #EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/122484?387", ONSports - Tạp Chí H/L Pga Tour - Farmers Insurance Open 2026
// http://vietanhtv.id.vn/onlive/getlive.php?id=onsports&broad_no=122484
// `

















// async function iptv() {
//   const rawChannels = await getDataFromSheetAsKeyValue(
//     "2102567147",
//     "1hSEcXxxEkbgq8203f_sTKAi3ZNEnFNoBnr7f3fsfzYE"
//   );
//    const broadCast = await getAPI("https://soixamapi.vercel.app/api/broadcastProgram")
//   //  console.log(broadCast)
//   if (!rawChannels) {
//     return `Lỗi rồi hãy báo cáo với quản trị viên`;
//   }

//   const textIPTV = rawChannels
//     .filter(i => i.status === "live" || i.status === "liveFEED")
//     .map(k => {
//       if (k.drm === "action") {
//         return `#EXTINF:-1 tvg-id="${k.id}" group-title="${k.nameGroup}" tvg-logo="${k.logo || k.thumb}",${k.acronym} | ${k.name || ""}
// #EXTVLCOPT:http-user-agent=Dalvik/2.1.0
// #KODIPROP:inputstream.adaptive.manifest_type=mpd
// #KODIPROP:inputstream.adaptive.license_type=clearkey
// #KODIPROP:inputstream.adaptive.license_key=${k.keyID}:${k.key}
// ${k.urlStream}
// `;
//       } else {
//         return `#EXTINF:-1 tvg-id="${k.id}" group-title="${k.nameGroup}" tvg-logo="${k.logo || k.thumb}",${k.acronym} | ${k.name || ""}
// #EXTVLCOPT:http-user-agent=Dalvik/2.1.0
// ${k.urlStream}
// `;
//       }
//     })
//     .join("\n");
// const textBroadCast = (await Promise.all(
//   broadCast.broadCast
//     .filter(i => i.status === 1)
//     .map(async k => {
//       try {
//         const channel = await getAPI(
//           `https://soixamapi.vercel.app/api/channel?id=${k.channel_id || "vtv1hd"}`
//         );

//         // 👉 check tồn tại
//         if (!channel || !channel[0]) return "";

//         const ch = channel[0];

//         if (ch.drm) {
//           return `#EXTINF:-1 tvg-id="broadCast_${k.channel_id}" group-title="Chương trình tiêu biểu" tvg-logo="${k.thumbnail}",${k.name} | ${k.channel_name || ""}
// #EXTVLCOPT:http-user-agent=Dalvik/2.1.0
// #KODIPROP:inputstream.adaptive.manifest_type=mpd
// #KODIPROP:inputstream.adaptive.license_type=clearkey
// #KODIPROP:inputstream.adaptive.license_key=${decodeCustom(ch.keyID)}:${decodeCustom(ch.key)}
// ${decodeCustom(ch.urlStream)}

// `;
//         } else {
//           return `#EXTINF:-1 tvg-id="broadCast_${k.channel_id}" group-title="Chương trình tiêu biểu" tvg-logo="${k.thumbnail}",${k.name} | ${k.channel_name || ""}
// #EXTVLCOPT:http-user-agent=Dalvik/2.1.0
// ${decodeCustom(ch.urlStream)}

// `;
//         }
//       } catch (err) {
//         console.error("Channel error:", k.channel_id, err);
//         return ""; // bỏ qua item lỗi
//       }
//     })
// )).join("");
//   const textEPG = `#EXTM3U url-tvg="https://vnepg.site/epgu.xml,https://tvbvn.quanlehong539.workers.dev/xml"
// # SoiXamTV IPTV Playlist
// #========================================================================================`;

//   return  textEPG + "\n" + textBroadCast + "\n" + textIPTV + "\n" + onlive;
// }


// /api/get-sheet.js

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const jsonIPTV = await iptv();
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.status(200).send(jsonIPTV);
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Lỗi hệ thống", details: error.message });
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Fetch với timeout tự động */
async function fetchWithTimeout(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
  } finally {
    clearTimeout(timer);
  }
}

async function getAPI(url) {
  try {
    const res = await fetchWithTimeout(url);
    return await res.json();
  } catch (err) {
    console.error("getAPI error:", url, err.message);
    return null;
  }
}

function safeAtob(str) {
  if (!str || typeof str !== "string") return null;
  let s = str.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4 !== 0) s += "=";
  try { return atob(s); } catch { return null; }
}

function decodeCustom(encoded) {
  if (typeof encoded !== "string") return encoded;
  const step1 = safeAtob(encoded);
  if (!step1) return encoded;
  const reversed = step1.split("").reverse().join("");
  const step2 = safeAtob(reversed);
  if (!step2) return encoded;
  try { return decodeURIComponent(escape(step2)); } catch { return step2; }
}

// ─── Sheet fetcher ───────────────────────────────────────────────────────────

async function getDataFromSheetAsKeyValue(GID, SHEET_ID) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?gid=${GID}&tqx=out:json`;
  const response = await fetchWithTimeout(url);
  const text = await response.text();
  const jsonText = text.match(/google\.visualization\.Query\.setResponse\((.*)\);/s)?.[1];
  if (!jsonText) return [];

  const raw = JSON.parse(jsonText);
  let cols = raw.table.cols.map(col => col.label?.trim() ?? "");
  let rows = raw.table.rows;

  if (!cols.includes("timeStart") && rows.length > 0) {
    cols = rows[0].c.map(cell => cell?.v ? String(cell.v).trim() : "unknown");
    rows = rows.slice(1);
  }

  if (!rows?.length) return [];

  return rows.map(row => {
    const obj = {};
    row.c.forEach((cell, i) => {
      if (cols[i] && cols[i] !== "unknown" && cols[i] !== "") {
        obj[cols[i]] = cell?.v ? String(cell.v).trim() : null;
      }
    });
    return obj;
  });
}

// ─── Template builders ───────────────────────────────────────────────────────

function buildChannelEntry({ tvgId, group, logo, title, drm, keyID, key, url }) {
  const header = `#EXTINF:-1 tvg-id="${tvgId}" group-title="${group}" tvg-logo="${logo}",${title}`;
  const ua = `#EXTVLCOPT:http-user-agent=Dalvik/2.1.0`;
  if (drm) {
    return `${header}\n${ua}\n#KODIPROP:inputstream.adaptive.manifest_type=mpd\n#KODIPROP:inputstream.adaptive.license_type=clearkey\n#KODIPROP:inputstream.adaptive.license_key=${keyID}:${key}\n${url}\n`;
  }
  return `${header}\n${ua}\n${url}\n`;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function iptv() {
  // ✅ Fetch sheet + broadCast API song song
  const [rawChannels, broadCastData] = await Promise.all([
    getDataFromSheetAsKeyValue("2102567147", "1hSEcXxxEkbgq8203f_sTKAi3ZNEnFNoBnr7f3fsfzYE"),
    getAPI("https://soixamapi.vercel.app/api/broadcastProgram"),
  ]);

  if (!rawChannels) return "Lỗi rồi hãy báo cáo với quản trị viên";

  // ── 1. Channels từ Sheet ─────────────────────────────────────────────────
  const textIPTV = rawChannels
    .filter(k => k.status === "live" || k.status === "liveFEED")
    .map(k =>
      buildChannelEntry({
        tvgId: k.id,
        group: k.nameGroup,
        logo: k.logo || k.thumb,
        title: `${k.acronym} | ${k.name || ""}`,
        drm: k.drm === "action",
        keyID: k.keyID,
        key: k.key,
        url: k.urlStream,
      })
    )
    .join("\n");

  // ── 2. BroadCast channels ────────────────────────────────────────────────
  const activeItems = broadCastData?.broadCast?.filter(i => i.status === 1) ?? [];

  // ✅ Gom tất cả channel_id unique → gọi song song 1 lần
  const uniqueIds = [...new Set(activeItems.map(i => i.channel_id || "vtv1hd"))];

  const channelMap = Object.fromEntries(
    await Promise.all(
      uniqueIds.map(async id => {
        const data = await getAPI(`https://soixamapi.vercel.app/api/channel?id=${id}`);
        return [id, data?.[0] ?? null];
      })
    )
  );

  const textBroadCast = activeItems
    .map(k => {
      const ch = channelMap[k.channel_id || "vtv1hd"];
      if (!ch) return "";
      return buildChannelEntry({
        tvgId: `broadCast_${k.channel_id}`,
        group: "Chương trình tiêu biểu",
        logo: k.thumbnail,
        title: `${k.name} | ${k.channel_name || ""}`,
        drm: !!ch.drm,
        keyID: decodeCustom(ch.keyID),
        key: decodeCustom(ch.key),
        url: decodeCustom(ch.urlStream),
      });
    })
    .join("\n");

  // ── 3. Ghép kết quả ─────────────────────────────────────────────────────
  const textEPG = `#EXTM3U url-tvg="https://vnepg.site/epgu.xml,https://tvbvn.quanlehong539.workers.dev/xml"
# SoiXamTV IPTV Playlist
#========================================================================================`;

  return [textEPG, textBroadCast, textIPTV, onlive].join("\n");
}

// ─── ON Live (static) ────────────────────────────────────────────────────────

const onlive = `
#EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/122477?422", abeomukbang - [Tường thuật] 2025 PMSL SEA GFD3 Fall | Tân Vương Kế Vị
http://vietanhtv.id.vn/onlive/getlive.php?id=abeomukbang&broad_no=122477
#EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/122476?111", neoson - [Tường thuật] VCT 2025 Pacific Stage 2 | Chung kết tổng
http://vietanhtv.id.vn/onlive/getlive.php?id=neoson&broad_no=122476
#EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/122396?383", up2you - [Tường thuật] CHUNG KẾT TỔNG | VISA VMC WINTER 2025
http://vietanhtv.id.vn/onlive/getlive.php?id=up2you&broad_no=122396
#EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/122474?440", phimhaivn - [Tường thuật] Chung Kết Khu Vực APAC | ĐTCL Mùa 15
http://vietanhtv.id.vn/onlive/getlive.php?id=phimhaivn&broad_no=122474
#EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/122472?10", Susubay - [Tường thuật] VALORANT Champions Paris — Chung kết tổng
http://vietanhtv.id.vn/onlive/getlive.php?id=gamerts&broad_no=122472
#EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/122493?382", bongchuyen - [Tường thuật] Giải bóng chuyền trẻ VĐQG
http://vietanhtv.id.vn/onlive/getlive.php?id=bongchuyen&broad_no=122493
#EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/122491?562", bongrovba - [Tường thuật] Giải Bóng Rổ Chuyên Nghiệp Việt Nam – VBA
http://vietanhtv.id.vn/onlive/getlive.php?id=bongrovba&broad_no=122491
#EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/122475?87", Temiu - [Tường thuật] QUARTER FINALS AIC 2025
http://vietanhtv.id.vn/onlive/getlive.php?id=greengame&broad_no=122475
#EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/122480?239", dancewithme - [Tường thuật] VALORANT Challengers 2025 Southeast Asia: Split 3 
http://vietanhtv.id.vn/onlive/getlive.php?id=dancewithme&broad_no=122480
#EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/122473?286", vothuatvn - [Tường thuật] Chung kết FC Pro Champions Cup 2025
http://vietanhtv.id.vn/onlive/getlive.php?id=vothuatvn&broad_no=122473
#EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/122479?800", Emmy - [Tường thuật] BLAST Rivals Season 2
http://vietanhtv.id.vn/onlive/getlive.php?id=kenhcs2&broad_no=122479
#EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/122395?479", Sunix - [Tường thuật] Red Bull Home Ground 2025
http://vietanhtv.id.vn/onlive/getlive.php?id=kenhfps&broad_no=122395
#EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/122397?572", cookstory - [Tường thuật] FC Pro Festival 2025
http://vietanhtv.id.vn/onlive/getlive.php?id=cookstory&broad_no=122397
#EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/122398?843", gummyon - [Tường thuật] SAIGON PHANTOM vs FPT X FLASH | CHUNG KẾT TỔNG | ĐTDV MÙA ĐÔN
http://vietanhtv.id.vn/onlive/getlive.php?id=gummyon&broad_no=122398
#EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/122399?856", haivolo - [Tường thuật] Giải đấu Audition VietNam Championship 2025
http://vietanhtv.id.vn/onlive/getlive.php?id=haivolo&broad_no=122399
#EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/122401?860", angelclubvn - [Tường thuật] CHUNG KẾT THẾ GIỚI: VƯƠNG MIỆN CHIẾN THUẬT | ĐTCL MÙA 15
http://vietanhtv.id.vn/onlive/getlive.php?id=angelclubvn&broad_no=122401
#EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/122402?855", keohanaa - [Tường thuật] CÚP VỆ BINH TINH TÚ | ĐTCL Mùa 15
http://vietanhtv.id.vn/onlive/getlive.php?id=keohanaa&broad_no=122402
#EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/120102?240", tvshow - Võ thuật đối kháng
http://vietanhtv.id.vn/onlive/getlive.php?id=tvshow&broad_no=120102
#EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/124468?97", streetdance - [Tường thuật] VALORANT Challengers SEA: 2025 Split 3 | Chung Kết Tổng
http://vietanhtv.id.vn/onlive/getlive.php?id=streetdance&broad_no=124468
#EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/124469?373", sportquocte - [Tường thuật] BLAST Rivals Season 2 | Furia vs Falcons
http://vietanhtv.id.vn/onlive/getlive.php?id=sportquocte&broad_no=124469
#EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/124470?151", dailyhihi - [Tường thuật] LCP 2025 Giai Đoạn Chung Kết Mùa - Vòng Playoffs
http://vietanhtv.id.vn/onlive/getlive.php?id=dailyhihi&broad_no=124470
#EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/124471?778", haitonghop - [Tường thuật] GAME CHANGERS CHAMPIONSHIP 2025 | Playoffs | Ngày 10
http://vietanhtv.id.vn/onlive/getlive.php?id=haitonghop&broad_no=124471
#EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/124472?125", pandabizvn - [Tường thuật] PMNC 2025 - VÒNG CHUNG KẾT - NGÀY 4
http://vietanhtv.id.vn/onlive/getlive.php?id=pandabizvn&broad_no=124472
#EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/122425?1", veramadsen - [Tường thuật] SOOP VALORANT League 2025 | GROUP STAGE | Ngày 2
http://vietanhtv.id.vn/onlive/getlive.php?id=veramadsen&broad_no=122425
#EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/124473?614", honghotdrama - [Tường thuật] Vòng Thăng Hạng LCP 2025
http://vietanhtv.id.vn/onlive/getlive.php?id=honghotdrama&broad_no=124473
#EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/122426?366", kattyy - [Tường thuật] FCI x VRE | CSC 2025 S2 FINAL NGÀY 11.08
http://vietanhtv.id.vn/onlive/getlive.php?id=kattyy&broad_no=122426
#EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/122478?189", tinesport - [Tường thuật] CKTG 2025 - Tứ Kết - T1 vs AL
http://vietanhtv.id.vn/onlive/getlive.php?id=tinesport&broad_no=122478
#EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/122482?817", Ligue1 - Sôi động bóng đá Pháp
http://vietanhtv.id.vn/onlive/getlive.php?id=ligue1&broad_no=122482
#EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/122483?675", ONSports+ - Lion Actions Số 25-25 - Điểm Nhấn Sự Kiện Mma Cuối Năm
http://vietanhtv.id.vn/onlive/getlive.php?id=onsportsplus&broad_no=122483
#EXTINF:-1 group-title="ON Live" tvg-logo="http://liveimg.onlive.vn/1/122484?387", ONSports - Tạp Chí H/L Pga Tour - Farmers Insurance Open 2026
http://vietanhtv.id.vn/onlive/getlive.php?id=onsports&broad_no=122484
`;