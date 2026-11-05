import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { Suspense } from "react";
import { getEnv } from "@/src/lib/env";
import { requireOwner } from "@/src/server/auth/guard";
import { auth } from "@/src/server/auth/auth";
import { getDb } from "@/src/db/client";
import { securityEvents } from "@/src/db/schema";
import { desc, type InferSelectModel } from "drizzle-orm";
import type { Session } from "better-auth";
import { SecurityView } from "./security-view";
import { OwnerHeader } from "../owner-header";
import { Loader2 } from "lucide-react";

type SecurityEventRecord = InferSelectModel<typeof securityEvents>;

export const metadata = {
  title: "Security & Sessions",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

async function SecurityContent() {
  // Guard: requires fresh owner session (authenticated within last 10 minutes)
  const { session: currentSession } = await requireOwner({ fresh: true });
  const reqHeaders = await headers();

  // 1. Fetch active sessions for current user
  let activeSessions: Session[] = [];
  try {
    const listRes = await auth.api.listSessions({
      headers: reqHeaders,
    });
    if (Array.isArray(listRes)) {
      activeSessions = listRes;
    }
  } catch (err) {
    console.error("[LIST_SESSIONS_ERROR]", err);
  }

  // 2. Fetch last 25 audit trail events from database
  let auditEvents: SecurityEventRecord[] = [];
  const db = getDb();
  if (db) {
    auditEvents = await db
      .select()
      .from(securityEvents)
      .orderBy(desc(securityEvents.createdAt))
      .limit(25);
  }

  return (
    <SecurityView
      currentToken={currentSession.token}
      initialSessions={activeSessions}
      events={auditEvents}
    />
  );
}

function SecurityFallback() {
  return (
    <div className="flex items-center justify-center py-20 text-ink-muted text-xs gap-2">
      <Loader2 className="w-4 h-4 animate-spin text-brand" />
      <span>Loading security profile &amp; active sessions...</span>
    </div>
  );
}

export default function SecurityPage() {
  const env = getEnv();
  if (env.OWNER_AREA_ENABLED !== "true") {
    notFound();
  }

  return (
    <div className="flex-1 flex flex-col min-h-full bg-surface">
      <OwnerHeader />

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 sm:p-8">
        <Suspense fallback={<SecurityFallback />}>
          <SecurityContent />
        </Suspense>
      </main>
    </div>
  );
}
