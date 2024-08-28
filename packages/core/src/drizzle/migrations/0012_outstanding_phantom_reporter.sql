ALTER TABLE "taxikassede"."system_notifications" ALTER COLUMN "message" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "taxikassede"."system_notifications" ADD COLUMN "title" text NOT NULL;--> statement-breakpoint
ALTER TABLE "taxikassede"."system_notifications" ADD COLUMN "action" json DEFAULT '{"type":"hide","label":"Close"}'::json;--> statement-breakpoint
ALTER TABLE "taxikassede"."system_notifications" DROP COLUMN IF EXISTS "bg_color";--> statement-breakpoint
ALTER TABLE "taxikassede"."system_notifications" DROP COLUMN IF EXISTS "text_color";