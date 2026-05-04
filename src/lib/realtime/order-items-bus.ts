import { supabase } from "@/lib/supabase";
import type { ElaborationArea } from "@/schemas/orderItemsSchemas";
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
