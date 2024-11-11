ALTER TABLE "taxikassede"."rides" ADD COLUMN "departure" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "taxikassede"."rides" ADD COLUMN "arrival" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "taxikassede"."rides" ADD COLUMN "departureCoordinates" json DEFAULT '[0,0]'::json NOT NULL;--> statement-breakpoint
ALTER TABLE "taxikassede"."rides" ADD COLUMN "arrivalCoordinates" json DEFAULT '[0,0]'::json NOT NULL;