

















hãy viết html css js để thực hiện yc sau

tạo trang login với user và pass

POST API: 

với data {
    username: 
    password
}


nếu thành công qua bước tiếp theo

json mẫu
```json
{
 "info": {
  "listAPP": [
    "FEED",
    "ONPlus",
    "VTVPrime",
    "VTVGo",
    "TV360",
    "MyTV",
    "FPTPlay",
    "VieON",
    "ONLiveTV",
    "webLocal"
  ],
  "quantityChannels": 353,
  "APP": [
    {
      "name": "FEED",
      "logo": "https://sxtv.andanh.site/media/logo/logo.png",
      "timeUpdate": "Date(2026,4,5)"
    },
    {
      "name": "ONPlus",
      "logo": "https://onplus.com.vn/logo/logo_tet.png",
      "timeUpdate": "Date(2026,4,5)"
    },
    {
      "name": "VTVPrime",
      "logo": "https://vtvprime.vn/logo/logo.png",
      "timeUpdate": "Date(2026,4,5)"
    },
    {
      "name": "VTVGo",
      "logo": "https://web-cache-aws.vtvdigital.vn/assets/images/logo-app.png",
      "timeUpdate": "Date(2026,4,5)"
    },
    {
      "name": "TV360",
      "logo": "https://img-zlr2.tv360.vn/tv360-static/static/web/images/logo_new.svg",
      "timeUpdate": "Date(2026,4,5)"
    },
    {
      "name": "MyTV",
      "logo": "https://cmsposter.cdn.mytvnet.vn/vimages/a8/8a/ab/b0/07/73/a8ab0-pmultiscreenlogo-logo_multiscreen-unkn.png",
      "timeUpdate": "Date(2026,4,5)"
    },
    {
      "name": "FPTPlay",
      "logo": "https://images.fptplay53.net/media/photo/OTT/2025/05/26/logowebsite4x_1748221195181.png",
      "timeUpdate": "Date(2026,4,5)"
    },
    {
      "name": "VieON",
      "logo": "https://static2.vieon.vn/prod-vieon-web-v5-gcp/_next/assets/img/logo.svg",
      "timeUpdate": "Date(2026,4,5)"
    },
    {
      "name": "ONLiveTV",
      "logo": "https://onlivetv.vn/logoOnliveTV.png",
      "timeUpdate": "Date(2026,4,5)"
    },
    {
      "name": "webLocal",
      "logo": null,
      "timeUpdate": "Date(2026,4,5)"
    }
  ]
},
"data": [
    {
  "id": "vtv5hd",
  "name": "Đài Truyền hình Việt Nam",
  "acronym": "VTV5",
  "list": [
    {
      "urlStream": "https://cdnet-cdn-01.onsports.vn/onplus/VTV5_HD/manifest.mpd",
      "preventive": null,
      "APP": "ONPlus",
      "keyID": "c410ddc6a75244639fd0561fba5ef19b",
      "key": "30d13ea42031b9ff8271e5dc37d90e10",
      "license": null,
      "drm": "action"
    },
    {
      "urlStream": "https://livevlisctcdnw.seenow.vn/livesnv2/VTV5_HD/manifest.mpd",
      "preventive": null,
      "APP": "VTVPrime",
      "keyID": "a7c942778e874d43be92b8d0a0cd11b4",
      "key": "6d54358306571658ffdb952c6560688b",
      "license": null,
      "drm": "action"
    },
    {
      "VTK": "110",
      "urlStream": "https://andanh.site/tv360/tv360.php?id=110",
      "preventive": null,
      "APP": "TV360",
      "keyID": null,
      "key": null,
      "license": null,
      "drm": null
    },
    {
      "idCh": "379",
      "type": "M3U8",
      "urlStream": "https://andanh.site/myTV/mytv.php?id=379",
      "preventive": null,
      "APP": "MyTV M3U8",
      "keyID": null,
      "key": null,
      "license": null,
      "drm": null
    },
    {
      "urlStream": "https://live-a.fptplay53.net/live/media/VTV5HD/live_hls_avc/index.m3u8",
      "preventive": null,
      "APP": "FPTPlay",
      "keyID": null,
      "key": null,
      "license": null,
      "drm": null
    },
    {
      "index": "vtv5-hd",
      "urlStream": "https://andanh.site/vieON/vieon.php?type=hls&id=vtv5-hd",
      "preventive": null,
      "PRE": "FREE | M3U8",
      "APP": "VieON",
      "keyID": null,
      "key": null,
      "license": null,
      "drm": null
    },
    {
      "urlStream": "https://andanh.site/soHaTV/tv.php?id=t4xLCuZzH0zRQMUL",
      "preventive": null,
      "APP": "https://vtv.vn/",
      "STATUS": "OK",
      "keyID": null,
      "key": null,
      "license": null,
      "drm": null
    }
  ]
},
{
  "id": "vtv5hdtnb",
  "name": "Đài Truyền hình Việt Nam",
  "acronym": "VTV5 Tây Nam Bộ",
  "list": [
    {
      "urlStream": "https://cdnet-cdn-02.onsports.vn/hls/VTV5_TNB/index.m3u8",
      "preventive": null,
      "APP": "ONPlus",
      "keyID": null,
      "key": null,
      "license": null,
      "drm": null
    },
    {
      "urlStream": "https://liveh12byt.vtvprime.vn/hls/VTV5_TNB/index.m3u8",
      "preventive": null,
      "APP": "VTVPrime",
      "keyID": "a7c942778e874d43be92b8d0a0cd11b4",
      "key": "6d54358306571658ffdb952c6560688b",
      "license": null,
      "drm": "action"
    },
    {
      "VTK": "157",
      "urlStream": "https://andanh.site/tv360/tv360.php?id=157",
      "preventive": null,
      "APP": "TV360",
      "keyID": null,
      "key": null,
      "license": null,
      "drm": null
    },
    {
      "idCh": "615",
      "type": "M3U8",
      "urlStream": "https://andanh.site/myTV/mytv.php?id=615",
      "preventive": null,
      "APP": "MyTV M3U8",
      "keyID": null,
      "key": null,
      "license": null,
      "drm": null
    },
    {
      "urlStream": "https://live.fptplay53.net/fnxhd1/vtv5tnb_vhls.smil/chunklist.m3u8",
      "preventive": null,
      "APP": "FPTPlay",
      "keyID": null,
      "key": null,
      "license": null,
      "drm": null
    },
    {
      "index": "vtv5-tay-nam-bo",
      "urlStream": "https://andanh.site/vieON/vieon.php?type=hls&id=vtv5-tay-nam-bo",
      "preventive": null,
      "PRE": "PRE | M3U8",
      "APP": "VieON",
      "keyID": null,
      "key": null,
      "license": null,
      "drm": null
    },
    {
      "urlStream": "https://andanh.site/soHaTV/tv.php?id=Ffy3sgxGCmQvdHsF",
      "preventive": null,
      "APP": "https://vtv.vn/",
      "STATUS": "OK",
      "keyID": null,
      "key": null,
      "license": null,
      "drm": null
    }
  ]
},
{
  "id": "vtv5hdtn",
  "name": "Đài Truyền hình Việt Nam",
  "acronym": "VTV5 Tây Nguyên",
  "list": [
    {
      "urlStream": "https://cdnet-cdn-02.onsports.vn/hls/VTV5_TN/index.m3u8",
      "preventive": null,
      "APP": "ONPlus",
      "keyID": null,
      "key": null,
      "license": null,
      "drm": null
    },
    {
      "urlStream": "https://liveh12byt.vtvprime.vn/hls/VTV5_TN/index.m3u8",
      "preventive": null,
      "APP": "VTVPrime",
      "keyID": "a7c942778e874d43be92b8d0a0cd11b4",
      "key": "6d54358306571658ffdb952c6560688b",
      "license": null,
      "drm": "action"
    },
    {
      "VTK": "207",
      "urlStream": "https://andanh.site/tv360/tv360.php?id=207",
      "preventive": null,
      "APP": "TV360",
      "keyID": null,
      "key": null,
      "license": null,
      "drm": null
    },
    {
      "idCh": "642",
      "type": "M3U8",
      "urlStream": "https://andanh.site/myTV/mytv.php?id=642",
      "preventive": null,
      "APP": "MyTV M3U8",
      "keyID": null,
      "key": null,
      "license": null,
      "drm": null
    },
    {
      "urlStream": "https://live.fptplay53.net/fnxhd1/vtv5taynguyen_vhls.smil/chunklist.m3u8",
      "preventive": null,
      "APP": "FPTPlay",
      "keyID": null,
      "key": null,
      "license": null,
      "drm": null
    },
    {
      "index": "vtv5-tay-nguyen",
      "urlStream": "https://andanh.site/vieON/vieon.php?type=hls&id=vtv5-tay-nguyen",
      "preventive": null,
      "PRE": "PRE | M3U8",
      "APP": "VieON",
      "keyID": null,
      "key": null,
      "license": null,
      "drm": null
    },
    {
      "urlStream": "https://andanh.site/soHaTV/tv.php?id=ohrV4cGm4sL1Mgrd",
      "preventive": null,
      "APP": "https://vtv.vn/",
      "STATUS": "OK",
      "keyID": null,
      "key": null,
      "license": null,
      "drm": null
    }
  ]
},
{
  "id": "vtv7hd",
  "name": "Đài Truyền hình Việt Nam",
  "acronym": "VTV7",
  "list": [
    {
      "urlStream": "https://cdnet-cdn-01.onsports.vn/onplus/VTV7_HD/manifest.mpd",
      "preventive": null,
      "APP": "ONPlus",
      "keyID": "c410ddc6a75244639fd0561fba5ef19b",
      "key": "30d13ea42031b9ff8271e5dc37d90e10",
      "license": null,
      "drm": "action"
    },
    {
      "urlStream": "https://livesct.vtvprime.vn/livesnv2/VTV7_HD/manifest.mpd",
      "preventive": null,
      "APP": "VTVPrime",
      "keyID": "a7c942778e874d43be92b8d0a0cd11b4",
      "key": "6d54358306571658ffdb952c6560688b",
      "license": null,
      "drm": "action"
    },
    {
      "VTK": "6",
      "urlStream": "https://andanh.site/tv360/tv360.php?id=6",
      "preventive": null,
      "APP": "TV360",
      "keyID": null,
      "key": null,
      "license": null,
      "drm": null
    },
    {
      "idCh": "459",
      "type": "M3U8",
      "urlStream": "https://andanh.site/myTV/mytv.php?id=459",
      "preventive": null,
      "APP": "MyTV M3U8",
      "keyID": null,
      "key": null,
      "license": null,
      "drm": null
    },
    {
      "urlStream": "https://live.fptplay53.net/fnxhd1/vtv7hd_vhls.smil/chunklist.m3u8",
      "preventive": null,
      "APP": "FPTPlay",
      "keyID": null,
      "key": null,
      "license": null,
      "drm": null
    },
    {
      "index": "vtv7-hd",
      "urlStream": "https://andanh.site/vieON/vieon.php?type=hls&id=vtv7-hd",
      "preventive": null,
      "PRE": "PRE | M3U8",
      "APP": "VieON",
      "keyID": null,
      "key": null,
      "license": null,
      "drm": null
    },
    {
      "urlStream": "https://andanh.site/soHaTV/tv.php?id=tfzVwLwUq2AEBi2c",
      "preventive": null,
      "APP": "https://vtv.vn/",
      "STATUS": "OK",
      "keyID": null,
      "key": null,
      "license": null,
      "drm": null
    }
  ]
},
]
}


```


