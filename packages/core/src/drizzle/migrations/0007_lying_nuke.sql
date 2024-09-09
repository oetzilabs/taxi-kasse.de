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
CREATE TABLE IF NOT EXISTS "taxikassede"."company_discounts" (
	"company_id" text,
	"deal_id" text,
	CONSTRAINT "company_discounts_company_id_deal_id_pk" PRIMARY KEY("company_id","deal_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "taxikassede"."organization_discounts" (
	"organization_id" text,
	"deal_id" text,
	CONSTRAINT "organization_discounts_organization_id_deal_id_pk" PRIMARY KEY("organization_id","deal_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."company_discounts" ADD CONSTRAINT "company_discounts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "taxikassede"."companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."company_discounts" ADD CONSTRAINT "company_discounts_deal_id_discounts_id_fk" FOREIGN KEY ("deal_id") REFERENCES "taxikassede"."discounts"("id") ON DELETE cascade ON UPDATE no action;
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
 ALTER TABLE "taxikassede"."organization_discounts" ADD CONSTRAINT "organization_discounts_deal_id_discounts_id_fk" FOREIGN KEY ("deal_id") REFERENCES "taxikassede"."discounts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
