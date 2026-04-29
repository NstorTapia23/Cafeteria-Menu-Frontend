"use server";
import { CreateNewOrder, getOpenOrders } from "@/repositories/orders";
import { revalidatePath } from "next/cache";
import { CreateOrderSchema } from "@/schemas/ordersSchema";
import { getCookedElementsCard } from "@/repositories/orderItems";
export async function OrdersAction() {
  const allOpenOrders = await getOpenOrders();
  return allOpenOrders;
}
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

export async function getOrderItemsCooked() {
  const orderItemsCooked = await getCookedElementsCard("cooked");
  return orderItemsCooked;
}