tạo bảng với


| ID | TÊN CÔNG CHỦ QUẢN (name) | TÊN (acronym) | SỐ LƯỢNG APP (số lượng kênh trong list) |
|____|__________________________|_______________|_________________________________________|


sau khi tạo bảng thì khi ấn vào dòng thì mở 1 box lên và tổ chức chứa thông tin sau
```json
"id": "vtv3hd",
"name": "Đài Truyền hình Việt Nam",
"acronym": "VTV3",
"list": [
  {
    "urlStream": "https://cdnet-cdn-01.onsports.vn/onplus/VTV3_HD/manifest.mpd",
    "preventive": null,
    "APP": "ONPlus",
    "keyID": "c410ddc6a75244639fd0561fba5ef19b",
    "key": "30d13ea42031b9ff8271e5dc37d90e10",
    "license": null,
    "drm": "action"
  },
  {
    "urlStream": "https://livevlisctcdnw.seenow.vn/livesnv2/VTV3_HD/manifest.mpd",
    "preventive": null,
    "APP": "VTVPrime",
    "keyID": "a7c942778e874d43be92b8d0a0cd11b4",
    "key": "6d54358306571658ffdb952c6560688b",
    "license": null,
    "drm": "action"
  },
  {
    "VTK": "4",
    "urlStream": "https://andanh.site/tv360/tv360.php?id=4",
    "preventive": null,
    "APP": "TV360",
    "keyID": null,
    "key": null,
    "license": null,
    "drm": null
  },
  {
    "idCh": "211",
    "type": "M3U8",
    "urlStream": "https://andanh.site/myTV/mytv.php?id=211",
    "preventive": null,
    "APP": "MyTV M3U8",
    "keyID": null,
    "key": null,
    "license": null,
    "drm": null
  },
  {
    "urlStream": "https://live-a.fptplay53.net/live/media/VTV3HD/live_hls_avc/index.m3u8",
    "preventive": null,
    "APP": "FPTPlay",
    "keyID": null,
    "key": null,
    "license": null,
    "drm": null
  },
  {
    "index": "vtv3-hd",
    "urlStream": "https://andanh.site/vieON/vieon.php?type=hls&id=vtv3-hd",
    "preventive": null,
    "PRE": "PRE | M3U8",
    "APP": "VieON",
    "keyID": null,
    "key": null,
    "license": null,
    "drm": null
  },
  {
    "urlStream": "https://andanh.site/soHaTV/tv.php?id=InP0vsnzPXLZ64ip",
    "preventive": null,
    "APP": "https://vtv.vn/",
    "STATUS": "OK",
    "keyID": null,
    "key": null,
    "license": null,
    "drm": null
  }
],

```


tạo thêm nút và liên kết tới 1 web /?drm=<nếu action thì true còn null thì false>&url=<mã hóa base64>&key=keyID:key <nếu có không thì thôi>


thiết kế giao diện tối


lưu cache login


lưu ý: chỉ viết phần thân (content) không đụng đến các yếu tố khác
có câu gì cần hỏi không