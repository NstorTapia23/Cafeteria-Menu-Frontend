import { db } from "@/db";
import { createItemSchema } from "@/schemas/ItemsSchemas";
import z from "zod";
import { items, prices } from "@/db/schema";
import { eq, isNull, and } from "drizzle-orm";
import type { UpdateItemType } from "@/schemas/ItemsSchemas";
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
  const result = await db
    .select({
      id: items.id,
      name: items.name,
      description: items.description,
      url: items.imageUrl,
      price: prices.amount,
      elaborationArea: items.elaborationArea
    })
    .from(items)
    .innerJoin(
      prices,
      and(eq(items.id, prices.itemId), isNull(prices.validTo)),
    );
  return result;
}
//actualizar items
export async function updateItem(itemUpdate: UpdateItemType) {
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
        name: itemUpdate.name ?? existingItem.name,
        description:
          itemUpdate.description !== undefined
            ? itemUpdate.description
            : existingItem.description,
        elaborationArea: itemUpdate.elaborationArea ?? existingItem.elaborationArea,
        imageUrl:
          itemUpdate.url !== undefined ? itemUpdate.url : existingItem.imageUrl,
      })
      .where(eq(items.id, itemUpdate.id))
      .returning();

    if (!updatedItem) {
      throw new Error("No se pudo actualizar el ítem");
    }

    let activePrice = await tx.query.prices.findFirst({
      where: and(eq(prices.itemId, itemUpdate.id), isNull(prices.validTo)),
    });

    if (itemUpdate.price !== undefined) {
      await tx
        .update(prices)
        .set({ validTo: new Date() })
        .where(and(eq(prices.itemId, itemUpdate.id), isNull(prices.validTo)));

      const [insertedPrice] = await tx
        .insert(prices)
        .values({
          itemId: itemUpdate.id,
          amount: itemUpdate.price,
          validFrom: new Date(),
          validTo: null,
        })
        .returning();

      activePrice = insertedPrice ?? activePrice;
    }

    if (!activePrice) {
      activePrice = await tx.query.prices.findFirst({
        where: and(eq(prices.itemId, itemUpdate.id), isNull(prices.validTo)),
      });
    }

    return {
      ...updatedItem,
      activePrice,
    };
  });
}

//eliminacion parcial de items
export async function SoftDeleteItem(id: number) {
  await db.transaction(async (tx) => {
    const rows = await tx
      .select()
      .from(items)
      .where(and(eq(items.id, id), eq(items.is_active, true)));

    if (rows.length === 0) {
      throw new Error("No es posible eliminar el elemento ya que este no existe o ya está inactivo");
    }

    await tx
      .update(items)
      .set({ is_active: false })
      .where(eq(items.id, id));

    await tx
      .update(prices)
      .set({ validTo: new Date() })
      .where(eq(prices.itemId, id));
  });
}