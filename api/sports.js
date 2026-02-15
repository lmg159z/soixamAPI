export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    try {
        const { id } = req.query;
        const rows = await ALLData();

        if (!id) {
            return res.status(200).json(rows);
        }

        const data = rows.data.find(item => item.id == id) || null;

        return res.status(200).json(data);

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


function convertToVNFormat(isoString) {
    // Tạo date từ UTC
    const date = new Date(isoString);

    // Cộng thêm 7 giờ (GMT+7)
    const vnTime = new Date(date.getTime() + (7 * 60 * 60 * 1000));

    const day = String(vnTime.getDate()).padStart(2, '0');
    const month = String(vnTime.getMonth() + 1).padStart(2, '0');
    const year = String(vnTime.getFullYear()).slice(-2);
    const hours = String(vnTime.getHours()).padStart(2, '0');
    const minutes = String(vnTime.getMinutes()).padStart(2, '0');

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
                        `https://apigw.bunchatv2.com/sport/matches?category_id=${i.id}&page=1&page_size=20&status=100&sort=hot&start_time=${time.newTime}&end_time=${time.backTime}&withfollow=binhluan`
                    );

                    // Kiểm tra có phải mảng và có phần tử
                    if (Array.isArray(data?.data) && data.data.length > 0) {
                        // return data.data[0];
                        return data.data.map(i => {
                            return {
                                id: i.id,
                                match_time: convertToVNFormat(i.match_time),
                                status: i.status,
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
        data: await Promise.all(ALL.flat())
    }

}



