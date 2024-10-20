ALTER TABLE "taxikassede"."events" ALTER COLUMN "description" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "taxikassede"."events" ADD COLUMN "content" text DEFAULT '' NOT NULL;