CREATE TABLE IF NOT EXISTS "taxikassede"."daily_records" (
	"created_by" text NOT NULL,
	"date" date NOT NULL,
	"total_distance" text NOT NULL,
	"occupied_distance" text NOT NULL,
	"tour" integer NOT NULL,
	"revenue" numeric NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."daily_records" ADD CONSTRAINT "daily_records_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "taxikassede"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
