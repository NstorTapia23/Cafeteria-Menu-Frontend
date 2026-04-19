ALTER TABLE "workers" RENAME COLUMN "id " TO "id";--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "orders_worker_id_workers_id _fk";
--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;