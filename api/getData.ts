// /api/proxy.ts
export const config = { runtime: "edge" };

const ALLOW_ORIGIN = "*"; // có thể đổi sang domain của bạn để an toàn hơn

export default async function handler(req: Request): Promise<Response> {
  // Xử lý CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders() });
  }

  // Lấy tham số: ?url=... hoặc ?api=...
  const { searchParams } = new URL(req.url);
  const target = searchParams.get("url") || searchParams.get("api");
  if (!target) {
    return json({ error: "Thiếu tham số ?url hoặc ?api" }, 400);
  }

  // Validate URL
  let targetURL: URL;
  try {
    targetURL = new URL(target);
  } catch {
    return json({ error: "URL không hợp lệ" }, 400);
  }
  if (!["http:", "https:"].includes(targetURL.protocol)) {
    return json({ error: "Chỉ cho phép http/https" }, 400);
  }

  // Chuẩn bị yêu cầu upstream (chỉ GET cho an toàn)
  const upstreamInit: RequestInit = {
    method: "GET",
    headers: new Headers(),
  };

  // Truyền một số header hữu ích
  const accept = req.headers.get("accept");
  if (accept) upstreamInit.headers!.set("accept", accept);

  try {
    const upstream = await fetch(targetURL.toString(), upstreamInit);

    // Trả body stream + status, thêm CORS
    const respHeaders = new Headers(upstream.headers);
    respHeaders.set("Access-Control-Allow-Origin", ALLOW_ORIGIN);
    respHeaders.set("Access-Control-Allow-Methods", "GET,OPTIONS");
    respHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: respHeaders,
    });
  } catch (err) {
    return json({ error: "Không fetch được upstream", detail: String(err) }, 502);
  }
}

function corsHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": ALLOW_ORIGIN,
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Max-Age": "86400",
  };
}

function json(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(),
    },
  });
}