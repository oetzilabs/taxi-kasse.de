DO $$ BEGIN
 CREATE TYPE "taxikassede"."ride_status" AS ENUM('pending', 'accepted', 'rejected', 'completed', 'cancelled', 'archived');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "taxikassede"."rides" ADD COLUMN "status" "taxikassede"."ride_status" DEFAULT 'pending' NOT NULL;