// export default async function handler(req, res) {
//   const { url, origin, referer } = req.query;

//   if (!url) {
//     return res.status(400).json({
//       error: "Missing required parameter: url"
//     });
//   }

//   try {
//     const response = await fetch(url, {
//       method: "GET",
//       redirect: "follow", // QUAN TRỌNG
//       headers: {
//         "User-Agent":
//           "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
//         ...(origin && { Origin: origin }),
//         ...(referer && { Referer: referer }),
//       },
//     });

//     // Lấy URL cuối sau redirect
//     const finalUrl = response.url;

//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.json({
//       original: url,
//       resolved: finalUrl
//     });

//   } catch (err) {
//     res.status(500).json({
//       error: "Resolve failed",
//       message: err.message
//     });
//   }
// }


export default async function handler(req, res) {
  const { url, origin, referer, r } = req.query;

  if (!url) {
    return res.status(400).json({
      error: "Missing required parameter: url"
    });
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow", // BẮT redirect
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        ...(origin && { Origin: origin }),
        ...(referer && { Referer: referer }),
      },
    });

    // URL cuối cùng sau redirect
    const finalUrl = response.url;

    // ✅ NẾU r=1 → CHUYỂN HƯỚNG HOÀN TOÀN
    if (r === "1") {
      return res.redirect(302, finalUrl);
      // hoặc 307 nếu muốn giữ method
      // return res.redirect(307, finalUrl);
    }

    // ❌ KHÔNG redirect → trả JSON (tuỳ bạn giữ hay bỏ)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.json({
      original: url,
      resolved: finalUrl
    });

  } catch (err) {
    res.status(500).json({
      error: "Resolve failed",
      message: err.message
    });
  }
}
