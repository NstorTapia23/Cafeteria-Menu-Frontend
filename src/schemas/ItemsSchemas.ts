import z, { number } from "zod";

export const createItemSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  url: z.string().url().optional().nullable(),
  price: z.number().min(0, "El precio debe ser mayor o igual a 0"),
  elaborationArea: z.enum(["cocina", "bar", "lunch"]),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;

export const updateItemSchema = z.object({
  id: number().int().positive(),
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional().nullable(),
  url: z.string().optional().nullable(),
  price: z.number().min(0).optional(),
  elaborationArea: z.enum(["cocina", "bar", "lunch"]).optional(),
});

export type UpdateItemSchema = z.infer<typeof updateItemSchema>;

export const getItemsForOrderItems = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  price: z.coerce.number(),
});
