import axios from "axios";

export default async function handler(req, res) {
  // CORS hỗ trợ client gọi
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const rawUrl = req.query.url;
  if (!rawUrl) return res.status(400).json({ error: "Missing url" });

  try {
    // Decode đề phòng URL bị encode
    const url = decodeURIComponent(rawUrl);

    const response = await axios.get(url, {
      maxRedirects: 5,
      timeout: 7000,
      responseType: "text",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        Accept: "*/*",
      },
      validateStatus: (status) => status < 500, // tránh throw nếu lỗi 4xx
    });

    const finalUrl =
      response?.request?.res?.responseUrl || response?.config?.url;

    res.status(200).json({
      redirect: finalUrl,
      status: response.status,
      contentType: response.headers["content-type"],
    });
  } catch (err) {
    console.error("Axios failed:", err.message);
    res.status(500).json({ error: "Fetch failed", detail: err.message });
  }
}