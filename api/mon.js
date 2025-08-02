export default async function handler(req, res) {
  // ⚠️ CORS header để tránh lỗi từ frontend
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Xử lý preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const rows = await getDataFromSheet(["STT","idGroup","group", "name", "logo", "classify","streamURL","DRM"]);
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
                          "url": item.streamURL,
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




/*
{
  "id": "fptplay",
  "name": "FPT Play",
  "color": "#FF9E2D",
  "org_metadata": {
    "image": "http://iptv.nhadai.org/s-banner.png",
    "title": "FPT Play - Xem Chương Trình Truyền Hình Trực Tuyến Miễn Phí",
    "description": "FPT PLAY - Hệ thống kênh truyền hình trực tuyến đỉnh cao, tổng hợp các nội dung giải trí, thể thao, phim ảnh và chương trình đặc sắc nhất. Mang đến trải nghiệm mượt mà, chất lượng hình ảnh vượt trội qua kết nối Internet, FPT PLAY  là lựa chọn hàng đầu cho người dùng Việt Nam và quốc tế."
  },
  "url": "http://iptv.nhadai.org/v1",
  "image": {
    "display": "contain",
    "shape": "square",
    "url": "http://iptv.nhadai.org/logo.png",
    "height": 101,
    "width": 155
  },
  "grid_number": 1,
  "groups": [
 {
      "id": "ca-nhan",
      "name": "Nổi Bật",
      "display": "horizontal",
      "channels": [
        {
          "id": "VTV1_HD",
          "name": "VTV1 HD",
          "image": {
            "display": "cover",
            "shape": "square",
            "url": "http://iptv.nhadai.org/img/vtv1-hd.png",
            "height": 101,
            "width": 155
          },
          "type": "single",
          "display": "text-below",
          "sources": [
            {
              "id": "vtv1-hd",
              "name": "",
              "contents": [
                {
                  "id": "vtv1-hd",
                  "name": "",
                  "streams": [
                    {
                      "id": "vtv1-hd",
                      "name": "VTV1 HD",
                      "image": {
                        "display": "contain",
                        "shape": "square",
                        "url": "http://iptv.nhadai.org/img/vtv1-hd.png",
                        "height": 101,
                        "width": 155
                      },
                      "stream_links": [
                        {
                          "id": "vtv1-hd",
                          "name": "VTV1 HD",
                          "url": "http://iptv.nhadai.org/stream/vtv1-hd",
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
        }
      ],
      "preview_display": "slider",
      "grid_columns": null,
      "enable_detail": false
    }
  ]
}







    {
      "id": "ca-nhan",
      "name": "Nổi Bật",
      "display": "horizontal",
      "channels": [
        {
          "id": "VTV1_HD",
          "name": "VTV1 HD",
          "image": {
            "display": "cover",
            "shape": "square",
            "url": "http://iptv.nhadai.org/img/vtv1-hd.png",
            "height": 101,
            "width": 155
          },
          "type": "single",
          "display": "text-below",
          "sources": [
            {
              "id": "vtv1-hd",
              "name": "",
              "contents": [
                {
                  "id": "vtv1-hd",
                  "name": "",
                  "streams": [
                    {
                      "id": "vtv1-hd",
                      "name": "VTV1 HD",
                      "image": {
                        "display": "contain",
                        "shape": "square",
                        "url": "http://iptv.nhadai.org/img/vtv1-hd.png",
                        "height": 101,
                        "width": 155
                      },
                      "stream_links": [
                        {
                          "id": "vtv1-hd",
                          "name": "VTV1 HD",
                          "url": "http://iptv.nhadai.org/stream/vtv1-hd",
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
        }
      ],
      "preview_display": "slider",
      "grid_columns": null,
      "enable_detail": false
    }
*/
