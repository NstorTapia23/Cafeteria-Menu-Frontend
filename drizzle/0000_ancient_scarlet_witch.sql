CREATE TYPE "public"."elaboration_areas" AS ENUM('cocina', 'bar', 'lunch');--> statement-breakpoint
CREATE TYPE "public"."order_item_status" AS ENUM('pending', 'cooked', 'delivered');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('open', 'closed', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."worker_role" AS ENUM('dependiente', 'bartender', 'cocinero', 'admin', 'lunch');--> statement-breakpoint
CREATE TABLE "items" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(500),
	"category_id" integer NOT NULL,
	"elaboration_area" "elaboration_areas" NOT NULL,
	"image_url" varchar(500),
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "items_categories" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "items_categories_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"item_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"status" "order_item_status" DEFAULT 'pending' NOT NULL,
	"priceid" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"worker_id" integer NOT NULL,
	"number_table" integer NOT NULL,
	"status" "order_status" DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"closed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "prices" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_id" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"valid_to" timestamp with time zone,
	"valid_from" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "workers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"worker_role" "worker_role" DEFAULT 'dependiente' NOT NULL,
	"create_at" timestamp with time zone DEFAULT now() NOT NULL,
	"delete_at" timestamp with time zone,
	CONSTRAINT "workers_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_category_id_items_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."items_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_priceid_prices_id_fk" FOREIGN KEY ("priceid") REFERENCES "public"."prices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prices" ADD CONSTRAINT "prices_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "items_category_id_idx" ON "items" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "items_elaboration_area_idx" ON "items" USING btree ("elaboration_area");--> statement-breakpoint
CREATE INDEX "items_active_idx" ON "items" USING btree ("is_active") WHERE is_active = true;--> statement-breakpoint
CREATE UNIQUE INDEX "items_categories_name_unique" ON "items_categories" USING btree ("name");--> statement-breakpoint
CREATE INDEX "items_categories_active_name_idx" ON "items_categories" USING btree ("name") WHERE is_active = true;--> statement-breakpoint
CREATE INDEX "order_items_order_id_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_items_status_order_id_idx" ON "order_items" USING btree ("status","order_id");--> statement-breakpoint
CREATE INDEX "order_items_item_id_idx" ON "order_items" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX "order_items_status_idx" ON "order_items" USING btree ("status");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "orders_worker_id_idx" ON "orders" USING btree ("worker_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_active_price_per_item" ON "prices" USING btree ("item_id") WHERE valid_to IS NULL;