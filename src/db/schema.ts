import { sql } from "drizzle-orm";
import {
  pgEnum,
  pgTable,
  serial,
  integer,
  varchar,
  numeric,
  timestamp,
  boolean,
  uniqueIndex,
} from "drizzle-orm/pg-core";

//enums
export const workerRole = pgEnum("worker_role", [
  "dependiente",
  "bartender",
  "cocinero",
  "admin",
  "superadmin",
] as const);

export const orderStatus = pgEnum("order_status", [
  "open",
  "closed",
  "canceled",
] as const);

export const orderItemStatus = pgEnum("order_item_status", [
  "pending",
  "cooked",
  "delivered",
  "rejected",
] as const);

export const elaborationAreas = pgEnum("elaboration_areas", [
  "cocina",
  "bar",
  "lunch",
] as const);

//logica de negocio
export const workers = pgTable("workers", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: workerRole("worker_role").default("dependiente").notNull(),
});
export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 500 }),
  elaborationArea: elaborationAreas("elaboration_area").notNull(),
  imageUrl: varchar("image_url", { length: 500 }),
  is_active: boolean("is_active").default(true).notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  workerId: integer("worker_id")
    .notNull()
    .references(() => workers.id),
  name: varchar("name", { length: 255 }).notNull(),
  numberTable: integer("number_table").notNull(),
  status: orderStatus("status").notNull().default("open"),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  })
    .notNull()
    .defaultNow(),
  closedAt: timestamp("closed_at", { withTimezone: true, mode: "date" }),
});

export const prices = pgTable(
  "prices",
  {
    id: serial("id").primaryKey(),
    itemId: integer("item_id")
      .notNull()
      .references(() => items.id),
    amount: numeric("amount", {
      precision: 10,
      scale: 2,
      mode: "number",
    }).notNull(),
    validTo: timestamp("valid_to", { withTimezone: true, mode: "date" }),
    validFrom: timestamp("valid_from", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    uniqueActivePricePerItem: uniqueIndex("unique_active_price_per_item")
      .on(table.itemId)
      .where(sql`valid_to IS NULL`),
  }),
);

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id),
  itemId: integer("item_id")
    .notNull()
    .references(() => items.id),
  quantity: integer("quantity").notNull(),
  status: orderItemStatus("status").notNull().default("pending"),
});
