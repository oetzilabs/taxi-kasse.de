CREATE TABLE IF NOT EXISTS "taxikassede"."vehicle_models" (
	"brand" text NOT NULL,
	"name" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "taxikassede"."vehicles" ALTER COLUMN "model" DROP NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."vehicles" ADD CONSTRAINT "vehicles_model_vehicle_models_id_fk" FOREIGN KEY ("model") REFERENCES "taxikassede"."vehicle_models"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
