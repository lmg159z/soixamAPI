export default async function handler(req, res) {
  const { url, origin, referer } = req.query;

  if (!url) {
    return res.status(400).json({
      error: "Missing required parameter: url"
    });
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow", // QUAN TRỌNG
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        ...(origin && { Origin: origin }),
        ...(referer && { Referer: referer }),
      },
    });

    // Lấy URL cuối sau redirect
    const finalUrl = response.url;
res.setHeader("Access-Control-Allow-Origin", "*");
res.redirect(finalUrl);


  } catch (err) {
    res.status(500).json({
      error: "Resolve failed",
      message: err.message
    });
  }
}
