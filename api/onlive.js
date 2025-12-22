import { HttpsProxyAgent } from 'https-proxy-agent';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { id, live } = req.query;

    if (!id) return res.status(400).json({ error: "Thieu id" });

    // Sử dụng Proxy từ danh sách của bạn
    const proxyUrl = 'http://123.30.154.171:7777'; 
    const agent = new HttpsProxyAgent(proxyUrl);

    try {
        const targetUrl = `https://api.m.onlive.vn/broad/a/watch?bjid=${id}`;
        
        // Sử dụng fetch mặc định của Node.js (không cần import)
        const response = await fetch(targetUrl, {
            method: 'POST',
            // Lưu ý: fetch mặc định của Node dùng dispatcher thay vì agent cho Proxy
            // Nhưng để đơn giản, hãy thử chạy KHÔNG Proxy trước để check xem thông chưa
            headers: {
                'Origin': 'https://onlive.vn',
                'Referer': `https://onlive.vn/live/${id}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0...'
            },
            body: new URLSearchParams({
                'bj_id': id, 'agent': 'web', 'confirm_adult': 'false', 'player_type': 'webm', 'mode': 'live'
            }).toString()
        });

        const data = await response.json();
        if (live === 'true' && data.data?.hls_authentication_key) {
            return res.redirect(302, `https://pc-web.stream.onlive.vn/live-stm-04/auth_playlist.m3u8?aid=${data.data.hls_authentication_key}`);
        }
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}