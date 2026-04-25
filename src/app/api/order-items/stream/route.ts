import {
  orderItemsBus,
  type OrderItemsRealtimeEvent,
} from "@/lib/realtime/order-items-bus";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const area = searchParams.get("area");
  const orderId = searchParams.get("orderId");

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(`: keep-alive\n\n`));
      }, 25000);

      const handler = (event: OrderItemsRealtimeEvent) => {
        if (area && "area" in event && event.area !== area) return;
        if (orderId && event.orderId !== Number(orderId)) return;

        controller.enqueue(
          encoder.encode(
            `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`,
          ),
        );
      };

      orderItemsBus.on("order-items", handler);

      const cleanup = () => {
        clearInterval(keepAlive);
        orderItemsBus.off("order-items", handler);
        controller.close();
      };

      request.signal.addEventListener("abort", cleanup);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
