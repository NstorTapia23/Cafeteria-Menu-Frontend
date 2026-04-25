ALTER TYPE "public"."worker_role" ADD VALUE 'lunch';--> statement-breakpoint
ALTER TABLE "order_items" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "order_items" ALTER COLUMN "status" SET DEFAULT 'pending'::text;--> statement-breakpoint
DROP TYPE "public"."order_item_status";--> statement-breakpoint
CREATE TYPE "public"."order_item_status" AS ENUM('pending', 'cooked', 'delivered');--> statement-breakpoint
ALTER TABLE "order_items" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."order_item_status";--> statement-breakpoint
ALTER TABLE "order_items" ALTER COLUMN "status" SET DATA TYPE "public"."order_item_status" USING "status"::"public"."order_item_status";