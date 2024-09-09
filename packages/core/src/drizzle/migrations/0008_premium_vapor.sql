ALTER TABLE "taxikassede"."company_discounts" RENAME COLUMN "deal_id" TO "discount_id";--> statement-breakpoint
ALTER TABLE "taxikassede"."organization_discounts" RENAME COLUMN "deal_id" TO "discount_id";--> statement-breakpoint
ALTER TABLE "taxikassede"."company_discounts" DROP CONSTRAINT "company_discounts_deal_id_discounts_id_fk";
--> statement-breakpoint
ALTER TABLE "taxikassede"."organization_discounts" DROP CONSTRAINT "organization_discounts_deal_id_discounts_id_fk";
--> statement-breakpoint
ALTER TABLE "taxikassede"."company_discounts" DROP CONSTRAINT "company_discounts_company_id_deal_id_pk";--> statement-breakpoint
ALTER TABLE "taxikassede"."organization_discounts" DROP CONSTRAINT "organization_discounts_organization_id_deal_id_pk";--> statement-breakpoint
ALTER TABLE "taxikassede"."company_discounts" ADD CONSTRAINT "company_discounts_company_id_discount_id_pk" PRIMARY KEY("company_id","discount_id");--> statement-breakpoint
ALTER TABLE "taxikassede"."organization_discounts" ADD CONSTRAINT "organization_discounts_organization_id_discount_id_pk" PRIMARY KEY("organization_id","discount_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."company_discounts" ADD CONSTRAINT "company_discounts_discount_id_discounts_id_fk" FOREIGN KEY ("discount_id") REFERENCES "taxikassede"."discounts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."organization_discounts" ADD CONSTRAINT "organization_discounts_discount_id_discounts_id_fk" FOREIGN KEY ("discount_id") REFERENCES "taxikassede"."discounts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
