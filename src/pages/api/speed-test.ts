import type { APIRoute } from "astro";

// Lightweight upload-speed-test endpoint. The client POSTs ~3 MB of dummy bytes;
// the Worker just drains the body and responds 204. The client measures elapsed
// time to estimate upload throughput before kicking off a real Stream upload.
//
// Auth-gated to prevent random hammering. No DB writes, no external calls.
export const POST: APIRoute = async ({ locals, request }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Drain the body so the upload completes. We don't care about the contents.
  if (request.body) {
    const reader = request.body.getReader();
    while (true) {
      const { done } = await reader.read();
      if (done) break;
    }
  }

  return new Response(null, { status: 204 });
};
