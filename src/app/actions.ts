"use server";

import { revalidatePath } from "next/cache";
import { createItemSchema } from "@/schemas/ItemsSchemas";
import { createItemMenu } from "@/repositories/items";
import { getAllItems } from "@/repositories/items";

export async function createItem(values: typeof createItemSchema) {
  const parsed = createItemSchema.parse(values);
  const result = await createItemMenu(parsed);

  revalidatePath("/");
  return result;
}

export async function getItemsForMenu() {
  const result = await getAllItems();
  return result;
}
