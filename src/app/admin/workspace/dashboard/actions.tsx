// lib/actions/items.ts
"use server";

import { db } from "@/db";
import { items, prices } from "@/db/schema";
import { createItemSchema } from "@/schemas/ItemsSchemas";
import { revalidatePath } from "next/cache";

export type ItemType = {
  name: string;
  description?: string | null;
  price: number;
  elaborationArea: "cocina" | "bar" | "lunch";
};

export async function createItemMenu(item: ItemType) {
  // Validación del lado del servidor (recomendada)
  const validated = createItemSchema.safeParse(item);
  if (!validated.success) {
    throw new Error(validated.error.message);
  }

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
        validFrom: new Date(),
        validTo: null,
      })
      .returning();

    if (!newPrice[0]) throw new Error("No se pudo crear el precio");

    return {
      item: newItem[0],
      price: newPrice[0],
    };
  });
}
