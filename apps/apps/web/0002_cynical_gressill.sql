CREATE TABLE `budget_approvals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`budgetRequestId` int NOT NULL,
	`approverUserId` int NOT NULL,
	`approvalStatus` enum('pending','approved','rejected','commented') NOT NULL DEFAULT 'pending',
	`approvalComments` text,
	`approvalDate` timestamp,
	`linkedProjectId` int,
	`linkedBalanceSheetId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `budget_approvals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `budget_line_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`budgetRequestId` int NOT NULL,
	`itemName` varchar(255) NOT NULL,
	`description` text,
	`quantity` decimal(10,2) NOT NULL,
	`unitPrice` decimal(15,2) NOT NULL,
	`totalPrice` decimal(15,2) NOT NULL,
	`category` varchar(255),
	`vendor` varchar(255),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `budget_line_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `budget_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int,
	`workspaceId` int NOT NULL,
	`submittedBy` int NOT NULL,
	`approvedBy` int,
	`title` varchar(255) NOT NULL,
	`description` text,
	`status` enum('submitted','approved','rejected','in_progress','completed') NOT NULL DEFAULT 'submitted',
	`totalAmount` decimal(15,2) NOT NULL,
	`approvalComments` text,
	`rejectionReason` text,
	`balanceSheetSection` enum('assets','liabilities','equity','expense','revenue'),
	`category` varchar(255),
	`priority` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`dueDate` timestamp,
	`attachments` json,
	`customFields` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `budget_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `procurement_audit` (
	`id` int AUTO_INCREMENT NOT NULL,
	`budgetRequestId` int NOT NULL,
	`userId` int NOT NULL,
	`action` varchar(255) NOT NULL,
	`details` json,
	`previousStatus` varchar(100),
	`newStatus` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `procurement_audit_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `approval_budget_idx` ON `budget_approvals` (`budgetRequestId`);--> statement-breakpoint
CREATE INDEX `approval_approver_idx` ON `budget_approvals` (`approverUserId`);--> statement-breakpoint
CREATE INDEX `line_item_budget_idx` ON `budget_line_items` (`budgetRequestId`);--> statement-breakpoint
CREATE INDEX `budget_workspace_idx` ON `budget_requests` (`workspaceId`);--> statement-breakpoint
CREATE INDEX `budget_project_idx` ON `budget_requests` (`projectId`);--> statement-breakpoint
CREATE INDEX `budget_submitted_by_idx` ON `budget_requests` (`submittedBy`);--> statement-breakpoint
CREATE INDEX `budget_status_idx` ON `budget_requests` (`status`);--> statement-breakpoint
CREATE INDEX `audit_budget_idx` ON `procurement_audit` (`budgetRequestId`);--> statement-breakpoint
CREATE INDEX `audit_user_idx` ON `procurement_audit` (`userId`);--> statement-breakpoint
CREATE INDEX `audit_created_at_idx` ON `procurement_audit` (`createdAt`);