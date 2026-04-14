CREATE TABLE `budget_import_line_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`budgetImportId` int NOT NULL,
	`rowNumber` int NOT NULL,
	`itemName` varchar(255) NOT NULL,
	`quantity` decimal(10,2) NOT NULL,
	`unitPrice` decimal(15,2) NOT NULL,
	`totalPrice` decimal(15,2) NOT NULL,
	`category` varchar(255),
	`vendor` varchar(255),
	`notes` text,
	`linkedProductId` int,
	`importStatus` enum('pending','imported','skipped','error') NOT NULL DEFAULT 'pending',
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `budget_import_line_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `budget_imports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`importedBy` int NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileType` enum('csv','excel') NOT NULL,
	`totalRows` int NOT NULL,
	`successfulRows` int DEFAULT 0,
	`failedRows` int DEFAULT 0,
	`fieldMapping` json,
	`importStatus` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`errorLog` json,
	`linkedBudgetRequestId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `budget_imports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_attachments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileUrl` text NOT NULL,
	`fileType` varchar(50),
	`fileSize` int,
	`attachmentType` enum('image','document','specification','other') NOT NULL DEFAULT 'document',
	`order` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `product_attachments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`icon` varchar(100),
	`color` varchar(50),
	`order` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_pricing_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`price` decimal(15,2) NOT NULL,
	`currency` varchar(3) DEFAULT 'USD',
	`vendor` varchar(255),
	`effectiveDate` timestamp NOT NULL,
	`expiryDate` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `product_pricing_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`categoryId` int,
	`name` varchar(255) NOT NULL,
	`description` text,
	`sku` varchar(100),
	`type` enum('product','service') NOT NULL DEFAULT 'product',
	`unitOfMeasure` varchar(50) DEFAULT 'unit',
	`basePrice` decimal(15,2) NOT NULL,
	`currency` varchar(3) DEFAULT 'USD',
	`vendor` varchar(255),
	`vendorSku` varchar(100),
	`specifications` json,
	`tags` json,
	`isActive` boolean DEFAULT true,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_services_id` PRIMARY KEY(`id`),
	CONSTRAINT `product_services_sku_unique` UNIQUE(`sku`),
	CONSTRAINT `product_sku_idx` UNIQUE(`sku`)
);
--> statement-breakpoint
CREATE INDEX `import_line_budget_import_idx` ON `budget_import_line_items` (`budgetImportId`);--> statement-breakpoint
CREATE INDEX `import_line_status_idx` ON `budget_import_line_items` (`importStatus`);--> statement-breakpoint
CREATE INDEX `import_workspace_idx` ON `budget_imports` (`workspaceId`);--> statement-breakpoint
CREATE INDEX `import_imported_by_idx` ON `budget_imports` (`importedBy`);--> statement-breakpoint
CREATE INDEX `import_status_idx` ON `budget_imports` (`importStatus`);--> statement-breakpoint
CREATE INDEX `attachment_product_idx` ON `product_attachments` (`productId`);--> statement-breakpoint
CREATE INDEX `category_workspace_idx` ON `product_categories` (`workspaceId`);--> statement-breakpoint
CREATE INDEX `pricing_product_idx` ON `product_pricing_history` (`productId`);--> statement-breakpoint
CREATE INDEX `pricing_effective_date_idx` ON `product_pricing_history` (`effectiveDate`);--> statement-breakpoint
CREATE INDEX `product_workspace_idx` ON `product_services` (`workspaceId`);--> statement-breakpoint
CREATE INDEX `product_category_idx` ON `product_services` (`categoryId`);--> statement-breakpoint
CREATE INDEX `product_active_idx` ON `product_services` (`isActive`);