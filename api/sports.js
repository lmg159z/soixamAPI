
export default async function handler(req, res) {
    // 1. Cấu hình CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    try {
        const { id } = req.query;
        
        // 2. Lấy dữ liệu
        const rows = await ALLData(); 
        // Giả sử rows trả về { data: [...] } như dữ liệu mẫu của bạn
        // Nếu ALLData() trả về mảng trực tiếp thì sửa thành const dataList = rows;
        const dataList = rows.data || []; 

        // TRƯỜNG HỢP 1: Không có ID -> Trả về toàn bộ JSON
        if (!id) {
            return res.status(200).json(rows);
        }

        // TRƯỜNG HỢP 2: ID là "iptv" -> Trả về file M3U (dạng text)
        if (id === "iptv") {
            const m3uContent = generateM3U(dataList);
            
            // Quan trọng: Set header là text/plain hoặc application/x-mpegurl để trình duyệt hiểu
            res.setHeader("Content-Type", "text/plain; charset=utf-8");
            return res.status(200).send(m3uContent); // Dùng .send() cho text
        }

        // TRƯỜNG HỢP 3: ID là số (hoặc string khác) -> Tìm item và trả về JSON
        // Tìm item có id trùng khớp
        const matchItem = dataList.find(item => item.id == id);
        
        if (matchItem) {
            return res.status(200).json(matchItem);
        } else {
            return res.status(404).json({ error: "Không tìm thấy trận đấu" });
        }

    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        return res.status(500).json({
            error: "Không thể lấy dữ liệu"
        });
    }
}



async function getAPI(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error("Lỗi khi gọi API:", err.message);
        return null;
    }
}

function getTimeObject() {
    const now = new Date();

    // Tạo biến future bằng cách copy now và cộng thêm 5 ngày
    const future = new Date(now);
    future.setDate(future.getDate() + 5);

    const formatGMT7 = (dateInput) => {
        // 1. Lấy timestamp hiện tại (tính bằng mili giây)
        // 2. Cộng thêm 7 tiếng (7 giờ * 60 phút * 60 giây * 1000 ms)
        const gmt7Time = new Date(dateInput.getTime() + (7 * 60 * 60 * 1000));

        // 3. Sử dụng các hàm getUTC... thay vì get...
        // Lý do: Vì ta đã chủ động cộng 7 tiếng vào timestamp, nên ta cần lấy
        // giờ UTC của timestamp mới đó để ra được giờ GMT+7 chuẩn.
        // Nếu dùng getHours() thường, nó sẽ lại cộng thêm múi giờ của server vào nữa -> sai.

        const year = gmt7Time.getUTCFullYear();
        const month = String(gmt7Time.getUTCMonth() + 1).padStart(2, '0');
        const day = String(gmt7Time.getUTCDate()).padStart(2, '0');
        const hours = String(gmt7Time.getUTCHours()).padStart(2, '0');
        const minutes = String(gmt7Time.getUTCMinutes()).padStart(2, '0');
        const seconds = String(gmt7Time.getUTCSeconds()).padStart(2, '0');

        return `${year}-${month}-${day}+${hours}:${minutes}:${seconds}`;
    };

    return {
        newTime: formatGMT7(now),
        backTime: formatGMT7(future)
    };
}


function convertToGMT7Format(isoString) {
    // Tạo Date từ ISO (ISO có Z => luôn là UTC chuẩn)
    const utc = new Date(isoString);

    // Lấy timestamp tuyệt đối (không phụ thuộc timezone máy)
    const utcTimestamp = utc.getTime();

    // Cộng thêm 7 giờ (GMT+7)
    const gmt7Timestamp = utcTimestamp + (7 * 60 * 60 * 1000);

    // Tạo lại Date từ timestamp mới
    const gmt7 = new Date(gmt7Timestamp);

    // LUÔN dùng getUTC* để tránh lệch môi trường
    const day = String(gmt7.getUTCDate()).padStart(2, '0');
    const month = String(gmt7.getUTCMonth() + 1).padStart(2, '0');
    const year = String(gmt7.getUTCFullYear()).slice(-2);
    const hours = String(gmt7.getUTCHours()).padStart(2, '0');
    const minutes = String(gmt7.getUTCMinutes()).padStart(2, '0');

    return `${day}:${month}:${year}-${hours}:${minutes}`;
}



function getObjectById(arr, id) {
    return arr.find(item => String(item.id) === String(id)) || null;
}


async function ALLData() {
    const getID = await getAPI("https://apigw.bunchatv2.com/home/categories-matches")
    const time = getTimeObject()
    const ALL = (
        await Promise.all(
            getID.data.map(async (i) => {
                try {
                    const data = await getAPI(
                        `https://apigw.bunchatv2.com/sport/matches?category_id=${i.id}&page=1&page_size=100&status=100&sort=hot&start_time=${time.newTime}&end_time=${time.backTime}`
                    );

                    console.log(`https://apigw.bunchatv2.com/sport/matches?category_id=${i.id}&page=1&page_size=100&status=100&sort=hot&start_time=${time.newTime}&end_time=${time.backTime}`)

                    // Kiểm tra có phải mảng và có phần tử
                    if (Array.isArray(data?.data) && data.data.length > 0) {
                        // return data.data[0];
                        return data.data.map(i => {
                            const status = getMatchStatus(convertToGMT7Format(i.match_time)) === 0 ? 0 : (i.stream_link === "" ? 3 : 2)
                            return {
                                id: i.id,
                                match_time: convertToGMT7Format(i.match_time),
                                status: status,
                                stream_link: i.stream_link,
                                commentary_links: i.commentary_links,
                                league: i.league,
                                home_team: i.home_team,
                                away_team: i.away_team,
                            }
                        })
                    }

                    // Nếu không hợp lệ → bỏ qua
                    return null;

                } catch (err) {
                    return null;
                }
            })
        )
    ).filter(Boolean); // loại null
    return {
        src: "bunchatv",
        data:sortByNearestTime( await Promise.all(ALL.flat()))
    }

}






