import { eq } from "drizzle-orm";
import { db } from "@/db/index";
import { items, orderItems } from "@/db/schema";

export async function getOrderItemContextById(orderItemId: number) {
  const result = await db
    .select({
      id: orderItems.id,
      orderId: orderItems.orderId,
      itemId: orderItems.itemId,
      area: items.elaborationArea,
    })
    .from(orderItems)
    .innerJoin(items, eq(orderItems.itemId, items.id))
    .where(eq(orderItems.id, orderItemId))
    .limit(1);

  return result[0] ?? null;
}

export async function getOrderItemAreaByItemId(itemId: number) {
  const result = await db
    .select({
      itemId: items.id,
      area: items.elaborationArea,
    })
    .from(items)
    .where(eq(items.id, itemId))
    .limit(1);

  return result[0] ?? null;
}
