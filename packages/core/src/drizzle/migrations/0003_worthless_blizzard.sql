ALTER TABLE "taxikassede"."user_organizations" DROP CONSTRAINT "user_organizations_organization_id_companies_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."user_organizations" ADD CONSTRAINT "user_organizations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "taxikassede"."organizations"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
