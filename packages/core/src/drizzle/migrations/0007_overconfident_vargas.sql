ALTER TABLE "taxikassede"."events" DROP CONSTRAINT "events_origin_id_addresses_id_fk";
--> statement-breakpoint
ALTER TABLE "taxikassede"."events" ALTER COLUMN "origin_id" DROP NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."events" ADD CONSTRAINT "events_origin_id_addresses_id_fk" FOREIGN KEY ("origin_id") REFERENCES "taxikassede"."addresses"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
