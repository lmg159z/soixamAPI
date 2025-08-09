import { HttpsProxyAgent } from "https-proxy-agent";

export default async function handler(req, res) {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: "Thiếu tham số url" });
  }

  // Proxy HTTP bạn đã có
  const proxy = "http://14.225.210.186:3129";
  const agent = new HttpsProxyAgent(proxy);

  try {
    const response = await fetch(url, { method: "HEAD", agent }); // chỉ HEAD để kiểm tra nhanh
    const status = response.status;

    if (status === 200) {
      return res.status(200).json({ url, status });
    } else {
      return res.status(status).json({ url, status });
    }
  } catch (error) {
    return res.status(500).json({ url, status: "error", message: error.message });
  }
}