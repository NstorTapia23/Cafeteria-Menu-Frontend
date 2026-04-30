// lib/realtime/order-items-bus.ts
import { redis } from "@/lib/redis";
import Redis from "ioredis";

export type ElaborationArea = "bar" | "cocina" | "lunch";

export type OrderItemsRealtimeEvent =
  | { type: "item-created"; orderId: number; itemId: number; area: ElaborationArea }
  | { type: "item-updated"; orderId: number; itemId: number; area: ElaborationArea }
  | { type: "item-deleted"; orderId: number; itemId: number; area: ElaborationArea }
  | { type: "order-closed"; orderId: number };

const CHANNEL = "order-items";

// Publicador: ahora asíncrono, envía el evento al canal Redis
export async function publishOrderItemsEvent(event: OrderItemsRealtimeEvent) {
  await redis.publish(CHANNEL, JSON.stringify(event));
}

// Suscriptor: útil para el stream SSE.
// Devuelve una función de limpieza (cleanup)
export function subscribeToOrderItemsEvents(
  handler: (event: OrderItemsRealtimeEvent) => void
): () => void {
  // Cada stream necesita su propio cliente Redis.
  const subscriber = new Redis(process.env.REDIS_URL!);

  subscriber.on("message", (channel, message) => {
    try {
      const event = JSON.parse(message) as OrderItemsRealtimeEvent;
      handler(event);
    } catch (err) {
      console.error("Error al parsear el mensaje Redis:", err);
    }
  });

  subscriber.subscribe(CHANNEL);

  // La función que libera la suscripción y desconecta al cliente
  return () => {
    subscriber.unsubscribe(CHANNEL);
    subscriber.disconnect();
  };
}