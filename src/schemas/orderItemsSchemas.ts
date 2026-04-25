import { orderItemStatus, elaborationAreas } from "@/db/schema";
import { z } from "zod";

export const orderItemStatusSchema = z.enum(orderItemStatus.enumValues);
export const elaborationAreaSchema = z.enum(elaborationAreas.enumValues);

export const orderItemsInfo = z.object({
  id: z.number().int().positive(),
  orderId: z.number().int().positive(),
  itemId: z.number().int().positive(),
  name: z.string(),
  cantidad: z.number().int().positive(),
  status: orderItemStatusSchema,
  totalAmount: z.coerce.number(),
});

export const OrderItemsSchema = z.array(orderItemsInfo);
export type OrderItem = z.infer<typeof orderItemsInfo>;

export const PendsForCook = z.object({
  id: z.number().int().positive(),
  orderId: z.number().int().positive(),
  itemId: z.number().int().positive(),
  itemName: z.string(),
  numberTable: z.number().positive().int(),
  quantity: z.number().int().positive(),
  status: orderItemStatusSchema,
  elaborationArea: elaborationAreaSchema,
});

export const PendsForCookArray = z.array(PendsForCook);
export type PendsForCookType = z.infer<typeof PendsForCookArray>;

export const updateOrderItemQuantitySchema = z.object({
  id: z.number().int().positive(),
  quantity: z.number(),
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
