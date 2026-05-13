import { db } from "@/db";
import { orders, workers } from "@/db/schema";
import { and, eq, isNotNull } from "drizzle-orm";
import { getWorkerById } from "./workers";
import z from "zod"
import { CreateOrderSchema } from "@/schemas/ordersSchema";

export async function getOpenOrders() {
  const openOrders = await db
    .select({
      id: orders.id,
      numberTable: orders.numberTable,
      status: orders.status,
      workerName: workers.name,
    })
    .from(orders)
    .innerJoin(workers, eq(orders.workerId, workers.id))
    .where(eq(orders.status, "open"));

  return openOrders;
}

export async function CreateNewOrder({workerId , numberTable} : z.infer<typeof CreateOrderSchema>)
 {
  const worker = await getWorkerById(workerId);
  if (!worker) {
    throw new Error("Trabajador no encontrado");
  }

  try {
    return await db
      .insert(orders)
      .values({ workerId: workerId, numberTable: numberTable })
      .returning();
   } catch (error) {
    throw new Error(`Error al crear la orden: ${error}`, { cause: error });
  }
}
 
export async function getClosedOrders() {
  return await db
    .select({
      id: orders.id,
      numberTable: orders.numberTable,
      status: orders.status,
      workerName: workers.name,
    })
    .from(orders)
    .innerJoin(workers, eq(orders.workerId, workers.id))
    .where(and(eq(orders.status, "closed"), isNotNull(orders.closedAt)))
}