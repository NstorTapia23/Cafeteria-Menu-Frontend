CREATE TABLE "items_categories" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "items_categories_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "category_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_category_id_items_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."items_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "items_category_id_idx" ON "items" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "order_items_status_idx" ON "order_items" USING btree ("status");