import { getDb } from "@/src/db/client";
import { securityEvents, accountLockouts } from "@/src/db/schema";
import { eq, lt } from "drizzle-orm";
import crypto from "node:crypto";
import {
  MAX_CONSECUTIVE_AUTH_FAILURES,
  INITIAL_LOCKOUT_DURATION_SECONDS,
  MAX_LOCKOUT_DURATION_SECONDS,
  SECURITY_EVENT_RETENTION_DAYS,
} from "./policy";

export type SecurityEventType =
  | "owner_created"
  | "login_success"
  | "login_failure_bad_password"
  | "login_failure_unknown_user"
  | "login_failure_locked_out"
  | "two_factor_success"
  | "two_factor_failure"
  | "backup_code_used"
  | "password_changed"
  | "backup_codes_regenerated"
  | "session_revoked"
  | "all_other_sessions_revoked"
  | "account_locked"
  | "account_unlocked"
  | "rate_limit_exceeded";

export interface RecordEventParams {
  type: SecurityEventType;
  userId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown> | null;
}

import { audit } from "@/src/server/security/audit";

export async function recordSecurityEvent(params: RecordEventParams): Promise<void> {
  const db = getDb();
  if (!db) return;

  try {
    await db.insert(securityEvents).values({
      type: params.type,
      userId: params.userId || null,
      ip: params.ip || null,
      userAgent: params.userAgent || null,
      metadata: params.metadata || null,
    });

    // Mirror security events into the tamper-evident audit log
    await audit({
      actorUserId: params.userId || undefined,
      action: `security:${params.type}`,
      entityType: "security_event",
      entityId: params.userId || undefined,
      summary: `Security event: ${params.type}`,
      diff: params.metadata || undefined,
      ip: params.ip || undefined,
      userAgent: params.userAgent || undefined,
    });
  } catch (error) {
    // Audit logging failure should not crash the request, but log to stderr
    console.error(
      "[SECURITY_AUDIT_ERROR] Failed to record security event:",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

/**
 * Checks if a specific user account is currently locked out.
 */
export async function checkAccountLockout(userId: string): Promise<{
  isLocked: boolean;
  lockedUntil?: Date;
  remainingSeconds?: number;
  failedCount: number;
}> {
  const db = getDb();
  if (!db) return { isLocked: false, failedCount: 0 };

  const rows = await db
    .select()
    .from(accountLockouts)
    .where(eq(accountLockouts.userId, userId))
    .limit(1);

  if (rows.length === 0) {
    return { isLocked: false, failedCount: 0 };
  }

  const row = rows[0];
  const now = new Date();

  if (row.lockedUntil && row.lockedUntil > now) {
    const remainingMs = row.lockedUntil.getTime() - now.getTime();
    return {
      isLocked: true,
      lockedUntil: row.lockedUntil,
      remainingSeconds: Math.ceil(remainingMs / 1000),
      failedCount: row.failedCount,
    };
  }

  return { isLocked: false, failedCount: row.failedCount };
}

/**
 * Records an authentication failure for a user, incrementing failedCount and
 * applying exponential lockout if the threshold is met.
 */
export async function recordAuthFailure(
  userId: string,
  ip?: string,
  userAgent?: string
): Promise<{ isNowLocked: boolean; lockedUntil?: Date }> {
  const db = getDb();
  if (!db) return { isNowLocked: false };

  const rows = await db
    .select()
    .from(accountLockouts)
    .where(eq(accountLockouts.userId, userId))
    .limit(1);

  const now = new Date();
  let failedCount = 1;
  let previousLockoutCount = 0;

  if (rows.length > 0) {
    failedCount = rows[0].failedCount + 1;
    // Calculate how many times it was already locked out to determine exponential backoff
    previousLockoutCount = Math.floor(rows[0].failedCount / MAX_CONSECUTIVE_AUTH_FAILURES);
  }

  let lockedUntil: Date | null = null;
  let isNowLocked = false;

  if (failedCount >= MAX_CONSECUTIVE_AUTH_FAILURES) {
    // Exponential backoff: 15m, 30m, 60m, up to 24h
    const multiplier = Math.pow(2, previousLockoutCount);
    const durationSeconds = Math.min(
      INITIAL_LOCKOUT_DURATION_SECONDS * multiplier,
      MAX_LOCKOUT_DURATION_SECONDS
    );
    lockedUntil = new Date(now.getTime() + durationSeconds * 1000);
    isNowLocked = true;
  }

  if (rows.length === 0) {
    await db.insert(accountLockouts).values({
      userId,
      failedCount,
      lockedUntil,
      updatedAt: now,
    });
  } else {
    await db
      .update(accountLockouts)
      .set({
        failedCount,
        lockedUntil,
        updatedAt: now,
      })
      .where(eq(accountLockouts.userId, userId));
  }

  if (isNowLocked && lockedUntil) {
    await recordSecurityEvent({
      type: "account_locked",
      userId,
      ip,
      userAgent,
      metadata: {
        failedCount,
        lockedUntil: lockedUntil.toISOString(),
      },
    });
  }

  return { isNowLocked, lockedUntil: lockedUntil || undefined };
}

/**
 * Resets account lockout counters upon successful authentication.
 */
export async function resetAccountLockout(userId: string): Promise<void> {
  const db = getDb();
  if (!db) return;

  await db
    .update(accountLockouts)
    .set({
      failedCount: 0,
      lockedUntil: null,
      updatedAt: new Date(),
    })
    .where(eq(accountLockouts.userId, userId));
}

/**
 * Dummy password check to prevent timing attacks / user enumeration.
 * When a user does not exist, performs a constant-time scrypt calculation
 * matching real password verification latency.
 */
export async function runDummyPasswordCheck(dummyPasswordInput: string): Promise<void> {
  const dummySalt = "guruom_dummy_timing_salt_2026";
  await new Promise<void>((resolve) => {
    crypto.scrypt(dummyPasswordInput, dummySalt, 64, () => {
      resolve();
    });
  });
}

/**
 * Prunes security event logs older than the retention policy (180 days).
 */
export async function pruneExpiredSecurityEvents(): Promise<number> {
  const db = getDb();
  if (!db) return 0;

  const cutoff = new Date(
    Date.now() - SECURITY_EVENT_RETENTION_DAYS * 24 * 60 * 60 * 1000
  );

  const deleted = await db
    .delete(securityEvents)
    .where(lt(securityEvents.createdAt, cutoff));

  return (deleted as { rowCount?: number })?.rowCount ?? 0;
}
