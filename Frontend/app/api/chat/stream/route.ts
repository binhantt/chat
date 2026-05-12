const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const backendResponse = await fetch(`${BACKEND_URL}/api/chat/stream`, {
    method: "GET",
    headers: {
      Accept: "text/event-stream",
      Cookie: request.headers.get("cookie") || "",
    },
    cache: "no-store",
  });

  if (!backendResponse.ok || !backendResponse.body) {
    return new Response("Unable to open chat stream", {
      status: backendResponse.status,
    });
  }

  return new Response(backendResponse.body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
