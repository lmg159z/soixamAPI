export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send("Missing url");
  }

  try {
    const r = await fetch(url, {
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
    });

    // Redirect trình duyệt sang url2
    res.statusCode = 302;
    res.setHeader("Location", r.url);
    res.end();

  } catch (e) {
    res.status(500).send(e.message);
  }
}
