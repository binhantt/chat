const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const controller = new AbortController();

  request.signal.addEventListener("abort", () => controller.abort(), {
    once: true,
  });

  let backendResponse: Response;

  try {
    backendResponse = await fetch(`${BACKEND_URL}/api/v1/chat/stream`, {
      method: "GET",
      headers: {
        Accept: "text/event-stream",
        Cookie: request.headers.get("cookie") || "",
        "X-CSRF-Token":
          request.headers.get("x-csrf-token") ||
          decodeURIComponent(
            (request.headers.get("cookie") || "").match(
              /(?:^|;\s*)csrf_token=([^;]+)/,
            )?.[1] || "",
          ),
      },
      cache: "no-store",
      signal: controller.signal,
    });
  } catch {
    return new Response(null, { status: 204 });
  }

  if (!backendResponse.ok || !backendResponse.body) {
    return new Response("Unable to open chat stream", {
      status: backendResponse.status,
    });
  }

  const reader = backendResponse.body.getReader();
  const stream = new ReadableStream({
    async pull(streamController) {
      try {
        const { done, value } = await reader.read();

        if (done) {
          streamController.close();
          return;
        }

        streamController.enqueue(value);
      } catch (error) {
        controller.abort();

        try {
          streamController.close();
        } catch {
          // The browser may already have closed the EventSource connection.
        }
      }
    },
    cancel() {
      controller.abort();
      void reader.cancel().catch(() => undefined);
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
