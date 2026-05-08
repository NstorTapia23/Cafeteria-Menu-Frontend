import { and, eq, inArray, isNull, ne, sql } from "drizzle-orm";
import { db } from "@/db/index"; 
import { orderItems, items, prices, orders } from "@/db/schema";
import z from "zod";
import {
  AddOrderItem,
  AddOrderItemsInput,
  addOrderItemsSchema,
  orderItemStatusSchema,
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
    .innerJoin(prices, eq(orderItems.priceId, prices.id))
    .where(
        eq(orderItems.orderId, orderID),
      );
  return result;
}
type UpdateOrderItemQuantity = z.infer<typeof updateOrderItemQuantitySchema>;
export async function updateOrderItemQuantity({ id, quantity: delta }: UpdateOrderItemQuantity) {
  return await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(orderItems)
      .set({ quantity: sql`${orderItems.quantity} + ${delta}` })
      .where(eq(orderItems.id, id))
      .returning({ id: orderItems.id, quantity: orderItems.quantity });

    if (!updated) throw new Error(`Order item with id ${id} not found`);

    if (updated.quantity <= 0) {
      await tx.delete(orderItems).where(eq(orderItems.id, id));
      return { success: true, deleted: true, id };
    }

    return { success: true, updated: true, id, newQuantity: updated.quantity };
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
        isNull(prices.validTo),
      ),
    );
}

function normalizeOrderItems(itemsInput: AddOrderItemsInput) {
  const map = new Map<number, number>();

  for (const { itemId, quantity } of itemsInput) {
    map.set(itemId, (map.get(itemId) ?? 0) + quantity);
  }

  return Array.from(map, ([itemId, quantity]) => ({
    itemId,
    quantity,
  }));
}

function findMissing(expectedIds: number[], foundIds: number[]) {
  const found = new Set(foundIds);
  return expectedIds.filter((id) => !found.has(id));
}

function findDuplicates(ids: number[]) {
  const count = new Map<number, number>();
  for (const id of ids) {
    count.set(id, (count.get(id) ?? 0) + 1);
  }

  return Array.from(count.entries())
    .filter(([, qty]) => qty > 1)
    .map(([id]) => id);
}

export async function createManyOrderItems(
  orderId: number,
  data: AddOrderItemsInput
): Promise<AddOrderItem[]> {
  const input = addOrderItemsSchema.parse(data);
  const normalized = normalizeOrderItems(input);
  const itemIds = normalized.map((item) => item.itemId);

  return db.transaction(async (tx) => {
    const [itemRecords, priceRecords] = await Promise.all([
      tx
        .select({
          id: items.id,
          name: items.name,
          categoryId: items.categoryId,
          elaborationArea: items.elaborationArea,
        })
        .from(items)
        .where(inArray(items.id, itemIds)),

      tx
        .select({
          id: prices.id,
          itemId: prices.itemId,
          amount: prices.amount,
        })
        .from(prices)
        .where(and(inArray(prices.itemId, itemIds), isNull(prices.validTo))),
    ]);

    const missingItems = findMissing(
      itemIds,
      itemRecords.map((item) => item.id)
    );
    if (missingItems.length > 0) {
      throw new Error(`Items no encontrados: ${missingItems.join(", ")}`);
    }

    const missingPrices = findMissing(
      itemIds,
      priceRecords.map((price) => price.itemId)
    );
    if (missingPrices.length > 0) {
      throw new Error(
        `No hay precio activo para: ${missingPrices.join(", ")}`
      );
    }

    const duplicatedActivePrices = findDuplicates(
      priceRecords.map((price) => price.itemId)
    );
    if (duplicatedActivePrices.length > 0) {
      throw new Error(
        `Hay más de un precio activo para: ${duplicatedActivePrices.join(", ")}`
      );
    }

    const itemMap = new Map(itemRecords.map((item) => [item.id, item]));
    const priceMap = new Map(priceRecords.map((price) => [price.itemId, price]));

    const insertValues = normalized.map(({ itemId, quantity }) => {
      const price = priceMap.get(itemId);
      if (!price) {
        throw new Error(`El elemento ${itemId} no tiene precio activo`);
      }

      return {
        orderId,
        itemId,
        quantity,
        status: "pending" as const,
        priceId: price.id,
      };
    });

    const createdRows = await tx
      .insert(orderItems)
      .values(insertValues)
      .returning({
        id: orderItems.id,
        orderId: orderItems.orderId,
        itemId: orderItems.itemId,
        quantity: orderItems.quantity,
        status: orderItems.status,
      });

    return createdRows.map((row) => {
      const item = itemMap.get(row.itemId);
      const price = priceMap.get(row.itemId);

      if (!item || !price) {
        throw new Error(`Error en los precios del elemento ${row.itemId}`);
      }

      return {
        id: row.id,
        orderId: row.orderId,
        itemId: row.itemId,
        name: item.name,
        quantity: row.quantity,
        status: row.status,
        totalAmount: Number(price.amount) * row.quantity,
        categoryId: item.categoryId,
        elaborationArea: item.elaborationArea,
      };
    });
  });
}


export async function closeOrder(orderId: number) {
  return await db.transaction(async (tx) => {
    const order = await tx.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });

    if (!order) {
      throw new Error("La orden no existe.");
    }

    if (order.status !== "open") {
      throw new Error("La orden no está en estado open.");
    }

    const pendingItems = await tx
      .select({
        count: sql<number>`count(*)`,
      })
      .from(orderItems)
      .where(
        and(
          eq(orderItems.orderId, orderId),
          ne(orderItems.status, "delivered"),
        ),
      );

    const pendingCount = Number(pendingItems[0]?.count ?? 0);

    if (pendingCount > 0) {
      throw new Error(
        "No se puede cerrar la orden porque existen items no entregados.",
      );
    }

    const result = await tx
      .update(orders)
      .set({
        status: "closed",
        closedAt: new Date(),
      })
      .where(eq(orders.id, orderId))
      .returning();

    return result[0];
  });
}

export type orderItemStatusType = z.infer<typeof orderItemStatusSchema>;
type elaborationAreaType = "cocina" | "bar" | "lunch";

export async function getOrderItemsByStatus(
  status: orderItemStatusType,
  EASection: elaborationAreaType,
) {
  return await db
    .select({
      id: orderItems.id,
      orderId: orders.id,
      itemId: items.id,
      itemName: items.name,
      quantity: orderItems.quantity,
      numberTable: orders.numberTable,
      status: orderItems.status,
      elaborationArea: items.elaborationArea,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .innerJoin(items, eq(items.id, orderItems.itemId))
    .where(
      and(
        eq(orderItems.status, status),
        eq(orders.status, "open"),
        eq(items.elaborationArea, EASection),
      ),
    );
}

export async function getCookedElementsCard(status: orderItemStatusType) {
  return await db
    .select({
      id: orderItems.id,
      orderId: orders.id,
      itemId: items.id,
      itemName: items.name,
      quantity: orderItems.quantity,
      numberTable: orders.numberTable,
      status: orderItems.status,
      elaborationArea: items.elaborationArea,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .innerJoin(items, eq(items.id, orderItems.itemId))
    .where(and(eq(orderItems.status, status), eq(orders.status, "open")));
}
