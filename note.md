# id kênh onplus 
- e2129578-ad42-4a17-b391-253844f6dfc2 => onplus 9


# API document 
## API tổng 
url => https://tv-web-api.onlivetv.vn/api/v2/publish/see-more/events/5


## id channel

- onlive 9 => 8edc20d4-04ba-41a4-9ad8-998c915fa509
- onlive 4 => c449b337-baf6-45da-90f3-8cbe0ec504d6

a79194ed-7303-4dbf-abe3-d0fd011f812f






30dd2af9-ff12-4642-ac1f-c4464f86ffdc => OS_HAY_TV
1f039dc2-320d-4365-8fef-9dfe75e58a1c => OS_THETHAO_GOLF_HD
a59d8f32-b0d6-49c6-a1a2-8b7911314fa5 => OS_BONGDA_HD
410dbcf0-2cdb-48c4-bf85-de9449412830 => OS_THETHAO_HD
13c74904-dcf2-45d0-ad0f-7c5f27656ee6 => OS_THETHAO_TINTUC_HD


94bdc33b-cfd4-48e1-a996-4332932a504c => OS_ONSPORT10
c14f01f6-eb20-4621-b0aa-7b15be8faa42 => OS_ONSPORT9
52f4e72c-27a0-4c96-8aa5-4cf81e006521 => OS_ONSPORT8
6e301a6c-7b9c-4129-b014-7f40bbf85c49 => OS_ONSPORT7 f92daeb0-6845-4da9-8b32-4b8c479bdfe8
41d73347-723c-4303-94dc-8d9f332d3f75 => OS_ONSPORT6
2a941d18-bffc-4c93-ba08-bae7ebfdb1da => OS_ONSPORT5

e2129578-ad42-4a17-b391-253844f6dfc2 => onlivetv9 | https://cdn-live.onlivetv.vn/livehttporigin/smil:onlivetv09.smil/manifest.mpd 
1ced33d8-c821-4ab8-8b53-f17899988440 => onlivetv8 | https://cdn-live.onlivetv.vn/livehttporigin/smil:onlivetv08.smil/manifest.mpd
f92daeb0-6845-4da9-8b32-4b8c479bdfe8 => onlivetv4
93a6c5ec-92eb-4ecf-8c50-64072f9dfa7f => SCTV22HD
eddd7b89-1a5e-44ca-98f3-d6aa993e0bf9 => SCTV15HD
16922d09-8b39-4b85-8703-ba757698acf5 => HTV4
cdd222b8-c8fc-40c6-8baf-540d55469932 => INFO_TV_CL | VTV7 
2987336b-ce50-42ae-80a3-d24e0c0f73b3 => VTV5TNB

"93a6c5ec-92eb-4ecf-8c50-64072f9dfa7f", // => SCTV22HD
"eddd7b89-1a5e-44ca-98f3-d6aa993e0bf9", // => SCTV15HD
"16922d09-8b39-4b85-8703-ba757698acf5", // => HTV4
"cdd222b8-c8fc-40c6-8baf-540d55469932", // => INFO_TV_CL | VTV7 
"2987336b-ce50-42ae-80a3-d24e0c0f73b3", // => VTV5TNB


