import z from "zod";

export const createItemSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().min(1).optional(),
  price: z.number().min(0, "El precio debe ser mayor o igual a 0"),
  elaborationArea: z.enum(["cocina", "bar", "lunch"]),
});

export type CreateItemSchema = z.infer<typeof createItemSchema>;
