CREATE TABLE IF NOT EXISTS "taxikassede"."destinations" (
	"lat" text NOT NULL,
	"lng" text NOT NULL,
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
	"organization_id" text,
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "taxikassede"."system_notifications" (
	"message" text NOT NULL,
	"bg_color" text DEFAULT '#000000' NOT NULL,
	"text_color" text DEFAULT '#FFFFFF' NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."orders" ADD CONSTRAINT "orders_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "taxikassede"."destinations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."orders" ADD CONSTRAINT "orders_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "taxikassede"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
