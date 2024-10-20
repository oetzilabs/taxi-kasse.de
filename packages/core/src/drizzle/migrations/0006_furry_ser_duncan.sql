ALTER TABLE "taxikassede"."events" RENAME COLUMN "content" TO "content_html";--> statement-breakpoint
ALTER TABLE "taxikassede"."events" ADD COLUMN "content_text" text DEFAULT '' NOT NULL;