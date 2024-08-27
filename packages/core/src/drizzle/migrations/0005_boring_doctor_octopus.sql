DO $$ BEGIN
 CREATE TYPE "taxikassede"."segment_point_type" AS ENUM('start', 'waypoint', 'u_turn', 'merge', 'exit', 'fork', 'bridge', 'tunnel', 'crosswalk', 'turn', 'straight', 'end', 'junction', 'roundabout', 'pedestrian_crossing', 'rest_area', 'toll_booth', 'service_area', 'ferry_crossing', 'switchback', 'scenic_viewpoint', 'speed_bump', 'dead_end', 'overpass', 'underpass', 'railway_crossing', 'hazard_zone', 'yield_point', 'parking_lot_entrance', 'parking_lot_exit', 'controlled_intersection', 'shared_road', 'one_way', 'restricted_area', 'other', 'unknown');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "taxikassede"."routes" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "taxikassede"."route_segments" (
	"route_id" text NOT NULL,
	"sequence" integer NOT NULL,
	"direction" numeric,
	"distance" numeric NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "taxikassede"."segment_points" (
	"segment_id" text NOT NULL,
	"latitude" numeric NOT NULL,
	"longitude" numeric NOT NULL,
	"elevation" numeric,
	"point_type" "taxikassede"."segment_point_type" DEFAULT 'unknown',
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."route_segments" ADD CONSTRAINT "route_segments_route_id_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "taxikassede"."routes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."segment_points" ADD CONSTRAINT "segment_points_segment_id_route_segments_id_fk" FOREIGN KEY ("segment_id") REFERENCES "taxikassede"."route_segments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
