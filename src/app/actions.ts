"use server";

import { revalidatePath } from "next/cache";
import {
  createItemSchema,
  type CreateItemSchema,
} from "@/schemas/ItemsSchemas";
import { createItemMenu } from "@/repositories/items";

export async function createItem(values: CreateItemSchema) {
  const parsed = createItemSchema.parse(values);
  const result = await createItemMenu(parsed);

  revalidatePath("/");
  return result;
}
