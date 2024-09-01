ALTER TABLE "taxikassede"."vehicles" RENAME COLUMN "model" TO "model_id";--> statement-breakpoint
ALTER TABLE "taxikassede"."vehicles" DROP CONSTRAINT "vehicles_model_vehicle_models_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."vehicles" ADD CONSTRAINT "vehicles_model_id_vehicle_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "taxikassede"."vehicle_models"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
