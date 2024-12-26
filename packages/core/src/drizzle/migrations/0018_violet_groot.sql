ALTER TABLE "taxikassede"."daily_records" DROP CONSTRAINT "daily_records_created_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "taxikassede"."daily_records" ADD COLUMN "company_id" text NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."daily_records" ADD CONSTRAINT "daily_records_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "taxikassede"."companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."daily_records" ADD CONSTRAINT "daily_records_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "taxikassede"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
