 "use server"
 import { CreateNewOrder } from "@/repositories/orders";
  import { revalidatePath, revalidateTag } from "next/cache";
  import { CreateOrderSchema , CreateOrderInput} from "@/schemas/ordersSchema";
  import { unstable_cache } from "next/cache";
  import { getOpenOrders  } from "@/repositories/orders";

export async function createOrderAction(data: CreateOrderInput) {
  const validated = CreateOrderSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, error: "Datos inválidos" };
  }

  try {
    await CreateNewOrder(validated.data);
    revalidateTag("orders" , "default");
    revalidatePath("/admin/workspace/orders");
    return { success: true };
  } catch (error) {
    console.error("Error al crear orden:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error del servidor",
    };
  }
}


  export const getOpenOrdersActions = unstable_cache(
    async () => {
      const orders = await getOpenOrders()
      return orders;
    },
    ["open-orders"], 
    {
      revalidate: 60, 
      tags: ["orders"],
    }
  );