import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

/**
 * Rate Limiter using Token Bucket algorithm
 * Tracks requests per time window and enforces limits
 */
export class RateLimiter {
  private buckets: Map<string, { tokens: number; resetAt: number }> = new Map();

  /**
   * Check if a request should be allowed
   * @param key - Unique identifier (API key, IP, etc.)
   * @param limit - Max requests allowed
   * @param windowSeconds - Time window in seconds
   * @returns { allowed: boolean, remaining: number, resetAt: number }
   */
  checkLimit(key: string, limit: number, windowSeconds: number) {
    const now = Date.now();
    let bucket = this.buckets.get(key);

    // Initialize or reset bucket if window expired
    if (!bucket || bucket.resetAt < now) {
      bucket = {
        tokens: limit,
        resetAt: now + windowSeconds * 1000,
      };
      this.buckets.set(key, bucket);
    }

    // Check if token available
    const allowed = bucket.tokens > 0;
    if (allowed) {
      bucket.tokens--;
    }

    const remaining = Math.max(0, bucket.tokens);
    const resetAt = bucket.resetAt;

    return {
      allowed,
      remaining,
      resetAt,
      retryAfter: allowed ? 0 : Math.ceil((resetAt - now) / 1000),
    };
  }

  /**
   * Reset bucket for a key
   */
  reset(key: string) {
    this.buckets.delete(key);
  }

  /**
   * Clean up expired buckets
   */
  cleanup() {
    const now = Date.now();
    const keysToDelete: string[] = [];
    this.buckets.forEach((bucket, key) => {
      if (bucket.resetAt < now) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.buckets.delete(key));
  }
}

// Global rate limiter instance
export const globalRateLimiter = new RateLimiter();

/**
 * Express middleware for rate limiting
 */
export function rateLimitMiddleware(
  defaultLimit: number = 1000,
  windowSeconds: number = 3600
) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Get identifier (API key from header or IP address)
    const identifier =
      req.headers["x-api-key"] ||
      req.headers["authorization"]?.replace("Bearer ", "") ||
      req.ip ||
      "unknown";

    const key = `rate-limit:${identifier}`;
    const result = globalRateLimiter.checkLimit(key, defaultLimit, windowSeconds);

    // Set rate limit headers
    res.setHeader("X-RateLimit-Limit", defaultLimit);
    res.setHeader("X-RateLimit-Remaining", result.remaining);
    res.setHeader(
      "X-RateLimit-Reset",
      Math.ceil(result.resetAt / 1000)
    );

    if (!result.allowed) {
      res.setHeader("Retry-After", result.retryAfter);
      return res.status(429).json({
        error: "Too Many Requests",
        message: `Rate limit exceeded. Retry after ${result.retryAfter} seconds.`,
        retryAfter: result.retryAfter,
      });
    }

    next();
  };
}

/**
 * Generate API key hash for storage
 */
export function hashApiKey(apiKey: string): string {
  return crypto.createHash("sha256").update(apiKey).digest("hex");
}

/**
 * Generate a random API key
 */
export function generateApiKey(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Verify webhook signature using HMAC-SHA256
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Generate webhook signature for payload
 */
export function generateWebhookSignature(
  payload: string,
  secret: string
): string {
  return crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
}

/**
 * Webhook delivery retry logic with exponential backoff
 */
export function calculateNextRetryTime(
  attemptNumber: number,
  baseDelaySeconds: number = 60,
  backoffMultiplier: number = 2
): Date {
  const delaySeconds = baseDelaySeconds * Math.pow(backoffMultiplier, attemptNumber);
  // Cap at 24 hours
  const cappedDelaySeconds = Math.min(delaySeconds, 86400);
  return new Date(Date.now() + cappedDelaySeconds * 1000);
}

/**
 * Webhook event types
 */
export enum WebhookEventType {
  TRANSACTION_CREATED = "transaction.created",
  TRANSACTION_UPDATED = "transaction.updated",
  TRANSACTION_DELETED = "transaction.deleted",
  BUDGET_SUBMITTED = "budget.submitted",
  BUDGET_APPROVED = "budget.approved",
  BUDGET_REJECTED = "budget.rejected",
  PROJECT_CREATED = "project.created",
  PROJECT_UPDATED = "project.updated",
  PROJECT_DELETED = "project.deleted",
  BALANCE_SHEET_CREATED = "balance_sheet.created",
  BALANCE_SHEET_UPDATED = "balance_sheet.updated",
  COMPUTING_TABLE_CREATED = "computing_table.created",
  COMPUTING_TABLE_UPDATED = "computing_table.updated",
}

/**
 * Webhook payload structure
 */
export interface WebhookPayload {
  event: WebhookEventType;
  timestamp: number;
  data: Record<string, unknown>;
  workspaceId: number;
  userId?: number;
}
