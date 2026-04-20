import z from "zod";

export const loginSchema = z.object({
  name: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(255, "El nombre no puede exceder 255 caracteres"),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(255, "La contraseña no puede exceder 255 caracteres"),
});
