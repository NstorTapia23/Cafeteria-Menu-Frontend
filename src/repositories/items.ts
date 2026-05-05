import { db } from "@/db";
import { createItemSchema, updateItemSchema, type CreateItemInput, type UpdateItemType } from "@/schemas/ItemsSchemas";
import { items, items_categories, prices } from "@/db/schema";
import {  and, eq, isNull } from "drizzle-orm";


export async function createItemMenu(item: CreateItemInput) {
  const validated = createItemSchema.safeParse(item);
  if (!validated.success) {
    throw new Error(validated.error.message);
  }

  const data = validated.data;

  return db.transaction(async (tx) => {
    const category = await tx.query.items_categories.findFirst({
      where: and(
        eq(items_categories.id, data.itemCategory),
        eq(items_categories.isActive, true),
      ),
    });

    if (!category) {
      throw new Error("La categoría seleccionada no existe o está inactiva");
    }

    const newItem = await tx
      .insert(items)
      .values({
        name: data.name,
        elaborationArea: data.elaborationArea,
        categoryId: data.itemCategory,
        description: data.description ?? null,
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
      categoryId: items.categoryId,
      url: items.imageUrl,
      price: prices.amount,
      elaborationArea: items.elaborationArea,
    })
    .from(items)
    .innerJoin(
      prices,
      and(eq(items.id, prices.itemId), isNull(prices.validTo)),
    );

  return result;
}
export async function updateItem(itemUpdate: UpdateItemType) {
  const data = updateItemSchema.parse(itemUpdate);
  const now = new Date();

  return await db.transaction(async (tx) => {
    const [updatedItem] = await tx
      .update(items)
      .set(
        Object.fromEntries(
          Object.entries({
            name: data.name,
            description: data.description,
            categoryId: data.categoryId,
            elaborationArea: data.elaborationArea,
            imageUrl: data.url,
          }).filter(([, v]) => v !== undefined)
        )
      )
      .where(eq(items.id, data.id))
      .returning();

    if (!updatedItem) {
      throw new Error(`El ítem con id ${data.id} no existe`);
    }

    const activePrice = await (async () => {
      if (data.price === undefined) {
        return tx.query.prices.findFirst({
          where: and(eq(prices.itemId, data.id), isNull(prices.validTo)),
        });
      }

      await tx
        .update(prices)
        .set({ validTo: now })
        .where(and(eq(prices.itemId, data.id), isNull(prices.validTo)));

      const [inserted] = await tx
        .insert(prices)
        .values({
          itemId: data.id,
          amount: data.price,
          validFrom: now,
          validTo: null,
        })
        .returning();

      return inserted;
    })();

    return {
      ...updatedItem,
      activePrice,
    };
  });
}

export async function SoftDeleteItem(id: number) {
  await db.transaction(async (tx) => {
    const rows = await tx
      .select()
      .from(items)
      .where(and(eq(items.id, id), eq(items.is_active, true)));

    if (rows.length === 0) {
      throw new Error(
        "No es posible eliminar el elemento ya que este no existe o ya está inactivo",
      );
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