```php
<?php

$FALLBACK_URL = "https://freem3u.xyz/static/no-signal/low.m3u8";

$ALLOWED_IDS = [
20,19,2,3,4,108,110,157,207,6,115,8,98,9951,180,177,175,176,181,182,
136,178,179,189,184,185,186,187,188,173,183,170,174,169,201,232,190,
191,192,9,151,193,195,194,14,133,11,15,12,132,13,66,35,39,46,48,47,
61,84,49,80,51,52,53,255,54,90,55,33,34,32,31,58,60,59,63,64,65,76,
68,70,71,69,45,74,75,77,81,82,134,83,85,72,89,88,92,25,26,219,220,
91,271,277,159,239,9855,279,235,213,273,281,283,237,275,163,215,214,
99,9856,216,9901,111,112,96,106,9888,9904,9902,9903,9934,2554,1,148,
2458,9867,9868,9869,9870,9887,9957,9958,10001
];

// CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$id = $_GET['id'] ?? null;
$r  = $_GET['r'] ?? null;

// ✅ check id
function isValidId($id, $ALLOWED_IDS) {
    if (!is_numeric($id)) return false;
    $num = intval($id);
    return $num > 0 && in_array($num, $ALLOWED_IDS);
}

// ❌ invalid → fallback
if (!isValidId($id, $ALLOWED_IDS)) {
    if ($r === "true") {
        header("Location: $FALLBACK_URL", true, 302);
        exit;
    }

    echo json_encode([
        "id" => $id,
        "url" => $FALLBACK_URL,
        "error" => "Invalid id"
    ]);
    exit;
}


// 🔥 get stream
function getStreamUrl($id) {
    $arr = [
        "https://vietanhtv.id.vn/tv360/$id/index.m3u8",
        "https://kubolive.ddns.net/vanh_tv.php?provider=tv360&id=$id",
        "https://backup2.vietanhtv.id.vn/tv360/$id/index.m3u8"
    ];

    foreach ($arr as $url) {
        $ch = curl_init($url);

        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_NOBODY => false,
            CURLOPT_TIMEOUT => 10
        ]);

        curl_exec($ch);

        $finalUrl = curl_getinfo($ch, CURLINFO_EFFECTIVE_URL);
        $status   = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        curl_close($ch);

        if ($finalUrl && $finalUrl !== $url) {
            return $finalUrl;
        }

        if ($status == 200) {
            return $url;
        }
    }

    return null;
}


$url = getStreamUrl($id);
$finalUrl = $url ?: $FALLBACK_URL;


// 🔥 redirect nếu r=true
if ($r === "true") {
    header("Location: $finalUrl", true, 302);
    exit;
}

// trả JSON
header("Content-Type: application/json");
echo json_encode([
    "id" => $id,
    "url" => $finalUrl
]);

```






















