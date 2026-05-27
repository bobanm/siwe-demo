CREATE TABLE `account` (
	`address` text PRIMARY KEY,
	`username` text UNIQUE,
	`bio` text
);
--> statement-breakpoint
CREATE TABLE `post` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`address` text NOT NULL,
	`timestamp` integer DEFAULT (unixepoch()) NOT NULL,
	`content` text NOT NULL
);
