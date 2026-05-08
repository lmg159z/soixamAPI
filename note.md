[{
  "id": "165935884",
  "name": "ONPlus",
  "logo": "https://onplus.com.vn/logo/logo_tet.png",
  "timeUpdate": "05-05-2026",
  "data": [
    {
      "id": "antvhd",
      "name": "Cục Truyền thông Công an Nhân dân",
      "acronym": "ANTV",
      "urlStream": "https://cdnet-cdn-02.onsports.vn/hls/ANNINHTV/index.m3u8",
      "preventive": null,
      "APP": "ONPlus",
      "keyID": null,
      "key": null,
      "license": null,
      "drm": null
    },
    ...
  ]
},
{
  "id": "165935884",
  "name": "ONPlus",
  "logo": "https://onplus.com.vn/logo/logo_tet.png",
  "timeUpdate": "05-05-2026",
  "data": [
    {
      "id": "antvhd",
      "name": "Cục Truyền thông Công an Nhân dân",
      "acronym": "ANTV",
      "urlStream": "https://cdnet-cdn-02.onsports.vn/hls/ANNINHTV/index.m3u8",
      "preventive": null,
      "APP": "ONPlus",
      "keyID": null,
      "key": null,
      "license": null,
      "drm": null
    },
    ...
  ]
}
]



viết hàm JS xấp xếp nhận tham số như trên

xấp xếp thành

{
    info :{
        listAPP: [<các nameAPP trong các list. vd: ONplus>],
        quantityChannels: //số lượng kênh (tính tổng các list)
        APP: [
            {
                tên , logo và thời gian update (timeUpdate)
            }
            ...
        ]
    },
    data: [
        // quang trọng này

        {
             "id": "antvhd",  //id kênh
             "name": "Cục Truyền thông Công an Nhân dân", //name
             "acronym": "ANTV", // viết tắt
             list:[ 
             {
                // copy hết đống còn lại trừ id, name,acronym 
            ...
            //gộp các list lại với nhau
             }
             ]
        }
    ]
}


có gì muốn hỏi không



















hãy viết html css để thực hiện yc sau


tạo bảng với


| ID | TÊN CÔNG CHỦ QUẢN | TÊN | SỐ LƯỢNG APP |
|____|___________________|_____|______________|


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
