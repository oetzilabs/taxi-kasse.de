ALTER TABLE "taxikassede"."rides" DROP CONSTRAINT "rides_org_id_companies_id_fk";
--> statement-breakpoint
ALTER TABLE "taxikassede"."rides" ADD COLUMN "company_id" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."rides" ADD CONSTRAINT "rides_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "taxikassede"."companies"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "taxikassede"."rides" DROP COLUMN IF EXISTS "org_id";