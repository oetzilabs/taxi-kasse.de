CREATE TABLE IF NOT EXISTS "taxikassede"."user_companies" (
	"user_id" text NOT NULL,
	"company_id" text,
	"role" "taxikassede"."comp_role" DEFAULT 'employee' NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."user_companies" ADD CONSTRAINT "user_companies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "taxikassede"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."user_companies" ADD CONSTRAINT "user_companies_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "taxikassede"."companies"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
