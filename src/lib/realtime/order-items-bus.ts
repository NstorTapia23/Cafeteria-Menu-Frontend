import type { ElaborationArea } from "@/schemas/orderItemsSchemas";
import { supabase } from "../supabase";

export type OrderItemsRealtimeEvent =
  | {
      type: "items-batch-created";
      orderId: number;
      items: {
        itemId: number;
        area: ElaborationArea;
      }[];
    }
  | {
      type: "item-created";
      orderId: number;
      itemId: number;
      area: ElaborationArea;
    }
  | {
      type: "item-updated";
      orderId: number;
      itemId: number;
      area: ElaborationArea;
    }
  | {
      type: "item-deleted";
      orderId: number;
      itemId: number;
      area: ElaborationArea;
    }
  | { type: "order-closed"; orderId: number };

// Esta función se puede eliminar o conservar para usarla desde el cliente
export async function publishOrderItemsEvent(event: OrderItemsRealtimeEvent) {
  try {
    await supabase.channel("order-items").send({
      type: "broadcast",
      event: "order-event",
      payload: event,
    });
  } catch (err) {
    console.error("Realtime broadcast failed:", err);
  }
}