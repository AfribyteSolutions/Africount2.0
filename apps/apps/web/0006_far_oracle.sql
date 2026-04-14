CREATE TABLE `chart_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`chartId` varchar(255) NOT NULL,
	`workspaceId` int NOT NULL,
	`userId` int NOT NULL,
	`content` text NOT NULL,
	`parentCommentId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deletedAt` timestamp,
	CONSTRAINT `chart_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `comment_mentions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`commentId` int NOT NULL,
	`mentionedUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `comment_mentions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `comment_reactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`commentId` int NOT NULL,
	`userId` int NOT NULL,
	`reactionType` varchar(50) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `comment_reactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `comment_chart_idx` ON `chart_comments` (`chartId`);--> statement-breakpoint
CREATE INDEX `comment_workspace_idx` ON `chart_comments` (`workspaceId`);--> statement-breakpoint
CREATE INDEX `comment_user_idx` ON `chart_comments` (`userId`);--> statement-breakpoint
CREATE INDEX `comment_parent_idx` ON `chart_comments` (`parentCommentId`);--> statement-breakpoint
CREATE INDEX `mention_comment_idx` ON `comment_mentions` (`commentId`);--> statement-breakpoint
CREATE INDEX `mention_user_idx` ON `comment_mentions` (`mentionedUserId`);--> statement-breakpoint
CREATE INDEX `reaction_comment_idx` ON `comment_reactions` (`commentId`);--> statement-breakpoint
CREATE INDEX `reaction_user_idx` ON `comment_reactions` (`userId`);--> statement-breakpoint
CREATE INDEX `reaction_unique_idx` ON `comment_reactions` (`commentId`,`userId`,`reactionType`);