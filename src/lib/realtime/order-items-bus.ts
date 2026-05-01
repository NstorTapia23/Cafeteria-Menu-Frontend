// lib/realtime/order-items-bus.ts
import { supabase } from "@/lib/supabase";

export type ElaborationArea = "bar" | "cocina" | "lunch";

export type OrderItemsRealtimeEvent =
  | { type: "item-created"; orderId: number; itemId: number; area: ElaborationArea }
  | { type: "item-updated"; orderId: number; itemId: number; area: ElaborationArea }
  | { type: "item-deleted"; orderId: number; itemId: number; area: ElaborationArea }
  | { type: "order-closed"; orderId: number };

// Publicador: envía un broadcast por el canal "order-items"
export async function publishOrderItemsEvent(event: OrderItemsRealtimeEvent) {
  await supabase.channel("order-items").send({
    type: "broadcast",
    event: "order-event",
    payload: event,
  });
}