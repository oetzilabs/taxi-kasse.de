ALTER TABLE "taxikassede"."companies" DROP CONSTRAINT "companies_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "taxikassede"."companies" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."companies" ADD CONSTRAINT "companies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "taxikassede"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
