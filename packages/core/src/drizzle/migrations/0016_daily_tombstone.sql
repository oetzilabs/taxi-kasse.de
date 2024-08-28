CREATE TABLE IF NOT EXISTS "taxikassede"."regions" (
	"name" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "taxikassede"."organization_regions" (
	"organization_id" text NOT NULL,
	"region_id" text NOT NULL,
	CONSTRAINT "organization_regions_organization_id_region_id_pk" PRIMARY KEY("organization_id","region_id")
);
--> statement-breakpoint
ALTER TABLE "taxikassede"."destinations" RENAME TO "addresses";--> statement-breakpoint
ALTER TABLE "taxikassede"."orders" DROP CONSTRAINT "orders_destination_id_destinations_id_fk";
--> statement-breakpoint
ALTER TABLE "taxikassede"."orders" ADD COLUMN "origin_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "taxikassede"."orders" ADD COLUMN "region_id" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."organization_regions" ADD CONSTRAINT "organization_regions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "taxikassede"."organizations"("id") ON DELETE cascade ON UPDATE no action;
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
 ALTER TABLE "taxikassede"."orders" ADD CONSTRAINT "orders_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "taxikassede"."regions"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
