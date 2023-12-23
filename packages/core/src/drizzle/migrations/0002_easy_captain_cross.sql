CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer,
	`deleted_at` integer,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`type` text NOT NULL,
	`dismissed_at` integer
);
--> statement-breakpoint
CREATE TABLE `user_dismissed_notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer,
	`deleted_at` integer,
	`notification_id` text NOT NULL,
	`user_id` text NOT NULL,
	`dismissed_at` integer NOT NULL,
	FOREIGN KEY (`notification_id`) REFERENCES `notifications`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
