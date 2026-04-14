CREATE TABLE `dashboard_layouts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`workspaceId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`layoutConfig` json NOT NULL,
	`isDefault` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dashboard_layouts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dashboard_presets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`layoutConfig` json NOT NULL,
	`createdBy` int NOT NULL,
	`isPublic` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dashboard_presets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `dashboard_user_workspace_idx` ON `dashboard_layouts` (`userId`,`workspaceId`);--> statement-breakpoint
CREATE INDEX `dashboard_default_idx` ON `dashboard_layouts` (`isDefault`);--> statement-breakpoint
CREATE INDEX `preset_workspace_idx` ON `dashboard_presets` (`workspaceId`);--> statement-breakpoint
CREATE INDEX `preset_public_idx` ON `dashboard_presets` (`isPublic`);