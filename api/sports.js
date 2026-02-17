
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
                            return {
                                id: i.id,
                                match_time: convertToGMT7Format(i.match_time),
                                status: checkTimeGMT7(convertToGMT7Format(i.match_time))   === 2 &  i.stream_link === "" ? 3 : 2,
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
    const logoUrl = "http://127.0.0.1:5501/media/logo/SXTV.png";

    arr.forEach(match => {
        // Lấy thông tin cơ bản
        const homeName = match.home_team ? match.home_team.name : "Unknown Home";
        const awayName = match.away_team ? match.away_team.name : "Unknown Away";
        const time = match.match_time;
        const leagueName = match.league ? match.league.name : "Unknown League";

        // Tạo tên hiển thị chuẩn
        // Định dạng: LIVE | Tên Đội 1 vs Đội 2 | Thời gian
        const baseTitle = `LIVE | ${homeName} vs ${awayName} | ${time}`;

        // 1. Xử lý Main Stream Link (stream_link)
        if (match.stream_link && match.stream_link.trim() !== "") {
            // Kiểm tra ngoại lệ: bỏ qua nếu link chứa "ytb"
            if (!match.stream_link.includes("ytb")) {
                m3uList += `#EXTINF:-1 tvg-logo="${logoUrl}" group-title="${leagueName}",${baseTitle} (Main)\n`;
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
                    m3uList += `#EXTINF:-1 tvg-logo="${logoUrl}" group-title="${leagueName}",${baseTitle} (VIP ${index + 1})\n`;
                    m3uList += `${link}\n`;
                }
            });
        }
    });

    return m3uList;
}





function checkTimeGMT7(inputTime) {
    // ---- 1. Lấy thời gian hiện tại theo GMT+7 ----
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const nowGMT7 = new Date(utc + (7 * 60 * 60000));

    // ---- 2. Parse input DD:MM:YY-HH:MM ----
    const [datePart, timePart] = inputTime.split("-");
    const [day, month, year] = datePart.split(":").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);

    const fullYear = year < 100 ? 2000 + year : year;

    // Tạo thời gian mục tiêu theo GMT+7
    const target = new Date(
        Date.UTC(fullYear, month - 1, day, hour - 7, minute)
    );

    // ---- 3. Tính chênh lệch phút ----
    const diffMinutes = (target - nowGMT7) / 60000;

    // ---- 4. Logic trả kết quả ----
    if (diffMinutes > 20) return 0;
    if (diffMinutes > 0 && diffMinutes <= 20) return 1;
    return 2;
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
