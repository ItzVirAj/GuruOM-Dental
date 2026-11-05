import { Suspense } from "react";
import { requireOwner } from "@/src/server/auth/guard";
import { OwnerHeader } from "../owner-header";
import { ActivityView } from "./activity-view";
import { getDb } from "@/src/db/client";
import { auditLog, securityEvents } from "@/src/db/schema";
import { desc } from "drizzle-orm";
import type { ActivityItem } from "@/src/server/activity/actions";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Activity & Audit Log",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

async function ActivityContent() {
  const { user: owner } = await requireOwner();
  const db = getDb();

  const initialItems: ActivityItem[] = [];

  if (db) {
    const [auditRows, securityRows] = await Promise.all([
      db.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(100),
      db.select().from(securityEvents).orderBy(desc(securityEvents.createdAt)).limit(100),
    ]);

    for (const a of auditRows) {
      initialItems.push({
        id: a.id,
        source: "audit",
        timestamp: a.createdAt.toISOString(),
        action: a.action,
        actor: a.actorUserId || "System",
        ip: a.ip,
        userAgent: a.userAgent,
        summary: a.summary,
        diffOrMeta: a.diff,
        hash: a.rowHash,
      });
    }

    for (const s of securityRows) {
      initialItems.push({
        id: s.id,
        source: "security",
        timestamp: s.createdAt.toISOString(),
        action: s.type,
        actor: s.userId || "Anonymous",
        ip: s.ip,
        userAgent: s.userAgent,
        summary: `Security Event: ${s.type}`,
        diffOrMeta: s.metadata,
      });
    }

    initialItems.sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1));
  }

  return (
    <>
      <OwnerHeader ownerEmail={owner.email} />

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 sm:p-8">
        <ActivityView initialItems={initialItems} ownerEmail={owner.email} />
      </main>
    </>
  );
}

export default function ActivityPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-surface">
          <Loader2 className="w-8 h-8 text-brand animate-spin" />
        </div>
      }
    >
      <ActivityContent />
    </Suspense>
  );
}
