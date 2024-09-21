ALTER TABLE "taxikassede"."rides" DROP CONSTRAINT "rides_vehicle_id_vehicles_id_fk";
--> statement-breakpoint
ALTER TABLE "taxikassede"."rides" ALTER COLUMN "vehicle_id" DROP NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."rides" ADD CONSTRAINT "rides_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "taxikassede"."vehicles"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
