"use server";

import { db } from "@/db";
import { items, prices } from "@/db/schema";
import { publishOrderItemsEvent } from "@/lib/realtime/order-items-bus";
import { createManyOrderItems } from "@/repositories/orderItems";
import type { AddOrderItem, AddOrderItemsInput } from "@/schemas/orderItemsSchemas";
import { revalidatePath, unstable_cache } from "next/cache";
import { isNull, eq, asc } from "drizzle-orm";

export async function addItemsBatch(
  orderId: number,
  itemsInput: AddOrderItemsInput
): Promise<AddOrderItem[]> {
  const createdItems = await createManyOrderItems(orderId, itemsInput);

  await publishOrderItemsEvent({
  type: "items-batch-created",
  orderId,
  items: createdItems.map((item) => ({
    itemId: item.itemId,
    area: item.elaborationArea,
  })),
});

  revalidatePath(`/admin/workspace/orders/${orderId}`);

  return createdItems;
}

export const getMenuItems = unstable_cache(
  async () => {
    const result = await db
      .select({
        id: items.id,
        name: items.name,
        categoryId: items.categoryId,
        price: prices.amount,
      })
      .from(items)
      .innerJoin(prices, eq(prices.itemId, items.id))
      .where(isNull(prices.validTo))
      .orderBy(asc(items.name));

    return result.map((item) => ({
      ...item,
      price: Number(item.price ?? 0),
    }));
  },
  ["menu-items"],
  { revalidate: 3600, tags: ["menu-items"] }
);