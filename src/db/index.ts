import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  pool: Pool | undefined;
};
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,                     
  idleTimeoutMillis: 30000,   
  connectionTimeoutMillis: 5000, 
});
if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

export const db = drizzle(pool, { schema });