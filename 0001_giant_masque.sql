CREATE TABLE `activity_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`userId` int NOT NULL,
	`action` varchar(255) NOT NULL,
	`entityType` varchar(100) NOT NULL,
	`entityId` int NOT NULL,
	`changes` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activity_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agent_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`userId` int NOT NULL,
	`accountName` varchar(255) NOT NULL,
	`accountType` enum('cash','bank','mobile_money','other') NOT NULL,
	`customFields` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agent_accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `project_user_idx` UNIQUE(`projectId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `agent_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`accountId` int NOT NULL,
	`entryType` enum('cash_in','cash_out') NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`description` varchar(500),
	`date` timestamp NOT NULL,
	`reference` varchar(255),
	`customData` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agent_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `balance_sheet_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`balanceSheetId` int NOT NULL,
	`section` enum('assets','liabilities','equity') NOT NULL,
	`category` varchar(255) NOT NULL,
	`description` text,
	`amount` decimal(15,2) NOT NULL,
	`sourceFile` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `balance_sheet_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `balance_sheets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`period` varchar(50),
	`totalAssets` decimal(15,2) DEFAULT '0',
	`totalLiabilities` decimal(15,2) DEFAULT '0',
	`totalEquity` decimal(15,2) DEFAULT '0',
	`netWorth` decimal(15,2) DEFAULT '0',
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `balance_sheets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`entityType` enum('balance_sheet','transaction','computing_table','sheet_import','general') NOT NULL,
	`entityId` int NOT NULL,
	`userId` int NOT NULL,
	`content` text NOT NULL,
	`parentCommentId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `computing_table_columns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tableId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('text','number','date','formula') NOT NULL,
	`formula` text,
	`order` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `computing_table_columns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `computing_table_rows` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tableId` int NOT NULL,
	`rowData` json NOT NULL,
	`order` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `computing_table_rows_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `computing_tables` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`type` enum('cost_tracking','revenue_tracking','custom') NOT NULL,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `computing_tables_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `module_permissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceMemberId` int NOT NULL,
	`module` enum('projects','balance_sheets','computing_tables','agent_data','transactions','comparisons','collaboration','exports') NOT NULL,
	`canRead` boolean NOT NULL DEFAULT true,
	`canWrite` boolean NOT NULL DEFAULT false,
	`canDelete` boolean NOT NULL DEFAULT false,
	`canManagePermissions` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `module_permissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`logo` text,
	`description` text,
	`ownerId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `organizations_id` PRIMARY KEY(`id`),
	CONSTRAINT `organizations_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `project_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('owner','editor','viewer') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `project_members_id` PRIMARY KEY(`id`),
	CONSTRAINT `project_user_idx` UNIQUE(`projectId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`status` enum('active','archived','completed') NOT NULL DEFAULT 'active',
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sheet_comparisons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`firstSheetId` int NOT NULL,
	`secondSheetId` int NOT NULL,
	`comparisonData` longtext,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sheet_comparisons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sheet_imports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileType` enum('csv','excel') NOT NULL,
	`section` enum('assets','liabilities','equity','transactions','general'),
	`rowCount` int NOT NULL,
	`fieldMapping` json NOT NULL,
	`importedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sheet_imports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`type` enum('cash_in','cash_out','transfer','adjustment') NOT NULL,
	`date` timestamp NOT NULL,
	`description` varchar(500),
	`amount` decimal(15,2) NOT NULL,
	`category` varchar(255),
	`account` varchar(255),
	`reference` varchar(255),
	`notes` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workspace_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('admin','manager','agent') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workspace_members_id` PRIMARY KEY(`id`),
	CONSTRAINT `workspace_user_idx` UNIQUE(`workspaceId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `workspaces` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workspaces_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `currentWorkspaceId` int;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);--> statement-breakpoint
CREATE INDEX `project_idx` ON `activity_logs` (`projectId`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `activity_logs` (`userId`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `activity_logs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `project_idx` ON `agent_accounts` (`projectId`);--> statement-breakpoint
CREATE INDEX `account_idx` ON `agent_entries` (`accountId`);--> statement-breakpoint
CREATE INDEX `date_idx` ON `agent_entries` (`date`);--> statement-breakpoint
CREATE INDEX `balance_sheet_idx` ON `balance_sheet_items` (`balanceSheetId`);--> statement-breakpoint
CREATE INDEX `project_idx` ON `balance_sheets` (`projectId`);--> statement-breakpoint
CREATE INDEX `project_idx` ON `comments` (`projectId`);--> statement-breakpoint
CREATE INDEX `entity_idx` ON `comments` (`entityType`,`entityId`);--> statement-breakpoint
CREATE INDEX `table_idx` ON `computing_table_columns` (`tableId`);--> statement-breakpoint
CREATE INDEX `table_idx` ON `computing_table_rows` (`tableId`);--> statement-breakpoint
CREATE INDEX `project_idx` ON `computing_tables` (`projectId`);--> statement-breakpoint
CREATE INDEX `member_idx` ON `module_permissions` (`workspaceMemberId`);--> statement-breakpoint
CREATE INDEX `owner_idx` ON `organizations` (`ownerId`);--> statement-breakpoint
CREATE INDEX `project_idx` ON `project_members` (`projectId`);--> statement-breakpoint
CREATE INDEX `workspace_idx` ON `projects` (`workspaceId`);--> statement-breakpoint
CREATE INDEX `project_idx` ON `sheet_comparisons` (`projectId`);--> statement-breakpoint
CREATE INDEX `project_idx` ON `sheet_imports` (`projectId`);--> statement-breakpoint
CREATE INDEX `project_idx` ON `transactions` (`projectId`);--> statement-breakpoint
CREATE INDEX `date_idx` ON `transactions` (`date`);--> statement-breakpoint
CREATE INDEX `type_idx` ON `transactions` (`type`);--> statement-breakpoint
CREATE INDEX `workspace_idx` ON `workspace_members` (`workspaceId`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `workspace_members` (`userId`);--> statement-breakpoint
CREATE INDEX `org_idx` ON `workspaces` (`organizationId`);