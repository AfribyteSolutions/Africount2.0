CREATE TABLE `api_keys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`keyHash` varchar(255) NOT NULL,
	`permissions` json NOT NULL,
	`rateLimit` int NOT NULL DEFAULT 1000,
	`active` boolean NOT NULL DEFAULT true,
	`lastUsedAt` timestamp,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `api_keys_id` PRIMARY KEY(`id`),
	CONSTRAINT `api_keys_keyHash_unique` UNIQUE(`keyHash`)
);
--> statement-breakpoint
CREATE TABLE `rate_limit_keys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(255) NOT NULL,
	`limit` int NOT NULL,
	`window` int NOT NULL,
	`count` int NOT NULL DEFAULT 0,
	`resetAt` timestamp NOT NULL,
	CONSTRAINT `rate_limit_keys_id` PRIMARY KEY(`id`),
	CONSTRAINT `rate_limit_keys_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `webhook_deliveries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`webhookEventId` int NOT NULL,
	`attemptNumber` int NOT NULL,
	`statusCode` int,
	`responseBody` text,
	`responseTime` int,
	`success` boolean NOT NULL,
	`error` text,
	`deliveredAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `webhook_deliveries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhook_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`webhookId` int NOT NULL,
	`eventType` varchar(255) NOT NULL,
	`payload` json NOT NULL,
	`status` enum('pending','delivered','failed','skipped') NOT NULL DEFAULT 'pending',
	`retryCount` int NOT NULL DEFAULT 0,
	`nextRetryAt` timestamp,
	`failureReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`deliveredAt` timestamp,
	CONSTRAINT `webhook_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhooks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`url` text NOT NULL,
	`events` json NOT NULL,
	`secret` varchar(255) NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`retryPolicy` json DEFAULT ('{"maxRetries":5,"backoffMultiplier":2}'),
	`headers` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `webhooks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `apikey_workspace_idx` ON `api_keys` (`workspaceId`);--> statement-breakpoint
CREATE INDEX `apikey_active_idx` ON `api_keys` (`active`);--> statement-breakpoint
CREATE INDEX `ratelimit_key_idx` ON `rate_limit_keys` (`key`);--> statement-breakpoint
CREATE INDEX `ratelimit_reset_idx` ON `rate_limit_keys` (`resetAt`);--> statement-breakpoint
CREATE INDEX `delivery_event_idx` ON `webhook_deliveries` (`webhookEventId`);--> statement-breakpoint
CREATE INDEX `delivery_success_idx` ON `webhook_deliveries` (`success`);--> statement-breakpoint
CREATE INDEX `event_webhook_idx` ON `webhook_events` (`webhookId`);--> statement-breakpoint
CREATE INDEX `event_status_idx` ON `webhook_events` (`status`);--> statement-breakpoint
CREATE INDEX `event_next_retry_idx` ON `webhook_events` (`nextRetryAt`);--> statement-breakpoint
CREATE INDEX `webhook_workspace_idx` ON `webhooks` (`workspaceId`);--> statement-breakpoint
CREATE INDEX `webhook_active_idx` ON `webhooks` (`active`);