// schemas/orderItemsSchemas.ts
import { orderItemStatus } from "@/db/schema";
import { z } from "zod";

export const orderItemStatusSchema = z.enum(orderItemStatus.enumValues);

export const orderItemsInfo = z.object({
  id: z.number().int().positive(),
  orderId: z.number().int().positive(),
  itemId: z.number().int().positive(), // ← nuevo campo
  name: z.string(),
  cantidad: z.number().int().positive(),
  status: orderItemStatusSchema,
  totalAmount: z.coerce.number().positive(),
});

export const OrderItemsSchema = z.array(orderItemsInfo);
export type OrderItem = z.infer<typeof orderItemsInfo>;

export const updateOrderItemQuantitySchema = z.object({
  id: z.number().int().positive(),
  quantity: z.number(), // delta
});

export const updateOrderItemStatusSchema = z.object({
  id: z.number().positive().int(),
  status: orderItemStatusSchema,
});

export const createOrderItemSchema = z.object({
  orderId: z.number().int().positive(),
  itemId: z.number().int().positive(),
  quantity: z.number().int().positive().default(1),
});
