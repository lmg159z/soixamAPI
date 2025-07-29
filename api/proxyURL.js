
export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send("Thiếu tham số 'url'");
  }

  try {
    const response = await fetch(url);
    const contentType = response.headers.get("content-type") || "text/plain";
    const body = await response.text();

    res.setHeader("Content-Type", contentType);
    res.status(response.status).send(body);
  } catch (error) {
    res.status(500).send("Lỗi khi truy cập URL: " + error.message);
  }
}

