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
} from "@/schemas/orderItemsSchemas";
import { revalidatePath } from "next/cache";
export async function OrdersItemsPage(orderID: number) {
  const getOrderItemsByID = await getOrderItemsByOrderId(orderID);
  return getOrderItemsByID;
}

export async function updateQuantity(formData: FormData) {
  const id = Number(formData.get("id"));
  const delta = Number(formData.get("delta"));
  const validated = updateOrderItemQuantitySchema.parse({
    id,
    quantity: delta,
  });
  await updateOrderItemQuantity(validated);
  revalidatePath(`/admin/workspace/orders/${validated.id}`);
}

export async function updateStatus(formData: FormData) {
  const id = Number(formData.get("id"));
  const status = formData.get("status") as string;
  const validated = updateOrderItemStatusSchema.parse({ id, status });
  await updateOrderItemStatus(validated);
  revalidatePath(`/admin/workspace/orders/${validated.id}`);
}

export async function addItem(formData: FormData) {
  const orderId = Number(formData.get("orderId"));
  const itemId = Number(formData.get("itemId"));
  const validated = createOrderItemSchema.parse({
    orderId,
    itemId,
    quantity: 1,
  });
  await createOrderItem(validated);
  revalidatePath(`/admin/workspace/orders/${orderId}`);
}