```html 

                <div class="box-main-live">
                    <div class="list-box-live">
                        <div class="link-match-full item_streaming stream_m_live stream_m_blv stream_m_hot stream_m_today ">
                            <a href="/truc-tiep/pham-hoai-nam-vs-ning-xu-fei-1120-20-04-2026/601408393" class="link-match-main"></a>
                            <div class="box-live-main live">
                                <div class="box-absolute-football">
                                    <div class="img-absolute-head">
                                        <img src="https://cdn-live.taoxanh.biz/live-dev/categories/2025/03/21/60316a7d789150096e2356c3ba13f0b4.jpg" alt="Billiards">
                                    </div>
                                </div>
                                <div class="head-box-live">
                                    <div class="time-box-live">
                                        <div class="live-red">
                                            <div class="box-live-red flicker">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                                                    <circle cx="4" cy="4" r="4" fill="#FF0000"/>
                                                </svg>
                                            </div>
                                            <span>Live</span>
                                        </div>
                                        <div class="line-column-gray"></div>
                                        <div class="span-time">
                                            <span>11:20 - 20/04</span>
                                        </div>
                                    </div>
                                    <div class="name-tour">
                                        <span>Duya Legends Golden Nine International Classic</span>
                                    </div>
                                </div>
                                <div class="info-match-live">
                                    <div class="club-left">
                                        <div class="name-club">
                                            <span>Phạm Hoài Nam</span>
                                        </div>
                                        <div class="logo-club">
                                            <img src="https://cdn-live.taoxanh.biz/live-dev/cms/d2d85b8a3ba71b2595c47d68b6699483.png" alt="Phạm Hoài Nam">
                                        </div>
                                    </div>
                                    <div class="match-live-center">
                                        <div class="score-live">
                                            <span>: </span>
                                        </div>
                                    </div>
                                    <div class="club-right">
                                        <div class="logo-club">
                                            <img src="https://cdn-live.taoxanh.biz/live-dev/cms/7a688259073e810cd665a26385049933.png" alt="NING XU FEI">
                                        </div>
                                        <div class="name-club">
                                            <span>NING XU FEI</span>
                                        </div>
                                    </div>
                                </div>
                                <!--    -->
                            </div>
                            <div class="button-bet-now">
                                <div class="box-blv-bet">
                                    <div class="list-commentator fix-width scroll-inner">
                                        <div class="box-commentator">
                                            <div class="img-commentator">
                                                <img src="https://cdn-live.taoxanh.biz/live-dev/user_avatar/2026/03/04/d4ed940aa4a18426ccd5ce5ad8a96d51.png" alt="BLV Bún Than">
                                            </div>
                                            <span class="span-commentator">BLV Bún Than</span>
                                        </div>
                                    </div>
                                </div>
                                <a target="blank" data-colors="" class="bet-now" rel="nofollow sponsored" style="background-color: rgb(240, 88, 47)" href="https://man88.im/khuyen-mai/the-loai/thuong-nap/?a=722b10c004e607be3ffbc147372cc9b2&utm_source=bunchatv&utm_medium=nutcuoctoantran&utm_campaign=cpd&utm_term=live&referrer_domain=bunchatv3.com">
                                    <span>CƯỢC NGAY</span>
                                </a>
                            </div>
                        </div>
                        <div class="link-match-full item_streaming stream_m_live stream_m_today ">
                            <a href="/truc-tiep/persipegaf-vs-ransiki-1310-20-04-2026/601408441" class="link-match-main"></a>
                            <div class="box-live-main ">
                                <div class="box-absolute-football">
                                    <div class="img-absolute-head">
                                        <img src="https://cdn-live.taoxanh.biz/live-dev/categories/2025/03/21/29209907ed8331043581e143b9897df4.jpg" alt="Bóng đá">
                                    </div>
                                </div>
                                <div class="head-box-live">
                                    <div class="time-box-live">
                                        <div class="live-red">
                                            <div class="box-live-red flicker">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                                                    <circle cx="4" cy="4" r="4" fill="#FF0000"/>
                                                </svg>
                                            </div>
                                            <span>Live</span>
                                        </div>
                                        <div class="line-column-gray"></div>
                                        <div class="span-time">
                                            <span>13:10 - 20/04</span>
                                        </div>
                                    </div>
                                    <div class="name-tour">
                                        <span>Indo D4</span>
                                    </div>
                                </div>
                                <div class="info-match-live">
                                    <div class="club-left">
                                        <div class="name-club">
                                            <span>Persipegaf</span>
                                        </div>
                                        <div class="logo-club">
                                            <img src="https://cdn-live.taoxanh.biz/live-dev/football/team/logo/b66ac3b18571ea59bac670ef4a7cc717.png" alt="Persipegaf">
                                        </div>
                                    </div>
                                    <div class="match-live-center">
                                        <div class="time-live">
                                            <span>67</span>
                                            <span class="flicker">'</span>
                                        </div>
                                        <div class="score-live">
                                            <span>2 : 0</span>
                                        </div>
                                    </div>
                                    <div class="club-right">
                                        <div class="logo-club">
                                            <img src="https://cdn-live.taoxanh.biz/live-dev/football/team/logo/9edfd5e195b72dac187feb26507df3b6.png" alt="Ransiki">
                                        </div>
                                        <div class="name-club">
                                            <span>Ransiki</span>
                                        </div>
                                    </div>
                                </div>
                                <!--    -->
                            </div>
                            <div class="button-bet-now">
                                <div class="box-blv-bet">
                                    <div class="list-commentator fix-width scroll-inner">
                                        <div class="box-commentator">
                                            <div class="img-commentator">
                                                <img alt="Quốc tế" decoding="async" src="/img/earth.png" data-nimg="1" loading="lazy" style="color: transparent;">
                                            </div>
                                            <span class="span-commentator">BLV Quốc tế</span>
                                        </div>
                                    </div>
                                </div>
                                <a target="blank" data-colors="" class="bet-now" rel="nofollow sponsored" style="background-color: rgb(240, 88, 47)" href="https://man88.im/khuyen-mai/the-loai/thuong-nap/?a=722b10c004e607be3ffbc147372cc9b2&utm_source=bunchatv&utm_medium=nutcuoctoantran&utm_campaign=cpd&utm_term=live&referrer_domain=bunchatv3.com">
                                    <span>CƯỢC NGAY</span>
                                </a>
                            </div>
                        </div>
                        <div class="link-match-full item_streaming stream_m_live stream_m_today ">
                            <a href="/truc-tiep/xiamen-chengyi-vs-shenzhen-2028-1400-20-04-2026/601387936" class="link-match-main"></a>
                            <div class="box-live-main ">
                                <div class="box-absolute-football">
                                    <div class="img-absolute-head">
                                        <img src="https://cdn-live.taoxanh.biz/live-dev/categories/2025/03/21/29209907ed8331043581e143b9897df4.jpg" alt="Bóng đá">
                                    </div>
                                </div>
                                <div class="head-box-live">
                                    <div class="time-box-live">
                                        <div class="live-red">
                                            <div class="box-live-red flicker">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                                                    <circle cx="4" cy="4" r="4" fill="#FF0000"/>
                                                </svg>
                                            </div>
                                            <span>Live</span>
                                        </div>
                                        <div class="line-column-gray"></div>
                                        <div class="span-time">
                                            <span>14:00 - 20/04</span>
                                        </div>
                                    </div>
                                    <div class="name-tour">
                                        <span>Chinese FA Cup</span>
                                    </div>
                                </div>
                                <div class="info-match-live">
                                    <div class="club-left">
                                        <div class="name-club">
                                            <span>Xiamen Chengyi</span>
                                        </div>
                                        <div class="logo-club">
                                            <img src="https://cdn.rapid-api.icu/football/team/cbdc592f8869a8b84ef211918d2360d3.png" alt="Xiamen Chengyi">
                                        </div>
                                    </div>
                                    <div class="match-live-center">
                                        <div class="time-live">
                                            <span>43</span>
                                            <span class="flicker">'</span>
                                        </div>
                                        <div class="score-live">
                                            <span>0 : 0</span>
                                        </div>
                                    </div>
                                    <div class="club-right">
                                        <div class="logo-club">
                                            <img src="https://cdn-live.taoxanh.biz/live-dev/football/team/logo/13b0f4609a8b8e57d6516649e7954132.png" alt="Shenzhen 2028">
                                        </div>
                                        <div class="name-club">
                                            <span>Shenzhen 2028</span>
                                        </div>
                                    </div>
                                </div>
                                <!--    -->
                            </div>
                            <div class="button-bet-now">
                                <div class="box-blv-bet">
                                    <div class="list-commentator fix-width scroll-inner">
                                        <div class="box-commentator">
                                            <div class="img-commentator">
                                                <img alt="Quốc tế" decoding="async" src="/img/earth.png" data-nimg="1" loading="lazy" style="color: transparent;">
                                            </div>
                                            <span class="span-commentator">BLV Quốc tế</span>
                                        </div>
                                    </div>
                                </div>
                                <a target="blank" data-colors="" class="bet-now" rel="nofollow sponsored" style="background-color: rgb(240, 88, 47)" href="https://man88.im/khuyen-mai/the-loai/thuong-nap/?a=722b10c004e607be3ffbc147372cc9b2&utm_source=bunchatv&utm_medium=nutcuoctoantran&utm_campaign=cpd&utm_term=live&referrer_domain=bunchatv3.com">
                                    <span>CƯỢC NGAY</span>
                                </a>
                            </div>
                        </div>
                    </div>
                 
                </div>
            </div>
          
```