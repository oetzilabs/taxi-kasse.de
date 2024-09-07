ALTER TABLE "taxikassede"."rides" DROP CONSTRAINT "rides_org_id_organizations_id_fk";
--> statement-breakpoint
ALTER TABLE "taxikassede"."organizations" DROP CONSTRAINT "organizations_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "taxikassede"."user_organizations" DROP CONSTRAINT "user_organizations_organization_id_organizations_id_fk";
--> statement-breakpoint
ALTER TABLE "taxikassede"."orders" DROP CONSTRAINT "orders_organization_id_organizations_id_fk";
--> statement-breakpoint
ALTER TABLE "taxikassede"."orders" DROP CONSTRAINT "orders_driver_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "taxikassede"."orders" DROP CONSTRAINT "orders_customer_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "taxikassede"."rides" ALTER COLUMN "org_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "taxikassede"."organizations" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "taxikassede"."user_organizations" ALTER COLUMN "organization_id" DROP NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."rides" ADD CONSTRAINT "rides_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "taxikassede"."organizations"("id") ON DELETE set null ON UPDATE no action;
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
 ALTER TABLE "taxikassede"."user_organizations" ADD CONSTRAINT "user_organizations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "taxikassede"."organizations"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."orders" ADD CONSTRAINT "orders_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "taxikassede"."organizations"("id") ON DELETE set null ON UPDATE no action;
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
 ALTER TABLE "taxikassede"."orders" ADD CONSTRAINT "orders_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "taxikassede"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
