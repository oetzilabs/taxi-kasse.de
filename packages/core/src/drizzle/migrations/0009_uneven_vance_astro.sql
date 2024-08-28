ALTER TABLE "taxikassede"."orders" ADD COLUMN "estimated_cost" numeric;--> statement-breakpoint
ALTER TABLE "taxikassede"."orders" ADD COLUMN "driver_id" text;--> statement-breakpoint
ALTER TABLE "taxikassede"."orders" ADD COLUMN "customer_id" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."orders" ADD CONSTRAINT "orders_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "taxikassede"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."orders" ADD CONSTRAINT "orders_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "taxikassede"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
