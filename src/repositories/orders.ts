import { db } from "@/db";
import { orders, workers } from "@/db/schema";
import { and, eq, isNotNull } from "drizzle-orm";
import { getWorkerById } from "./workers";

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

export async function CreateNewOrder(
  workerID: number,
  numberTableSend: number,
) {
  if (!Number.isInteger(workerID) || workerID <= 0) {
    throw new Error("ID de trabajador inválido");
  }
  if (!Number.isInteger(numberTableSend) || numberTableSend <= 0) {
    throw new Error("Número de mesa inválido");
  }
  const worker = await getWorkerById(workerID);
  if (!worker) {
    throw new Error("Trabajador no encontrado");
  }

  try {
    return await db
      .insert(orders)
      .values({ workerId: workerID, numberTable: numberTableSend })
      .returning();
  } catch (error) {
    let message = "Error desconocido";
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    }
    throw new Error(`Error al crear la orden: ${message}`);
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