// api/index.js - Vercel Serverless Function

// ─── CẤU HÌNH ────────────────────────────────────────────────────────────────
// Định dạng start/end: "DD-MM-YY_HH:MM" (GMT+7)
const CREDENTIALS = [
  { user: "admin", pass: "123456", start: "01-05-25_00:00", end: "31-12-26_23:59" },
  { user: "vmt", pass: "vmt@xITXXX8M", start: "01-01-26_00:00", end: "31-12-26_23:59" },
];

// ─── UTILS ────────────────────────────────────────────────────────────────────

// Parse "DD-MM-YY_HH:MM" (GMT+7) → Date (UTC)
function parseTime(str) {
  const [datePart, timePart] = str.split("_");
  const [dd, mm, yy] = datePart.split("-").map(Number);
  const [hh, min]    = timePart.split(":").map(Number);
  const fullYear = 2000 + yy;
  // Trừ 7 tiếng để convert GMT+7 → UTC
  return new Date(Date.UTC(fullYear, mm - 1, dd, hh - 7, min));
}

function isAccountAlive(account) {
  const now   = new Date();
  const start = parseTime(account.start);
  const end   = parseTime(account.end);
  return now >= start && now <= end;
}

// ─── HANDLER ─────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { user, pass, id } = req.query;

  // 1. Tìm account khớp user/pass
  const account = CREDENTIALS.find(
    (c) => c.user === user && c.pass === pass
  );

  if (!account) {
    return res.status(401).json({ error: "Unauthorized: sai user hoặc pass" });
  }

  // 2. Kiểm tra còn trong thời hạn không
  if (!isAccountAlive(account)) {
    return res.status(403).json({ error: "Forbidden: tài khoản hết hạn" });
  }

  // 3. Kiểm tra id
  if (!id || isNaN(parseInt(id, 10))) {
    return res.status(400).json({ error: "Thiếu hoặc sai định dạng id (phải là số nguyên)" });
  }

  const numericId = parseInt(id, 10);

  // 4. Gọi external API
 // 4. Gọi external API
let externalData;

try {
  const url = `https://andanh.site/myTV/mytv.php?id=${numericId}&debug=1`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",

      "Accept": "application/json, text/plain, */*",
      "Accept-Language": "vi-VN,vi;q=0.9,en;q=0.8",
      "Referer": "https://andanh.site/",
      "Origin": "https://andanh.site",
      "Cache-Control": "no-cache",
      "Pragma": "no-cache",
    },
  });

  if (!response.ok) {
    const text = await response.text();

    throw new Error(
      `External API trả về HTTP ${response.status} | ${text}`
    );
  }

  externalData = await response.json();

} catch (err) {
  return res.status(502).json({
    error: "Không thể lấy dữ liệu từ external API",
    detail: err.message,
  });
}
  // 5. Trả về json của external API
  return res.status(200).json(externalData);
}