ALTER TABLE "taxikassede"."session" ALTER COLUMN "organization_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "taxikassede"."session" ADD COLUMN "company_id" text;