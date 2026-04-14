CREATE TABLE `supported_currencies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(3) NOT NULL,
	`symbol` varchar(5) NOT NULL,
	`name` varchar(100) NOT NULL,
	`exchangeRate` decimal(15,6) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`decimalPlaces` int NOT NULL DEFAULT 2,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `supported_currencies_id` PRIMARY KEY(`id`),
	CONSTRAINT `supported_currencies_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `translation_keys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(255) NOT NULL,
	`module` varchar(100) NOT NULL,
	`description` text,
	`context` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `translation_keys_id` PRIMARY KEY(`id`),
	CONSTRAINT `translation_keys_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `translation_values` (
	`id` int AUTO_INCREMENT NOT NULL,
	`translationKeyId` int NOT NULL,
	`language` varchar(10) NOT NULL,
	`value` text NOT NULL,
	`isApproved` boolean NOT NULL DEFAULT false,
	`approvedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `translation_values_id` PRIMARY KEY(`id`),
	CONSTRAINT `transval_key_language_idx` UNIQUE(`translationKeyId`,`language`)
);
--> statement-breakpoint
CREATE TABLE `user_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`workspaceId` int NOT NULL,
	`language` varchar(10) NOT NULL DEFAULT 'en',
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`dateFormat` varchar(20) NOT NULL DEFAULT 'MM/DD/YYYY',
	`timezone` varchar(50) NOT NULL DEFAULT 'UTC',
	`theme` enum('light','dark') NOT NULL DEFAULT 'light',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `pref_user_workspace_idx` UNIQUE(`userId`,`workspaceId`)
);
--> statement-breakpoint
CREATE INDEX `curr_code_idx` ON `supported_currencies` (`code`);--> statement-breakpoint
CREATE INDEX `curr_active_idx` ON `supported_currencies` (`isActive`);--> statement-breakpoint
CREATE INDEX `trans_key_idx` ON `translation_keys` (`key`);--> statement-breakpoint
CREATE INDEX `trans_module_idx` ON `translation_keys` (`module`);--> statement-breakpoint
CREATE INDEX `transval_key_idx` ON `translation_values` (`translationKeyId`);--> statement-breakpoint
CREATE INDEX `transval_language_idx` ON `translation_values` (`language`);--> statement-breakpoint
CREATE INDEX `pref_user_idx` ON `user_preferences` (`userId`);--> statement-breakpoint
CREATE INDEX `pref_workspace_idx` ON `user_preferences` (`workspaceId`);