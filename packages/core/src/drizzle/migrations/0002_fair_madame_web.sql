CREATE TABLE IF NOT EXISTS "taxikassede"."customer_payments" (
	"owner_id" text NOT NULL,
	"charge" numeric DEFAULT '0.0' NOT NULL,
	"tip" numeric DEFAULT '0.0' NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "taxikassede"."rides" ADD COLUMN "payment_id" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."customer_payments" ADD CONSTRAINT "customer_payments_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "taxikassede"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "taxikassede"."rides" ADD CONSTRAINT "rides_payment_id_customer_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "taxikassede"."customer_payments"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
