CREATE INDEX "items_elaboration_area_idx" ON "items" USING btree ("elaboration_area");--> statement-breakpoint
CREATE INDEX "items_active_idx" ON "items" USING btree ("is_active") WHERE is_active = true;--> statement-breakpoint
CREATE INDEX "order_items_status_order_id_idx" ON "order_items" USING btree ("status","order_id");--> statement-breakpoint
CREATE INDEX "order_items_item_id_idx" ON "order_items" USING btree ("item_id");