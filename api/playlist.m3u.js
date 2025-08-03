export default async function handler(req, res) {
  // ⚠️ CORS header để tránh lỗi từ frontend
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
 let { type } = req.query;
if (!type) {
  type = "iptv";
}
  // Xử lý preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const rows = await getDataFromSheet(["STT",	"name",	"logo",	"streamURL",	"audioURL",	"idGroup",	"group",	"classify",	"type",	"DRM",	"license_type",	"key",	"keyID",	"kURL",	"typeClearnKey"]);
  
  switch (type){
    case "mon":
      monplayer(rows,res)
      break;
    case "iptv":
      renderToM3U(rows,res)
      break;
  }
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
function monplayer(rows,res){
   let grouped = {};
      rows.forEach(item => {
        if (item.DRM === false && item.classify != "TV_FPT") {
          if (!grouped[item.idGroup]) {
            grouped[item.idGroup] = {
            "id": item.idGroup,
            "name": item.group,
            "display": "horizontal",
            channels: [],
            "preview_display": "slider",
            "grid_columns": null,
            "enable_detail": false
            };
          }
      
          grouped[item.idGroup].channels.push({
                "id": `channel_${item.STT}`,
                "name": item.name,
                "image": {
                  "display": "contain",
                  "shape": "square",
                  "url": item.logo.includes('http') ? item.logo : `https://lmg159z.github.io/soixamTV/wordspage/image/logo/${item.logo}`,
                  "height": 101,
                  "width": 155
                },
                "type": "single",
                "display": "text-below",
                "sources": [
                  {
                    "id": `channel_${item.STT}`,
                    "name": "",
                    "contents": [
                      {
                        "id": `channel_${item.STT}`,
                        "name": "",
                        "streams": [
                          {
                            "id": `channel_${item.STT}`,
                            "name": item.name,
                            "image": {
                              "display": "contain",
                              "shape": "square",
                              "url": item.logo.includes('http') ? item.logo : `https://lmg159z.github.io/soixamTV/wordspage/image/logo/${item.logo}`,
                              "height": 101,
                              "width": 155
                            },
                            "stream_links": [
                              {
                                "id":`channel_${item.STT}` ,
                                "name": item.logo.includes('http') ? item.logo : `https://lmg159z.github.io/soixamTV/wordspage/image/logo/${item.logo}`,
                                "url": item.streamsURL === null ? "https://files.catbox.moe/ez6jnv.mp4": item.streamsURL,
                                "type": "hls",
                                "default": true
                              }
                            ],
                            "remote_data": null
                          }
                        ]
                      }
                    ]
                  }
                ]
          });
        }
      });
      const result = Object.values(grouped); 
      const dataEn = {
        "id": "soixamTV",
        "name": "Sói Xám TV",
        "color": "#0a192f",
        "org_metadata": {
          "image": "https://lmg159z.github.io/soixamTV/wordspage/image/logo/logoChannel.png",
          "title": "Sói Xám TV – Truyền hình trong tầm tay",
          "description": "Sói Xám TV là nền tảng giải trí trực tuyến mang đến cho bạn thế giới truyền hình sống động, đa dạng và hoàn toàn miễn phí. Từ các kênh thể thao, phim truyện, tin tức đến radio, sự kiện trực tiếp và hơn thế nữa – tất cả đều được tuyển chọn kỹ lưỡng để phục vụ trải nghiệm mượt mà, nhanh chóng, không quảng cáo gây phiền.."
        },
        "url": "",
        "image": {
          "display": "contain",
          "shape": "square",
          "url": "https://lmg159z.github.io/soixamTV/wordspage/image/logo/logoChannel.png",
          "height": 101,
          "width": 155
        },
        "grid_number": 92,
        "groups": result
      }
     res.status(200).json(dataEn);
}
function renderToM3U(channels, res) {
  let m3u = "#EXTM3U\n";
  for (const ch of channels) {
    const logoChannel = ch.logo.startsWith("http")?ch.logo:`https://lmg159z.github.io/soixamTV/wordspage/image/logo/${ch.logo}`;
    const url = ch.streamsURL === null ? "https://files.catbox.moe/ez6jnv.mp4": ch.streamsURL

  if (ch.DRM === true) {
   if (ch.typeClearnKey === "base64"){
   m3u += `#EXTINF:-1 tvg-id="channel_${ch.id}" tvg-logo="${logoChannel}" group-title="${ch.group}",${ch.name}\n`;
    m3u += `#EXTVLCOPT:http-user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36\n`;
    m3u += `#KODIPROP:inputstreamaddon=inputstream.adaptive\n`;
    m3u += `#KODIPROP:inputstream.adaptive.manifest_type=dash\n`;
    m3u += `#KODIPROP:inputstream.adaptive.license_type=org.w3.clearkey\n`;
    m3u += `#KODIPROP:inputstream.adaptive.license_key={"keys":[{"kty":"oct","k":"${ch.keyID}","kid":"${ch.key}"}],"type":"temporary"}\n`;
    m3u += `${url}\n`;
    }
   if (ch.typeClearnKey === "hex"){
      m3u += `#EXTVLCOPT:http-user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36\n`;
      m3u += `#KODIPROP:inputstreamaddon=inputstream.adaptive\n`;
      m3u += `#KODIPROP:inputstream.adaptive.manifest_type=dash\n`;
      m3u += `#KODIPROP:inputstream.adaptive.license_type=${ch.license_type}\n`;
      m3u += `#KODIPROP:inputstream.adaptive.license_key=${ch.keyID}:${ch.key}\n`;
      m3u += `#EXTINF:-1 tvg-id="" tvg-logo="${logoChannel}" group-title="${ch.group}",${ch.name}\n`;
      m3u += `${url}\n`;
    }
   if (ch.typeClearnKey === "url"){
     m3u += `#EXTINF:-1 tvg-id="channel_${ch.STT}" tvg-logo="${logoChannel}" group-title="${ch.group}",${ch.name}\n`;
      m3u += `#EXTVLCOPT:http-user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36\n`;
      m3u += `#KODIPROP:inputstreamaddon=inputstream.adaptive\n`;
      m3u += `#KODIPROP:inputstream.adaptive.manifest_type=dash\n`;
      m3u += `#KODIPROP:inputstream.adaptive.license_type=${ch.license_type}\n`;
      m3u += `#KODIPROP:inputstream.adaptive.license_key=${ch.kURL}\n`;
      m3u += `${url}\n`;
      
   }
  } else {
    m3u += `#EXTINF:-1 tvg-id="channel_${ch.id}" tvg-logo="${logoChannel}" group-title="${ch.group}",${ch.name}\n`;
    m3u += `${url}\n`;
  }
}
  res.setHeader("Content-Type", "audio/x-mpegurl");
  res.setHeader("Content-Disposition", 'inline; filename="playlist.m3u"');
  res.status(200).send(m3u);
}



