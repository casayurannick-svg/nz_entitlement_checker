CREATE TABLE `msd_postcode_areas` (
	`postcode` text PRIMARY KEY NOT NULL,
	`suburb` text NOT NULL,
	`city` text NOT NULL,
	`region` text NOT NULL,
	`area` integer NOT NULL,
	`notes` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `saved_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`session_token` text,
	`title` text,
	`profile_data` text NOT NULL,
	`calculated_results` text NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`expires_at` text
);
