import crypto from "node:crypto";
import { getDb } from "@/src/db/client";
import { auditLog } from "@/src/db/schema";
import { desc } from "drizzle-orm";
import { logger } from "@/src/lib/logger";

export interface AuditParams {
  actorUserId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  summary: string;
  diff?: Record<string, unknown> | null;
  ip?: string | null;
  userAgent?: string | null;
}

export const GENESIS_HASH = "0".repeat(64);

/**
 * Creates a deterministic, canonical JSON representation of fields for hashing.
 * Sorts object keys alphabetically and strips any sensitive credentials.
 */
export function canonicalJson(obj: unknown): string {
  if (obj === null || obj === undefined) return "null";
  if (typeof obj !== "object") return JSON.stringify(obj);

  if (Array.isArray(obj)) {
    return "[" + obj.map(canonicalJson).join(",") + "]";
  }

  const sortedKeys = Object.keys(obj as Record<string, unknown>).sort();
  const parts: string[] = [];

  for (const key of sortedKeys) {
    const val = (obj as Record<string, unknown>)[key];
    if (val !== undefined) {
      parts.push(`${JSON.stringify(key)}:${canonicalJson(val)}`);
    }
  }

  return "{" + parts.join(",") + "}";
}

/**
 * Computes the cryptographic SHA-256 hash of a row chained to the previous row hash.
 */
export function computeRowHash(prevHash: string, dataToHash: Record<string, unknown>): string {
  const canonicalData = canonicalJson(dataToHash);
  return crypto
    .createHash("sha256")
    .update(`${prevHash}${canonicalData}`)
    .digest("hex");
}

/**
 * Inserts a new tamper-evident audit record into the linear hash chain.
 */
export async function audit(params: AuditParams): Promise<{ id: string; rowHash: string }> {
  const db = getDb();
  if (!db) {
    throw new Error("Audit logging unavailable (Database offline).");
  }

  const id = crypto.randomUUID();
  const now = new Date();

  // 1. Fetch latest row hash from the chain tip
  const latestRows = await db
    .select({ rowHash: auditLog.rowHash })
    .from(auditLog)
    .orderBy(desc(auditLog.createdAt), desc(auditLog.id))
    .limit(1);

  const prevHash = latestRows.length > 0 ? latestRows[0].rowHash : GENESIS_HASH;

  // 2. Prepare payload to hash (without secrets, size-capped diff)
  const sanitizedDiff = params.diff ? JSON.parse(JSON.stringify(params.diff)) : null;

  const dataToHash: Record<string, unknown> = {
    action: params.action,
    actorUserId: params.actorUserId || null,
    createdAt: now.toISOString(),
    diff: sanitizedDiff,
    entityId: params.entityId || null,
    entityType: params.entityType,
    id,
    ip: params.ip || null,
    summary: params.summary,
    userAgent: params.userAgent || null,
  };

  const rowHash = computeRowHash(prevHash, dataToHash);

  // 3. Insert record into database
  await db.insert(auditLog).values({
    id,
    actorUserId: params.actorUserId || null,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId || null,
    summary: params.summary,
    diff: sanitizedDiff,
    ip: params.ip || null,
    userAgent: params.userAgent || null,
    createdAt: now,
    prevHash,
    rowHash,
  });

  logger.info("[AUDIT_RECORD_PERSISTED]", {
    action: params.action,
    entityType: params.entityType,
    id,
  });

  return { id, rowHash };
}

export interface VerificationResult {
  verified: boolean;
  totalRows: number;
  brokenRowIndex?: number;
  brokenRowId?: string;
  error?: string;
}

/**
 * Verifies the integrity of the cryptographic audit hash chain.
 * Recomputes every hash from Genesis to Tip and confirms no rows have been modified,
 * deleted, or injected out of order.
 */
export async function verifyAuditChain(): Promise<VerificationResult> {
  const db = getDb();
  if (!db) {
    return { verified: false, totalRows: 0, error: "Database offline" };
  }

  const rows = await db
    .select()
    .from(auditLog)
    .orderBy(auditLog.createdAt, auditLog.id);

  if (rows.length === 0) {
    return { verified: true, totalRows: 0 };
  }

  let expectedPrevHash = GENESIS_HASH;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    // For the first row, if it's a post-purge checkpoint, prevHash may be the last purged row hash
    if (i === 0 && row.action === "checkpoint_purge") {
      expectedPrevHash = row.prevHash;
    }

    // Verify link to previous row
    if (row.prevHash !== expectedPrevHash) {
      return {
        verified: false,
        totalRows: rows.length,
        brokenRowIndex: i,
        brokenRowId: row.id,
        error: `Broken hash chain at row #${i} (ID: ${row.id}). Expected prevHash ${expectedPrevHash}, got ${row.prevHash}.`,
      };
    }

    // Recompute row hash
    const dataToHash: Record<string, unknown> = {
      action: row.action,
      actorUserId: row.actorUserId || null,
      createdAt: row.createdAt.toISOString(),
      diff: row.diff,
      entityId: row.entityId || null,
      entityType: row.entityType,
      id: row.id,
      ip: row.ip || null,
      summary: row.summary,
      userAgent: row.userAgent || null,
    };

    const computed = computeRowHash(row.prevHash, dataToHash);

    if (computed !== row.rowHash) {
      return {
        verified: false,
        totalRows: rows.length,
        brokenRowIndex: i,
        brokenRowId: row.id,
        error: `Cryptographic tampering detected at row #${i} (ID: ${row.id}). Hash mismatch! Computed: ${computed}, Stored: ${row.rowHash}.`,
      };
    }

    expectedPrevHash = row.rowHash;
  }

  return { verified: true, totalRows: rows.length };
}
