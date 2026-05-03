import OrdersAndPendsClient from "@/components/OrdersAndPendsClient";
import { getCookedElementsCard } from "@/repositories/orderItems";
import { getOpenOrders } from "@/repositories/orders";

import { CreateNewOrder } from "@/repositories/orders";
import { revalidatePath } from "next/cache";
import { CreateOrderSchema } from "@/schemas/ordersSchema";


export default async function OrdersPage() {
  const ordenesAbiertas = await getOpenOrders();
  const orderItemsCooked = await getCookedElementsCard("cooked");
  return (
    <OrdersAndPendsClient
      ordenesIniciales={ordenesAbiertas}
      pendientesIniciales={orderItemsCooked}
    />
  );
}


async function createOrder(formData: FormData) {
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