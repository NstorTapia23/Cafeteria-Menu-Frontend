ALTER TABLE "workers" ADD COLUMN "create_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "workers" ADD COLUMN "delete_at" timestamp with time zone;