  import { CreateNewOrder } from "@/repositories/orders";
  import { revalidatePath, revalidateTag } from "next/cache";
  import { CreateOrderSchema } from "@/schemas/ordersSchema";
  import { unstable_cache } from "next/cache";
  import { getOpenOrders } from "@/repositories/orders";

  export async function createOrder(formData: FormData) {
    const numberTable = parseInt(formData.get("numberTable") as string);
    const workerId = parseInt(formData.get("workerId") as string);

    const validated = CreateOrderSchema.safeParse({ numberTable, workerId });
    if (!validated.success) {
      return { success: false, error: "Datos inválidos" };
    }

    try {
      await CreateNewOrder(validated.data.workerId, validated.data.numberTable);
      revalidateTag("orders" , "default")
      revalidatePath("/admin/workspace/orders");
      return { success: true };
    } catch (error) {
      console.error("Error al crear orden:", error);
      return { success: false, error: "Error del servidor" };
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