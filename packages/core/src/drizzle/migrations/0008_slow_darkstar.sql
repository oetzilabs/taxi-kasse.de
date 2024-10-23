DO $$ BEGIN
 CREATE TYPE "taxikassede"."mailbouncer_type" AS ENUM('Transient.General', 'Transient.AttachmentRejected', 'Transient.MailboxFull', 'Transient.MessageTooLarge', 'Transient.ContentRejected', 'Transient.RecipientThrottled', 'Permanent.General', 'Permanent.NoEmailAddress', 'Permanent.Suppressed', 'Permanent.MailboxDoesNotExist', 'Permanent.MailboxUnavailable', 'Permanent.MessageContentRejected', 'Permanent.MessageRejected', 'Undetermined');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "taxikassede"."mailcomplaint_type" AS ENUM('Spam', 'Abuse', 'Other', 'Unknown');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "taxikassede"."mailbouncer" (
	"email" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"type" "taxikassede"."mailbouncer_type" NOT NULL,
	"t" text NOT NULL,
	"st" text NOT NULL,
	"locked" boolean DEFAULT false NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "taxikassede"."mailcomplaint" (
	"email" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"type" "taxikassede"."mailcomplaint_type" NOT NULL,
	"t" text NOT NULL,
	"complaintTimestamp" timestamp NOT NULL,
	"feedbackId" text NOT NULL,
	"locked" boolean DEFAULT false NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
