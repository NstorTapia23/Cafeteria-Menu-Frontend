"use server";

import {
  createOrderItem,
  getOrderItemsByOrderId,
  updateOrderItemQuantity,
  updateOrderItemStatus,
} from "@/repositories/orderItems";
import {
  createOrderItemSchema,
  updateOrderItemQuantitySchema,
  updateOrderItemStatusSchema,
  type OrderItem,
} from "@/schemas/orderItemsSchemas";
import { revalidatePath } from "next/cache";

// Obtener items (para uso interno o en servidor)
export async function getItems(orderId: number): Promise<OrderItem[]> {
  const retorno = await getOrderItemsByOrderId(orderId);
  console.log(retorno);
  return retorno;
}
export async function updateQuantity(formData: FormData) {
  const id = Number(formData.get("id"));
  const delta = Number(formData.get("delta"));
  const orderId = Number(formData.get("orderId"));
  const validated = updateOrderItemQuantitySchema.parse({
    id,
    quantity: delta,
  });
  await updateOrderItemQuantity(validated);
  revalidatePath(`/admin/workspace/orders/${orderId}`);
  return await getOrderItemsByOrderId(orderId);
}
export async function updateStatus(formData: FormData): Promise<OrderItem[]> {
  const id = Number(formData.get("id"));
  const status = formData.get("status") as string;
  const orderId = Number(formData.get("orderId"));

  const validated = updateOrderItemStatusSchema.parse({ id, status });
  await updateOrderItemStatus(validated);

  revalidatePath(`/admin/workspace/orders/${orderId}`);
  return await getOrderItemsByOrderId(orderId);
}

export async function addItem(formData: FormData): Promise<OrderItem[]> {
  const orderId = Number(formData.get("orderId"));
  const itemId = Number(formData.get("itemId"));

  const validated = createOrderItemSchema.parse({
    orderId,
    itemId,
    quantity: 1,
  });
  await createOrderItem(validated);
  console.log(validated);
  revalidatePath(`/admin/workspace/orders/${orderId}`);
  return await getOrderItemsByOrderId(orderId);
}