function generateM3U(arr) {
    // Header bắt buộc của file M3U
    let m3uList = "#EXTM3U\n";
    
    // Logo cố định theo yêu cầu
    const logoUrl = "https://sxtv.andanh.site/media/logo/SXTV.png";

    arr.forEach(match => {
        // Lấy thông tin cơ bản
        const homeName = match.home_team ? match.home_team.name : "Unknown Home";
        const awayName = match.away_team ? match.away_team.name : "Unknown Away";
        const time = match.match_time;
        const leagueName = match.league ? match.league.name : "Unknown League";

        // Tạo tên hiển thị chuẩn
        // Định dạng: LIVE | Tên Đội 1 vs Đội 2 | Thời gian
        const baseTitle = `${homeName} vs ${awayName} | ${time} | ${leagueName}`;
        

        // 1. Xử lý Main Stream Link (stream_link)
        if (match.stream_link && match.stream_link.trim() !== "") {
            // Kiểm tra ngoại lệ: bỏ qua nếu link chứa "ytb"
            if (!match.stream_link.includes("ytb")) {
                m3uList += `#EXTINF:-1 tvg-logo="${logoUrl}" group-title="${leagueName}",Main | ${baseTitle} \n`;
                m3uList += `${match.stream_link}\n`;
            }
        }

        // 2. Xử lý Commentary Links (commentary_links)
        if (match.commentary_links && Array.isArray(match.commentary_links)) {
            match.commentary_links.forEach((comItem, index) => {
                const link = comItem.link;
                
                // Kiểm tra link tồn tại và không chứa "ytb"
                if (link && link.trim() !== "" && !link.includes("ytb")) {
                    // Đặt tên cho các link phụ, thêm số thứ tự để không bị trùng tên
                    m3uList += `#EXTINF:-1 tvg-logo="${logoUrl}" group-title="${leagueName}",(FEED ${index + 1}) | ${baseTitle} \n`;
                    m3uList += `${link}\n`;
                }
            });
        }
    });

    return m3uList;
}





function getMatchStatus(timeStr) {
    // Input format: "DD:MM:YY-HH:MM" (Ví dụ: "19:02:26-07:30")
    if (!timeStr) return 0;

    try {
        // 1. Cắt chuỗi
        const parts = timeStr.split('-');
        const dPart = parts[0].split(':'); // [19, 02, 26]
        const tPart = parts[1].split(':'); // [07, 30]

        const day = parseInt(dPart[0], 10);
        const month = parseInt(dPart[1], 10) - 1; // Tháng trong JS bắt đầu từ 0
        const year = 2000 + parseInt(dPart[2], 10); // "26" -> 2026
        const hour = parseInt(tPart[0], 10);
        const minute = parseInt(tPart[1], 10);

        // 2. Tính Timestamp của trận đấu (Giả định input là GMT+7)
        // Date.UTC trả về giờ Quốc tế, ta trừ 7 tiếng để ép nó hiểu số giờ input là giờ VN
        const matchTimeMs = Date.UTC(year, month, day, hour, minute) - (7 * 60 * 60 * 1000);

        // 3. Lấy Timestamp hiện tại
        const nowMs = Date.now();

        // 4. Logic kiểm tra
        // Ngưỡng bắt đầu hiện số 2 là: Trước trận đấu 20 phút
        const twentyMinutesMs = 20 * 60 * 1000;
        const triggerTime = matchTimeMs - twentyMinutesMs;

        // Nếu hiện tại < thời gian kích hoạt (tức là còn sớm, chưa đến lúc)
        if (nowMs < triggerTime) {
            return 0; 
        } 
        
        // Nếu hiện tại >= thời gian kích hoạt (bao gồm cả đang đá hoặc đá xong)
        // Yêu cầu: "từ lúc tới ... đến sau thời gian hiện tại" -> Return 2
        return 2;

    } catch (e) {
        console.error("Lỗi format ngày tháng:", e);
        return 0;
    }
}



function parseMatchTime(match_time) {
    // match_time: "DD:MM:YY-HH:MM"
    const [datePart, timePart] = match_time.split("-")
    const [day, month, year] = datePart.split(":").map(Number)
    const [hour, minute] = timePart.split(":").map(Number)

    // year dạng 2 số → convert thành 20xx
    const fullYear = 2000 + year

    return new Date(fullYear, month - 1, day, hour, minute)
}

function sortByNearestTime(arr) {
    return arr.sort((a, b) => {
        const timeA = parseMatchTime(a.match_time).getTime()
        const timeB = parseMatchTime(b.match_time).getTime()
        return timeA - timeB   // gần → xa
    })
}
