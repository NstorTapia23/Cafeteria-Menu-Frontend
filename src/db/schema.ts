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
  index,
} from "drizzle-orm/pg-core";
import { UserRole } from "@/types/roles";

export const workerRole = pgEnum("worker_role", [
  UserRole.DEPENDIENTE as string,
  UserRole.BARTENDER as string,
  UserRole.COCINERO as string,
  UserRole.ADMIN as string,
  UserRole.LUNCH as string,
]);

export const orderStatus = pgEnum("order_status", [
  "open",
  "closed",
  "canceled",
] as const);

export const orderItemStatus = pgEnum("order_item_status", [
  "pending",
  "cooked",
  "delivered",
] as const);

export const elaborationAreas = pgEnum("elaboration_areas", [
  "cocina",
  "bar",
  "lunch",
] as const);

export const workers = pgTable("workers", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: workerRole("worker_role").default("dependiente").notNull(),
  create_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
  delete_at: timestamp({ withTimezone: true }),
});

export const items_categories = pgTable(
  "items_categories",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: varchar("name", { length: 255 }).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    nameUnique: uniqueIndex("items_categories_name_unique").on(table.name),

    activeNameIdx: index("items_categories_active_name_idx")
      .on(table.name)
      .where(sql`is_active = true`),
  }),
);

export const items = pgTable(
  "items",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: varchar("description", { length: 500 }),
    categoryId: integer("category_id")
      .notNull()
      .references(() => items_categories.id),
    elaborationArea: elaborationAreas("elaboration_area").notNull(),
    imageUrl: varchar("image_url", { length: 500 }),
    is_active: boolean("is_active").default(true).notNull(),
  },
  (table) => [
    index("items_category_id_idx").on(table.categoryId),
    index("items_elaboration_area_idx").on(table.elaborationArea),
    index("items_active_idx").on(table.is_active).where(sql`is_active = true`),
  ],
);

export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    workerId: integer("worker_id")
      .notNull()
      .references(() => workers.id),
    numberTable: integer("number_table").notNull(),
    status: orderStatus("status").notNull().default("open"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
    closedAt: timestamp("closed_at", { withTimezone: true, mode: "date" }),
  },
  (table) => [
    index("orders_status_idx").on(table.status),

    index("orders_worker_id_idx").on(table.workerId),
  ],
);

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

export const orderItems = pgTable(
  "order_items",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id),
    itemId: integer("item_id")
      .notNull()
      .references(() => items.id),
    quantity: integer("quantity").notNull(),
    status: orderItemStatus("status").notNull().default("pending"),
    priceId: integer("priceid").notNull().references(() => prices.id),
  },
  (table) => [
    index("order_items_order_id_idx").on(table.orderId),
    index("order_items_status_order_id_idx").on(table.status, table.orderId),
    index("order_items_item_id_idx").on(table.itemId),
    index("order_items_status_idx").on(table.status),
  ],
);