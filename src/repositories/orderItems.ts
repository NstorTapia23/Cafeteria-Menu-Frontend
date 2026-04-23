import { and, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db/index"; // tu conexión a la BD
import { orderItems, items, prices } from "@/db/schema"; // tus definiciones de tablas
import z from "zod";
import {
  createOrderItemSchema,
  updateOrderItemQuantitySchema,
  updateOrderItemStatusSchema,
} from "@/schemas/orderItemsSchemas";
export async function getOrderItemsByOrderId(orderID: number) {
  const result = await db
    .select({
      id: orderItems.id,
      orderId: orderItems.orderId,
      itemId: orderItems.itemId,
      name: items.name,
      cantidad: orderItems.quantity,
      status: orderItems.status,
      totalAmount: sql<number>`CAST(${prices.amount} * ${orderItems.quantity} AS FLOAT)`,
    })
    .from(orderItems)
    .innerJoin(items, eq(orderItems.itemId, items.id))
    .innerJoin(prices, eq(orderItems.itemId, prices.itemId))
    .where(
      and(
        eq(orderItems.orderId, orderID),
        isNull(prices.validTo), // Solo el precio actual activo
      ),
    );
  return result;
}
type UpdateOrderItemQuantity = z.infer<typeof updateOrderItemQuantitySchema>;

export async function updateOrderItemQuantity(
  orderItemInfo: UpdateOrderItemQuantity,
) {
  const { id, quantity: delta } = orderItemInfo;

  // Transacción para leer y luego modificar/eliminar de forma atómica
  return await db.transaction(async (tx) => {
    // 1. Obtener el ítem actual
    const currentItem = await tx.query.orderItems.findFirst({
      where: eq(orderItems.id, id),
    });

    if (!currentItem) {
      throw new Error(`Order item with id ${id} not found`);
    }

    const newQuantity = currentItem.quantity + delta;

    // 2. Si la nueva cantidad es <= 0, eliminar el registro
    if (newQuantity <= 0) {
      await tx.delete(orderItems).where(eq(orderItems.id, id));
      return { success: true, deleted: true, id };
    }

    // 3. De lo contrario, actualizar la cantidad
    await tx
      .update(orderItems)
      .set({ quantity: newQuantity })
      .where(eq(orderItems.id, id));

    return {
      success: true,
      updated: true,
      id,
      newQuantity,
    };
  });
}
type UpdateOrderItemStatusInput = z.infer<typeof updateOrderItemStatusSchema>;

export async function updateOrderItemStatus(data: UpdateOrderItemStatusInput) {
  const validated = updateOrderItemStatusSchema.parse(data);
  const current = await db.query.orderItems.findFirst({
    where: eq(orderItems.id, validated.id),
  });

  if (
    current &&
    current.status === "pending" &&
    validated.status === "delivered"
  ) {
    throw new Error(
      "No se puede entregar un item antes de registrarlo en la zona de elaboración",
    );
  }
  const [updatedItem] = await db
    .update(orderItems)
    .set({ status: validated.status })
    .where(eq(orderItems.id, validated.id))
    .returning();

  if (!updatedItem) {
    throw new Error(`Order item with id ${validated.id} not found`);
  }

  return updatedItem;
}

export async function getActiveItemsWithPrice() {
  return await db
    .select({
      id: items.id,
      name: items.name,
      price: prices.amount,
    })
    .from(items)
    .innerJoin(prices, eq(items.id, prices.itemId))
    .where(
      and(
        eq(items.is_active, true),
        isNull(prices.validTo), // solo precio actual
      ),
    );
}

// Crear un nuevo orderItem
export async function createOrderItem(
  data: z.infer<typeof createOrderItemSchema>,
) {
  const { orderId, itemId, quantity } = createOrderItemSchema.parse(data);

  // Obtener el precio unitario vigente
  const priceRecord = await db.query.prices.findFirst({
    where: and(eq(prices.itemId, itemId), isNull(prices.validTo)),
  });

  if (!priceRecord) {
    throw new Error(`No active price found for item ${itemId}`);
  }

  const unitPrice = priceRecord.amount;
  const totalAmount = unitPrice * quantity;

  const [newOrderItem] = await db
    .insert(orderItems)
    .values({
      orderId,
      itemId,
      quantity,
      status: "pending",
    })
    .returning();

  return {
    ...newOrderItem,
    name: (await db.query.items.findFirst({ where: eq(items.id, itemId) }))!
      .name,
    totalAmount,
  };
}
