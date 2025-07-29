export default function handler(req, res) {
  const ua = req.headers['user-agent'] || "";

  // Tuỳ chỉnh danh sách user-agent được phép truy cập
  const allowList = ["VLC", "IPTV", "ExoPlayer", "Lavf", "Kodi"];

  const isAllowed = allowList.some(agent => ua.includes(agent));

  if (isAllowed) {
    // ✅ Redirect đến URL1 (playlist thật)
    res.writeHead(302, {
      Location: "https://google.com"
    });
    res.end();
  } else {
    // ❌ Nếu không hợp lệ
    res.status(403).send("403 Forbidden - Bạn không được phép truy cập playlist này.");
  }
}