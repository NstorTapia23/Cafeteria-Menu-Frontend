import { db } from "@/db";
import { items_categories } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { revalidateTag, unstable_cache } from "next/cache";

const ITEM_CATEGORIES_TAG = "item-categories";

async function getActiveItemCategoriesQuery() {
  return await db
    .select({
      id: items_categories.id,
      name: items_categories.name,
    })
    .from(items_categories)
    .where(eq(items_categories.isActive, true))
    .orderBy(asc(items_categories.name));
}

export const getActiveItemCategories = unstable_cache(
  async () => {
    console.log("Hola desde la cache")
    return await getActiveItemCategoriesQuery();
  },
  ["active-item-categories"],
  {
    tags: [ITEM_CATEGORIES_TAG],
    revalidate: 3600, 
  },
);

export async function createItemCategory(categoryName: string) {
  const name = categoryName.trim();

  if (!name) {
    throw new Error("El nombre de la categoría es requerido");
  }

  const existing = await db
    .select({ id: items_categories.id })
    .from(items_categories)
    .where(eq(items_categories.name, name));

  if (existing.length > 0) {
    throw new Error("La categoría ya existe");
  }

  const result = await db
    .insert(items_categories)
    .values({
      name,
      isActive: true,
    })
    .returning();

  revalidateTag(ITEM_CATEGORIES_TAG , "default");

  return result;
}

export async function softDeleteItemCategory(id: number) {
  const itemCategory = await db
    .select({
      id: items_categories.id,
      isActive: items_categories.isActive,
    })
    .from(items_categories)
    .where(eq(items_categories.id, id));

  if (itemCategory.length === 0) {
    throw new Error("Categoría no encontrada");
  }

  if (!itemCategory[0].isActive) {
    throw new Error("La categoría ya está inactiva");
  }

  const result = await db
    .update(items_categories)
    .set({ isActive: false })
    .where(eq(items_categories.id, id))
    .returning();

  revalidateTag(ITEM_CATEGORIES_TAG , "default");

  return result;
}