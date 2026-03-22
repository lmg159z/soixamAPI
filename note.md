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