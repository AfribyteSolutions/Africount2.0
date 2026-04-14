CREATE TABLE `workspace_localization_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`defaultLanguage` varchar(10) NOT NULL DEFAULT 'en',
	`defaultCurrency` varchar(3) NOT NULL DEFAULT 'USD',
	`dateFormat` varchar(20) NOT NULL DEFAULT 'MM/DD/YYYY',
	`timezone` varchar(50) NOT NULL DEFAULT 'UTC',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workspace_localization_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `workspace_localization_workspace_idx` UNIQUE(`workspaceId`)
);
