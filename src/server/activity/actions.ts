"use server";

import { requireOwner } from "@/src/server/auth/guard";
import { getDb } from "@/src/db/client";
import { auditLog, securityEvents } from "@/src/db/schema";
import { gte, desc } from "drizzle-orm";
import { verifyAuditChain, audit, VerificationResult } from "@/src/server/security/audit";
import { headers } from "next/headers";
import { getClientIp } from "@/src/server/auth/ip";

export async function verifyAuditChainAction(): Promise<VerificationResult> {
  // Ensure caller is authenticated owner
  await requireOwner();
  return await verifyAuditChain();
}

export interface ActivityItem {
  id: string;
  source: "audit" | "security";
  timestamp: string;
  action: string;
  actor: string;
  ip: string | null;
  userAgent: string | null;
  summary: string;
  diffOrMeta: unknown;
  hash?: string;
}

/**
 * Exports activity records from the last 90 days as CSV.
 * Strict security requirement: Requires fresh session (authenticated within last 10 minutes)
 * and writes a tamper-evident audit record.
 */
export async function exportActivityCsvAction(): Promise<{
  error?: string;
  csv?: string;
  filename?: string;
}> {
  try {
    const { user: owner } = await requireOwner({ fresh: true });
    const db = getDb();
    if (!db) {
      return { error: "Database offline. Unable to export logs." };
    }

    const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    const [auditRows, securityRows] = await Promise.all([
      db
        .select()
        .from(auditLog)
        .where(gte(auditLog.createdAt, cutoff))
        .orderBy(desc(auditLog.createdAt)),
      db
        .select()
        .from(securityEvents)
        .where(gte(securityEvents.createdAt, cutoff))
        .orderBy(desc(securityEvents.createdAt)),
    ]);

    // Format as CSV
    const rows: string[][] = [
      [
        "Timestamp (ISO)",
        "Source",
        "Record ID",
        "Actor / User ID",
        "Action / Type",
        "Entity",
        "IP Address",
        "User Agent",
        "Summary",
        "Row Hash",
      ],
    ];

    for (const a of auditRows) {
      rows.push([
        a.createdAt.toISOString(),
        "audit_log",
        a.id,
        a.actorUserId || "system",
        a.action,
        `${a.entityType}:${a.entityId || "-"}`,
        a.ip || "-",
        (a.userAgent || "-").replace(/"/g, '""'),
        (a.summary || "").replace(/"/g, '""'),
        a.rowHash,
      ]);
    }

    for (const s of securityRows) {
      rows.push([
        s.createdAt.toISOString(),
        "security_events",
        s.id,
        s.userId || "anonymous",
        s.type,
        "security_event",
        s.ip || "-",
        (s.userAgent || "-").replace(/"/g, '""'),
        `Security event: ${s.type}`,
        "-",
      ]);
    }

    // Sort combined rows by timestamp descending
    const header = rows[0];
    const dataRows = rows.slice(1);
    dataRows.sort((a, b) => (a[0] > b[0] ? -1 : 1));

    const csvContent = [header, ...dataRows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\r\n");

    const reqHeaders = await headers();
    const ip = await getClientIp();
    const userAgent = reqHeaders.get("user-agent") || undefined;

    // Record audit event for the export operation
    await audit({
      actorUserId: owner.id,
      action: "audit_export_csv",
      entityType: "audit_log",
      summary: `Exported 90-day activity logs as CSV (${dataRows.length} rows)`,
      diff: { exportedRows: dataRows.length, timeWindowDays: 90 },
      ip,
      userAgent,
    });

    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `guruom_activity_export_${dateStr}.csv`;

    return { csv: csvContent, filename };
  } catch (err: unknown) {
    return {
      error:
        err instanceof Error
          ? err.message
          : "Session not fresh or export failed.",
    };
  }
}
