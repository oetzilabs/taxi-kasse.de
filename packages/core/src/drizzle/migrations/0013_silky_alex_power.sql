CREATE TABLE IF NOT EXISTS "taxikassede"."user_hidden_system_notifications" (
	"user_id" text,
	"system_notification_id" text,
	CONSTRAINT "user_hidden_system_notifications_user_id_system_notification_id_pk" PRIMARY KEY("user_id","system_notification_id")
);
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
