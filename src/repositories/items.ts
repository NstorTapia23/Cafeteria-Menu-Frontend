import { db } from "@/db";
import { createItemSchema, type CreateItemInput, type UpdateItemType } from "@/schemas/ItemsSchemas";
import { items, items_categories, prices } from "@/db/schema";
import { asc, and, eq, isNull } from "drizzle-orm";

export async function getActiveItemCategories() {
  return await db
    .select({
      id: items_categories.id,
      name: items_categories.name,
    })
    .from(items_categories)
    .where(eq(items_categories.isActive, true))
    .orderBy(asc(items_categories.name));
}

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
        categoryId:
          itemUpdate.itemCategory !== undefined
            ? itemUpdate.itemCategory
            : existingItem.categoryId,
        elaborationArea:
          itemUpdate.elaborationArea ?? existingItem.elaborationArea,
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