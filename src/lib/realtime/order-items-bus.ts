import { EventEmitter } from "node:events";

export type ElaborationArea = "bar" | "cocina" | "lunch";

export type OrderItemsRealtimeEvent =
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
  | {
      type: "order-closed";
      orderId: number;
    };

declare global {
  var __orderItemsBus: EventEmitter | undefined;
}

const g = globalThis as typeof globalThis & {
  __orderItemsBus?: EventEmitter;
};

export const orderItemsBus = g.__orderItemsBus ?? new EventEmitter();

if (!g.__orderItemsBus) {
  g.__orderItemsBus = orderItemsBus;
}

export function publishOrderItemsEvent(event: OrderItemsRealtimeEvent) {
  orderItemsBus.emit("order-items", event);
}
