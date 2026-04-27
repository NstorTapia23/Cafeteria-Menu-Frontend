import { db } from "@/db";
import { createItemSchema } from "@/schemas/ItemsSchemas";
import z from "zod";
import { items, prices } from "@/db/schema";
import { eq, isNull, and } from "drizzle-orm";
import type { UpdateItemSchema } from "@/schemas/ItemsSchemas";
type ItemType = z.infer<typeof createItemSchema>;

export async function createItemMenu(item: ItemType) {
  const validated = createItemSchema.safeParse(item);
  if (!validated.success) {
    throw new Error(validated.error.message);
  }

  const data = validated.data;

  return db.transaction(async (tx) => {
    const newItem = await tx
      .insert(items)
      .values({
        name: data.name,
        elaborationArea: data.elaborationArea,
        description: data.description,
        imageUrl: data.url ?? null,
        is_active: true,
      })
      .returning();

    if (!newItem[0]) throw new Error("No se pudo crear el item");

    const newPrice = await tx
      .insert(prices)
      .values({
        itemId: newItem[0].id,
        amount: data.price,
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

export async function updateItem(itemUpdate: UpdateItemSchema) {
  return await db.transaction(async (tx) => {
    const existingItem = await tx.query.items.findFirst({
      where: eq(items.id, itemUpdate.id),
    });

    if (!existingItem) {
      throw new Error(`El ítem con id ${itemUpdate.id} no existe`);
    }

    const [updatedItem] = await tx
      .update(items)
      .set({
        name: itemUpdate.name,
        description: itemUpdate.description,
        elaborationArea: itemUpdate.elaborationArea,
      })
      .where(eq(items.id, itemUpdate.id))
      .returning();

    // 3. Manejar precio si se proporcionó
    if (itemUpdate.price !== undefined) {
      // Expirar el precio activo actual
      await tx
        .update(prices)
        .set({ validTo: new Date() })
        .where(and(eq(prices.itemId, itemUpdate.id), isNull(prices.validTo)));

      // Insertar el nuevo precio como activo
      await tx.insert(prices).values({
        itemId: itemUpdate.id,
        amount: itemUpdate.price,
        validFrom: new Date(),
      });
    }

    const activePrice = await tx.query.prices.findFirst({
      where: and(eq(prices.itemId, itemUpdate.id), isNull(prices.validTo)),
    });

    return {
      ...updatedItem,
      activePrice: activePrice,
    };
  });
}
