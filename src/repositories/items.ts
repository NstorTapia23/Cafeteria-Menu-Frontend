import { db } from "@/db";
import { createItemSchema } from "@/schemas/createItemSchema";
import z from "zod";
import { items, prices } from "@/db/schema";
import { eq, isNull, and } from "drizzle-orm";

type ItemType = z.infer<typeof createItemSchema>;

export async function createItemMenu(item: ItemType) {
  return db.transaction(async (tx) => {
    const newItem = await tx
      .insert(items)
      .values({
        name: item.name,
        elaborationArea: item.elaborationArea,
        description: item.description,
        is_active: true,
      })
      .returning();

    if (!newItem[0]) throw new Error("No se pudo crear el item");

    const newPrice = await tx
      .insert(prices)
      .values({
        itemId: newItem[0].id,
        amount: item.price,
      })
      .returning();

    if (!newPrice[0]) throw new Error("No se pudo crear el precio");

    return {
      item: newItem[0],
      price: newPrice[0],
    };
  });
}

export async function getAllItems() {
  return db
    .select({
      id: items.id,
      name: items.name,
      description: items.description,
      url: items.imageUrl,
      price: prices.amount,
    })
    .from(items)
    .innerJoin(
      prices,
      and(eq(items.id, prices.itemId), isNull(prices.validTo)),
    );
}
