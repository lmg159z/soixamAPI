import axios from "axios";

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "Missing url" });

  try {
    // Axios sẽ follow redirect và giữ URL cuối
    const response = await axios.get(url, {
      maxRedirects: 5,
      timeout: 7000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept": "*/*"
      }
    });

    const finalUrl = response.request.res.responseUrl;

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({ redirect: finalUrl });
  } catch (err) {
    res.status(500).json({ error: err.message || "Internal error" });
  }
}