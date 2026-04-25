"use server";

import { getOrderItemsByStatus } from "@/repositories/orderItems";
import type { orderItemStatusType } from "@/repositories/orderItems";

export async function getPendsForBar() {
  return await getOrderItemsByStatus("pending" as orderItemStatusType, "bar");
}
