// app/api/stream/route.ts
import { subscribeToOrderItemsEvents } from "@/lib/realtime/order-items-bus";
import type { OrderItemsRealtimeEvent } from "@/lib/realtime/order-items-bus";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Si tienes plan Pro, puedes añadir esto para extender el timeout (opcional)
// export const maxDuration = 120; // segundos

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const area = searchParams.get("area");
  const orderId = searchParams.get("orderId");

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Keep‑alive cada 25 segundos (o 5 si prefieres)
      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(`: keep-alive\n\n`));
      }, 25000);

      const handler = (event: OrderItemsRealtimeEvent) => {
        // Filtros por área y por orderId, igual que antes
        if (area && "area" in event && event.area !== area) return;
        if (orderId && event.orderId !== Number(orderId)) return;

        controller.enqueue(
          encoder.encode(
            `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`
          )
        );
      };

      // Suscripción a Redis
      const unsubscribe = subscribeToOrderItemsEvents(handler);

      const cleanup = () => {
        clearInterval(keepAlive);
        unsubscribe(); // cierra el suscriptor Redis
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