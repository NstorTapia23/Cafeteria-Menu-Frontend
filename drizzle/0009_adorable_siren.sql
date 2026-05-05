ALTER TABLE "order_items" RENAME COLUMN "price_id" TO "priceid";--> statement-breakpoint
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_price_id_prices_id_fk";
--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_priceid_prices_id_fk" FOREIGN KEY ("priceid") REFERENCES "public"."prices"("id") ON DELETE no action ON UPDATE no action;