import z from "zod";
export const CreateOrderSchema = z.object({
  numberTable: z.number().min(1, "Número de mesa requerido"),
  workerId: z.number(),
});
