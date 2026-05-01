"use server";
import { CreateNewOrder } from "@/repositories/orders";
import { revalidatePath } from "next/cache";
import { CreateOrderSchema } from "@/schemas/ordersSchema";


export async function createOrder(formData: FormData) {
  const numberTable = parseInt(formData.get("numberTable") as string);
  const workerId = parseInt(formData.get("workerId") as string);

  const validated = CreateOrderSchema.safeParse({ numberTable, workerId });
  if (!validated.success) {
    return { success: false, error: "Datos inválidos" };
  }

  try {
    await CreateNewOrder(validated.data.workerId, validated.data.numberTable);

    revalidatePath("/admin/workspace/orders");
    return { success: true };
  } catch (error) {
    console.error("Error al crear orden:", error);
    return { success: false, error: "Error del servidor" };
  }
}