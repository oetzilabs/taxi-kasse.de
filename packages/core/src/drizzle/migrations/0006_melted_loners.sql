ALTER TABLE "taxikassede"."segment_points" ADD COLUMN "direction" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "taxikassede"."segment_points" ADD COLUMN "previous_segment_point_id" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."segment_points" ADD CONSTRAINT "segment_points_previous_segment_point_id_segment_points_id_fk" FOREIGN KEY ("previous_segment_point_id") REFERENCES "taxikassede"."segment_points"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
