CREATE TABLE IF NOT EXISTS "taxikassede"."routes_waypoints" (
	"route_id" text NOT NULL,
	"latitude" numeric NOT NULL,
	"longitude" numeric NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "taxikassede"."segment_points" RENAME COLUMN "segment_id" TO "route_segment_id";--> statement-breakpoint
ALTER TABLE "taxikassede"."segment_points" DROP CONSTRAINT "segment_points_segment_id_route_segments_id_fk";
--> statement-breakpoint
ALTER TABLE "taxikassede"."routes" ADD COLUMN "driver_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "taxikassede"."destinations" ADD COLUMN "latitude" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "taxikassede"."destinations" ADD COLUMN "longitude" numeric NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."routes_waypoints" ADD CONSTRAINT "routes_waypoints_route_id_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "taxikassede"."routes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."routes" ADD CONSTRAINT "routes_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "taxikassede"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."segment_points" ADD CONSTRAINT "segment_points_route_segment_id_route_segments_id_fk" FOREIGN KEY ("route_segment_id") REFERENCES "taxikassede"."route_segments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "taxikassede"."destinations" DROP COLUMN IF EXISTS "lat";--> statement-breakpoint
ALTER TABLE "taxikassede"."destinations" DROP COLUMN IF EXISTS "lng";