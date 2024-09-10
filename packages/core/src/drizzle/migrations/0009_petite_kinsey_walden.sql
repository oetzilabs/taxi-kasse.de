ALTER TABLE "taxikassede"."vehicles" ADD COLUMN "overwrite_base_charge" numeric DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE "taxikassede"."vehicles" ADD COLUMN "overwrite_distance_charge" numeric DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE "taxikassede"."vehicles" ADD COLUMN "overwrite_time_charge" numeric DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE "taxikassede"."companies" ADD COLUMN "base_charge" numeric DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE "taxikassede"."companies" ADD COLUMN "distance_charge" numeric DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE "taxikassede"."companies" ADD COLUMN "time_charge" numeric DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE "taxikassede"."organizations" ADD COLUMN "base_charge" numeric DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE "taxikassede"."organizations" ADD COLUMN "distance_charge" numeric DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE "taxikassede"."organizations" ADD COLUMN "time_charge" numeric DEFAULT '0.00';