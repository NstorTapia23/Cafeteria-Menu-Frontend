import z from "zod";
export const filterSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato YYYY-MM-DD"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato YYYY-MM-DD"),
  timezone: z.string().min(1, "Zona horaria requerida"),
  status: z.enum(["open", "closed", "canceled" , "all"]).optional(),
});