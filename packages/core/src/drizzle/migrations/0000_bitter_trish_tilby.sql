CREATE SCHEMA IF NOT EXISTS "taxikassede";
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "taxikassede"."currency_code" AS ENUM('USD', 'EUR', 'GBP', 'CHF', 'JPY', 'AUD', 'CAD', 'NZD');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "taxikassede"."ride_added" AS ENUM('user:manual', 'system:auto', 'admin:manual');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "taxikassede"."ride_status" AS ENUM('pending', 'accepted', 'rejected', 'completed', 'cancelled', 'archived');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "taxikassede"."segment_point_type" AS ENUM('start', 'waypoint', 'u_turn', 'merge', 'exit', 'fork', 'bridge', 'tunnel', 'crosswalk', 'turn', 'straight', 'end', 'junction', 'roundabout', 'pedestrian_crossing', 'rest_area', 'toll_booth', 'service_area', 'ferry_crossing', 'switchback', 'scenic_viewpoint', 'speed_bump', 'dead_end', 'overpass', 'underpass', 'railway_crossing', 'hazard_zone', 'yield_point', 'parking_lot_entrance', 'parking_lot_exit', 'controlled_intersection', 'shared_road', 'one_way', 'restricted_area', 'other', 'unknown');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "taxikassede"."verification_status" AS ENUM('pending', 'verified', 'rejected');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "taxikassede"."comp_role" AS ENUM('owner', 'employee');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "taxikassede"."org_roles" AS ENUM('owner', 'employee');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "taxikassede"."user_roles" AS ENUM('admin', 'member');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "taxikassede"."discounts" (
	"name" text NOT NULL,
	"description" text,
	"data" json,
	"start_date" text,
	"end_date" text,
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "taxikassede"."session" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"user_id" varchar NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"access_token" text,
	"organization_id" text,
	"company_id" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "taxikassede"."users" (
	"name" text NOT NULL,
	"email" text NOT NULL,
	"image" text,
	"verified_at" timestamp with time zone,
	"role" "taxikassede"."user_roles" DEFAULT 'member' NOT NULL,
	"currency_code" "taxikassede"."currency_code" DEFAULT 'USD' NOT NULL,
	"referral_code" varchar,
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "taxikassede"."vehicles" (
	"owner_id" text NOT NULL,
	"name" text NOT NULL,
	"license_plate" text NOT NULL,
	"model_id" text,
	"inspection_date" timestamp with time zone,
	"mileage" numeric DEFAULT '0.000' NOT NULL,
	"overwrite_base_charge" numeric DEFAULT '0.00',
	"overwrite_distance_charge" numeric DEFAULT '0.00',
	"overwrite_time_charge" numeric DEFAULT '0.00',
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "taxikassede"."vehicle_models" (
	"brand" text NOT NULL,
	"name" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "taxikassede"."rides" (
	"user_id" text NOT NULL,
	"company_id" text,
	"income" numeric DEFAULT '0.00' NOT NULL,
	"distance" numeric DEFAULT '0.000' NOT NULL,
	"vehicle_id" text NOT NULL,
	"rating" numeric DEFAULT '0.00' NOT NULL,
	"status" "taxikassede"."ride_status" DEFAULT 'pending' NOT NULL,
	"added_by" "taxikassede"."ride_added" DEFAULT 'system:auto' NOT NULL,
	"startedAt" timestamp NOT NULL,
	"endedAt" timestamp NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "taxikassede"."routes" (
	"name" text NOT NULL,
	"description" text,
	"driver_id" text NOT NULL,
	"ride_id" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
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
CREATE TABLE IF NOT EXISTS "taxikassede"."segment_points" (
	"route_segment_id" text NOT NULL,
	"latitude" numeric NOT NULL,
	"longitude" numeric NOT NULL,
	"direction" integer NOT NULL,
	"elevation" numeric,
	"point_type" "taxikassede"."segment_point_type" DEFAULT 'unknown' NOT NULL,
	"previous_segment_point_id" text,
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "taxikassede"."verifications" (
	"owner_id" text NOT NULL,
	"code" text NOT NULL,
	"status" "taxikassede"."verification_status" DEFAULT 'pending' NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "taxikassede"."regions" (
	"name" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "taxikassede"."companies" (
	"user_id" text,
	"name" text NOT NULL,
	"image" text DEFAULT '/images/default-company-profile.png' NOT NULL,
	"banner" text DEFAULT '/images/default-company-banner.png' NOT NULL,
	"phone_number" text,
	"website" text,
	"email" text NOT NULL,
	"uid" text DEFAULT '' NOT NULL,
	"base_charge" numeric DEFAULT '0.00',
	"distance_charge" numeric DEFAULT '0.00',
	"time_charge" numeric DEFAULT '0.00',
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "taxikassede"."user_companies" (
	"user_id" text NOT NULL,
	"company_id" text,
	"role" "taxikassede"."comp_role" DEFAULT 'employee' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "taxikassede"."company_regions" (
	"company_id" text NOT NULL,
	"region_id" text NOT NULL,
	CONSTRAINT "company_regions_company_id_region_id_pk" PRIMARY KEY("company_id","region_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "taxikassede"."company_discounts" (
	"company_id" text,
	"discount_id" text,
	CONSTRAINT "company_discounts_company_id_discount_id_pk" PRIMARY KEY("company_id","discount_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "taxikassede"."organization_companies" (
	"company_id" text NOT NULL,
	"organization_id" text,
	"role" "taxikassede"."org_roles" DEFAULT 'employee' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "taxikassede"."organizations" (
	"user_id" text,
	"name" text NOT NULL,
	"image" text DEFAULT '/images/default-organization-profile.png' NOT NULL,
	"banner" text DEFAULT '/images/default-organization-banner.png' NOT NULL,
	"phone_number" text,
	"website" text,
	"email" text NOT NULL,
	"uid" text DEFAULT '' NOT NULL,
	"base_charge" numeric DEFAULT '0.00',
	"distance_charge" numeric DEFAULT '0.00',
	"time_charge" numeric DEFAULT '0.00',
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "taxikassede"."user_organizations" (
	"user_id" text NOT NULL,
	"organization_id" text,
	"role" "taxikassede"."org_roles" DEFAULT 'employee' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "taxikassede"."organization_regions" (
	"organization_id" text NOT NULL,
	"region_id" text NOT NULL,
	CONSTRAINT "organization_regions_organization_id_region_id_pk" PRIMARY KEY("organization_id","region_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "taxikassede"."organization_discounts" (
	"organization_id" text,
	"discount_id" text,
	CONSTRAINT "organization_discounts_organization_id_discount_id_pk" PRIMARY KEY("organization_id","discount_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "taxikassede"."addresses" (
	"latitude" numeric NOT NULL,
	"longitude" numeric NOT NULL,
	"streetname" text NOT NULL,
	"zipcode" text NOT NULL,
	"country" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "taxikassede"."orders" (
	"destination_id" text NOT NULL,
	"origin_id" text NOT NULL,
	"estimated_cost" numeric,
	"organization_id" text,
	"driver_id" text,
	"region_id" text,
	"customer_id" text,
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "taxikassede"."system_notifications" (
	"title" text NOT NULL,
	"message" text,
	"action" json DEFAULT '{"type":"hide","label":"Close"}'::json,
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "taxikassede"."user_hidden_system_notifications" (
	"user_id" text NOT NULL,
	"system_notification_id" text NOT NULL,
	CONSTRAINT "user_hidden_system_notifications_user_id_system_notification_id_pk" PRIMARY KEY("user_id","system_notification_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."session" ADD CONSTRAINT "session_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "taxikassede"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."vehicles" ADD CONSTRAINT "vehicles_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "taxikassede"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."vehicles" ADD CONSTRAINT "vehicles_model_id_vehicle_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "taxikassede"."vehicle_models"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."rides" ADD CONSTRAINT "rides_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "taxikassede"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."rides" ADD CONSTRAINT "rides_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "taxikassede"."companies"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."rides" ADD CONSTRAINT "rides_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "taxikassede"."vehicles"("id") ON DELETE cascade ON UPDATE no action;
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
 ALTER TABLE "taxikassede"."routes" ADD CONSTRAINT "routes_ride_id_rides_id_fk" FOREIGN KEY ("ride_id") REFERENCES "taxikassede"."rides"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."route_segments" ADD CONSTRAINT "route_segments_route_id_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "taxikassede"."routes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."routes_waypoints" ADD CONSTRAINT "routes_waypoints_route_id_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "taxikassede"."routes"("id") ON DELETE cascade ON UPDATE no action;
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
DO $$ BEGIN
 ALTER TABLE "taxikassede"."segment_points" ADD CONSTRAINT "segment_points_previous_segment_point_id_segment_points_id_fk" FOREIGN KEY ("previous_segment_point_id") REFERENCES "taxikassede"."segment_points"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."verifications" ADD CONSTRAINT "verifications_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "taxikassede"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."companies" ADD CONSTRAINT "companies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "taxikassede"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."user_companies" ADD CONSTRAINT "user_companies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "taxikassede"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."user_companies" ADD CONSTRAINT "user_companies_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "taxikassede"."companies"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."company_regions" ADD CONSTRAINT "company_regions_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "taxikassede"."companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."company_regions" ADD CONSTRAINT "company_regions_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "taxikassede"."regions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."company_discounts" ADD CONSTRAINT "company_discounts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "taxikassede"."companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."company_discounts" ADD CONSTRAINT "company_discounts_discount_id_discounts_id_fk" FOREIGN KEY ("discount_id") REFERENCES "taxikassede"."discounts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."organization_companies" ADD CONSTRAINT "organization_companies_company_id_users_id_fk" FOREIGN KEY ("company_id") REFERENCES "taxikassede"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."organization_companies" ADD CONSTRAINT "organization_companies_organization_id_companies_id_fk" FOREIGN KEY ("organization_id") REFERENCES "taxikassede"."companies"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."organizations" ADD CONSTRAINT "organizations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "taxikassede"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."user_organizations" ADD CONSTRAINT "user_organizations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "taxikassede"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."user_organizations" ADD CONSTRAINT "user_organizations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "taxikassede"."organizations"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."organization_regions" ADD CONSTRAINT "organization_regions_organization_id_companies_id_fk" FOREIGN KEY ("organization_id") REFERENCES "taxikassede"."companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."organization_regions" ADD CONSTRAINT "organization_regions_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "taxikassede"."regions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."organization_discounts" ADD CONSTRAINT "organization_discounts_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "taxikassede"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."organization_discounts" ADD CONSTRAINT "organization_discounts_discount_id_discounts_id_fk" FOREIGN KEY ("discount_id") REFERENCES "taxikassede"."discounts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."orders" ADD CONSTRAINT "orders_destination_id_addresses_id_fk" FOREIGN KEY ("destination_id") REFERENCES "taxikassede"."addresses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."orders" ADD CONSTRAINT "orders_origin_id_addresses_id_fk" FOREIGN KEY ("origin_id") REFERENCES "taxikassede"."addresses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."orders" ADD CONSTRAINT "orders_organization_id_companies_id_fk" FOREIGN KEY ("organization_id") REFERENCES "taxikassede"."companies"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."orders" ADD CONSTRAINT "orders_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "taxikassede"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."orders" ADD CONSTRAINT "orders_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "taxikassede"."regions"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."orders" ADD CONSTRAINT "orders_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "taxikassede"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."user_hidden_system_notifications" ADD CONSTRAINT "user_hidden_system_notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "taxikassede"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."user_hidden_system_notifications" ADD CONSTRAINT "user_hidden_system_notifications_system_notification_id_system_notifications_id_fk" FOREIGN KEY ("system_notification_id") REFERENCES "taxikassede"."system_notifications"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
