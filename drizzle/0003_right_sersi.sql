ALTER TABLE "workers" ALTER COLUMN "worker_role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "workers" ALTER COLUMN "worker_role" SET DEFAULT 'dependiente'::text;--> statement-breakpoint
DROP TYPE "public"."worker_role";--> statement-breakpoint
CREATE TYPE "public"."worker_role" AS ENUM('dependiente', 'bartender', 'cocinero', 'admin');--> statement-breakpoint
ALTER TABLE "workers" ALTER COLUMN "worker_role" SET DEFAULT 'dependiente'::"public"."worker_role";--> statement-breakpoint
ALTER TABLE "workers" ALTER COLUMN "worker_role" SET DATA TYPE "public"."worker_role" USING "worker_role"::"public"."worker_role";