CREATE TABLE `analytics_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`projectId` int,
	`metricType` varchar(100) NOT NULL,
	`value` decimal(15,2) NOT NULL,
	`period` varchar(50) NOT NULL,
	`periodDate` date NOT NULL,
	`metadata` json,
	`calculatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analytics_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `forecasts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`projectId` int,
	`forecastType` varchar(100) NOT NULL,
	`forecastPeriod` varchar(50) NOT NULL,
	`forecastData` json NOT NULL,
	`confidence` decimal(5,2) NOT NULL,
	`baselineMetric` varchar(100),
	`algorithm` varchar(100) NOT NULL,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `forecasts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `variance_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`projectId` int,
	`budgetId` int,
	`reportPeriod` varchar(50) NOT NULL,
	`periodDate` date NOT NULL,
	`budgetAmount` decimal(15,2) NOT NULL,
	`actualAmount` decimal(15,2) NOT NULL,
	`variance` decimal(15,2) NOT NULL,
	`variancePercent` decimal(8,2) NOT NULL,
	`status` enum('favorable','unfavorable','neutral') NOT NULL,
	`analysis` text,
	`recommendations` json,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `variance_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `metric_workspace_idx` ON `analytics_metrics` (`workspaceId`);--> statement-breakpoint
CREATE INDEX `metric_project_idx` ON `analytics_metrics` (`projectId`);--> statement-breakpoint
CREATE INDEX `metric_type_idx` ON `analytics_metrics` (`metricType`);--> statement-breakpoint
CREATE INDEX `metric_period_idx` ON `analytics_metrics` (`periodDate`);--> statement-breakpoint
CREATE INDEX `forecast_workspace_idx` ON `forecasts` (`workspaceId`);--> statement-breakpoint
CREATE INDEX `forecast_project_idx` ON `forecasts` (`projectId`);--> statement-breakpoint
CREATE INDEX `forecast_type_idx` ON `forecasts` (`forecastType`);--> statement-breakpoint
CREATE INDEX `variance_workspace_idx` ON `variance_reports` (`workspaceId`);--> statement-breakpoint
CREATE INDEX `variance_project_idx` ON `variance_reports` (`projectId`);--> statement-breakpoint
CREATE INDEX `variance_budget_idx` ON `variance_reports` (`budgetId`);--> statement-breakpoint
CREATE INDEX `variance_period_idx` ON `variance_reports` (`periodDate`);