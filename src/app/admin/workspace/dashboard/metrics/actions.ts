// app/actions/orders.ts
"use server";

import { z } from "zod";
import { and, gte, lt, eq } from "drizzle-orm";
import { db } from "@/db/index";
import { orders, workers } from "@/db/schema";
import { getDateRangeUTC, toLocalDateString } from "@/helpers/RestructuredTimes"
import { filterSchema } from "@/schemas/datesSchemas";

export type OrdersFilterInput = z.infer<typeof filterSchema>;

export async function getOrdersByDateRange(input: OrdersFilterInput) {
  const { startDate, endDate, timezone, status } = filterSchema.parse(input);

  const { startUTC, endExclusiveUTC } = getDateRangeUTC(startDate, endDate, timezone);
const conditions = [
  gte(orders.createdAt, startUTC),
  lt(orders.createdAt, endExclusiveUTC),
];
if (status && status !== "all") {
  conditions.push(eq(orders.status, status));
}

  const results = await db
    .select({
      id: orders.id,
      numberTable: orders.numberTable,
      status: orders.status,
      createdAt: orders.createdAt,
      closedAt: orders.closedAt,
      workerName: workers.name,
    })
    .from(orders)
    .leftJoin(workers, eq(orders.workerId, workers.id))
    .where(and(...conditions))
    .orderBy(orders.createdAt);

  return results.map((row) => ({
    ...row,
    createdAt: toLocalDateString(row.createdAt, timezone),
    closedAt: row.closedAt ? toLocalDateString(row.closedAt, timezone) : null,
  }));
}