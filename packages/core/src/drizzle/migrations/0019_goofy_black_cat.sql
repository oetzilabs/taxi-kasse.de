ALTER TABLE "taxikassede"."routes" ADD COLUMN "ride_id" text NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."routes" ADD CONSTRAINT "routes_ride_id_rides_id_fk" FOREIGN KEY ("ride_id") REFERENCES "taxikassede"."rides"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
