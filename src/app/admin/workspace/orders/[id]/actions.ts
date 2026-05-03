"use server";

import { getOrderItemContextById } from "@/repositories/orderItems.realtime";
import {
  closeOrder,
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
import { publishOrderItemsEvent } from "@/lib/realtime/order-items-bus";
import { revalidatePath } from "next/cache";


export async function updateQuantity(formData: FormData) {
  const id = Number(formData.get("id"));
  const delta = Number(formData.get("delta"));
  const orderId = Number(formData.get("orderId"));

  const context = await getOrderItemContextById(id);
  if (!context) {
    throw new Error(`Order item with id ${id} not found`);
  }

  const validated = updateOrderItemQuantitySchema.parse({
    id,
    quantity: delta,
  });

  const result = await updateOrderItemQuantity(validated);

  await publishOrderItemsEvent({
    type: result.deleted ? "item-deleted" : "item-updated",
    orderId: context.orderId,
    itemId: context.itemId,
    area: context.area,
  });

  revalidatePath(`/admin/workspace/orders/${orderId}`);
  return await getOrderItemsByOrderId(orderId);
}

async function updateStatusInternal(
  id: number,
  status: "pending" | "cooked" | "delivered",
  orderId: number,
) {
  const context = await getOrderItemContextById(id);
  if (!context) {
    throw new Error(`Order item with id ${id} not found`);
  }

  const validated = updateOrderItemStatusSchema.parse({ id, status });
  await updateOrderItemStatus(validated);

  await publishOrderItemsEvent({
    type: "item-updated",
    orderId: context.orderId,
    itemId: context.itemId,
    area: context.area,
  });

  revalidatePath(`/admin/workspace/orders/${orderId}`);
  return await getOrderItemsByOrderId(orderId);
}

export async function updateStatus(formData: FormData): Promise<OrderItem[]> {
  const id = Number(formData.get("id"));
  const status = formData.get("status") as "pending" | "cooked" | "delivered";
  const orderId = Number(formData.get("orderId"));

  return await updateStatusInternal(id, status, orderId);
}

export async function markItemCooked(formData: FormData): Promise<OrderItem[]> {
  const id = Number(formData.get("id"));
  const orderId = Number(formData.get("orderId"));

  return await updateStatusInternal(id, "cooked", orderId);
}

export async function addItem(formData: FormData): Promise<OrderItem[]> {
  const orderId = Number(formData.get("orderId"));
  const itemId = Number(formData.get("itemId"));

  const validated = createOrderItemSchema.parse({
    orderId,
    itemId,
    quantity: 1,
  });

  const created = await createOrderItem(validated);

  await publishOrderItemsEvent({
    type: "item-created",
    orderId: created.orderId,
    itemId: created.itemId,
    area: created.elaborationArea,
  });

  revalidatePath(`/admin/workspace/orders/${orderId}`);
  return await getOrderItemsByOrderId(orderId);
}

export async function CloseOrderById(orderId: number) {
  try {
    await closeOrder(orderId);

    await publishOrderItemsEvent({
      type: "order-closed",
      orderId,
    });

    revalidatePath("/admin/workspace/orders");
    revalidatePath(`/admin/workspace/orders/${orderId}`);

    return { ok: true as const };
  } catch (err) {
    console.error(err);
    return {
      ok: false as const,
      message: err instanceof Error ? err.message : "Error inesperado",
    };
  }
}