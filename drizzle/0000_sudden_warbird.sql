CREATE TABLE `anonymous_scenarios` (
	`id` text PRIMARY KEY NOT NULL,
	`hash` text NOT NULL,
	`profile_data` text NOT NULL,
	`calculated_results` text NOT NULL,
	`views_count` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`expires_at` text
);
--> statement-breakpoint
CREATE TABLE `rate_tables` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`effective_from` text NOT NULL,
	`effective_to` text,
	`is_current` integer DEFAULT true NOT NULL,
	`wff_config` text NOT NULL,
	`as_config` text NOT NULL,
	`family_boost_config` text NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_feedback` (
	`id` text PRIMARY KEY NOT NULL,
	`category` text NOT NULL,
	`message` text NOT NULL,
	`scenario_snapshot` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL
);
