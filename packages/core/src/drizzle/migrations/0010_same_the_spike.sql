DO $$ BEGIN
 CREATE TYPE "taxikassede"."ride_added" AS ENUM('user:manual', 'system:auto', 'admin:manual');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "taxikassede"."rides" ADD COLUMN "added_by" "taxikassede"."ride_added" DEFAULT 'system:auto' NOT NULL;