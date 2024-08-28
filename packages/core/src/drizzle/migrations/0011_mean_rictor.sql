DO $$ BEGIN
 CREATE TYPE "taxikassede"."currency_code" AS ENUM('USD', 'EUR', 'GBP', 'CHF', 'JPY', 'AUD', 'CAD', 'NZD');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "taxikassede"."users" ADD COLUMN "currency_code" "taxikassede"."currency_code" DEFAULT 'USD' NOT NULL;