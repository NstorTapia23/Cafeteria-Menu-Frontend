import z, { number } from "zod";
export const createItemSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional().nullable(),
  itemCategory: z.number().int().positive(),
  url: z.string().url().optional().nullable(),
  price: z.number().min(0, "El precio debe ser mayor o igual a 0"),
  elaborationArea: z.enum(["cocina", "bar", "lunch"]),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
export const updateItemSchema = z.object({
  id: number().int().positive(),
  name: z.string().min(1).optional(),
  itemCategory: z.coerce.number().int().positive().optional(),
  description: z.string().min(1).optional().nullable(),
  url: z.string().url().optional().nullable(),
  price: z.number().min(0).optional(),
  elaborationArea: z.enum(["cocina", "bar", "lunch"]).optional(),
});

export type UpdateItemType = z.infer<typeof updateItemSchema>;

export const getItemsForOrderItems = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  price: z.coerce.number(),
});
