import { db } from "@/db";
import { workers } from "@/db/schema";
import { eq } from "drizzle-orm";

export type Worker = typeof workers.$inferSelect;

export async function getWorkerById(id: number): Promise<Worker | null> {
  if (!Number.isInteger(id) || id <= 0) return null;

  const [worker] = await db
    .select()
    .from(workers)
    .where(eq(workers.id, id))
    .limit(1);

  return worker ?? null;
}
