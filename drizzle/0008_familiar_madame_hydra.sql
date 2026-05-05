ALTER TABLE "order_items" RENAME COLUMN "priceId" TO "price_id";--> statement-breakpoint
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_priceId_prices_id_fk";
--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_price_id_prices_id_fk" FOREIGN KEY ("price_id") REFERENCES "public"."prices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "items_categories_name_unique" ON "items_categories" USING btree ("name");--> statement-breakpoint
CREATE INDEX "items_categories_active_name_idx" ON "items_categories" USING btree ("name") WHERE is_active = true;--> statement-breakpoint
CREATE INDEX "order_items_order_id_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "orders_worker_id_idx" ON "orders" USING btree ("worker_id");