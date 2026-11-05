"use client";

import { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Download,
  RefreshCw,
  AlertTriangle,
  Lock,
  Loader2,
  Search,
} from "lucide-react";
import {
  verifyAuditChainAction,
  exportActivityCsvAction,
  type ActivityItem,
} from "@/src/server/activity/actions";
import type { VerificationResult } from "@/src/server/security/audit";

interface ActivityViewProps {
  initialItems: ActivityItem[];
  ownerEmail?: string;
}

export function ActivityView({ initialItems }: ActivityViewProps) {
  const [items] = useState<ActivityItem[]>(initialItems);
  const [filterSource, setFilterSource] = useState<"all" | "audit" | "security">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  // Verification state
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<VerificationResult | null>(null);

  // CSV export state
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // Filter items
  const filtered = items.filter((item) => {
    if (filterSource !== "all" && item.source !== filterSource) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchAction = item.action.toLowerCase().includes(q);
      const matchSummary = item.summary.toLowerCase().includes(q);
      const matchIp = item.ip?.toLowerCase().includes(q);
      const matchActor = item.actor.toLowerCase().includes(q);
      if (!matchAction && !matchSummary && !matchIp && !matchActor) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleVerify = async () => {
    setIsVerifying(true);
    setVerifyResult(null);
    try {
      const res = await verifyAuditChainAction();
      setVerifyResult(res);
    } catch (err) {
      setVerifyResult({
        verified: false,
        totalRows: 0,
        error: err instanceof Error ? err.message : "Verification failed",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleExportCsv = async () => {
    setIsExporting(true);
    setExportError(null);
    try {
      const res = await exportActivityCsvAction();
      if (res.error) {
        setExportError(res.error);
        return;
      }
      if (res.csv) {
        const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", res.filename || "guruom_activity.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Export failed.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="bg-white border border-line rounded-3xl p-6 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal/10 text-teal border border-teal/20 text-[11px] font-bold mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>Cryptographic Tamper-Evident Ledger</span>
          </div>
          <h2 className="font-display font-bold text-ink text-2xl">
            Audit Log & Security Activity
          </h2>
          <p className="text-xs text-ink-muted mt-1">
            Every administrative mutation, authentication event, and security alert is chained with SHA-256 hashes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-ink text-white hover:bg-ink-muted text-xs font-semibold transition-all shadow-sm disabled:opacity-50"
          >
            {isVerifying ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            <span>Verify Integrity</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-line bg-white hover:bg-surface text-xs font-semibold text-ink transition-colors shadow-sm disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5 text-teal" />
            )}
            <span>Export 90 Days (CSV)</span>
          </button>
        </div>
      </div>

      {/* Verification Result Banner */}
      {verifyResult && (
        <div
          className={`p-4 rounded-2xl border flex items-start gap-3 ${
            verifyResult.verified
              ? "bg-teal/5 border-teal/30 text-ink"
              : "bg-red-50 border-red-200 text-red-900"
          }`}
        >
          {verifyResult.verified ? (
            <ShieldCheck className="w-5 h-5 text-teal shrink-0 mt-0.5" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          )}
          <div className="text-xs space-y-1">
            <p className="font-bold">
              {verifyResult.verified
                ? "Cryptographic Hash Chain Verified (PASS)"
                : "Chain Integrity Failure Detected (FAIL)"}
            </p>
            <p className="text-ink-muted">
              {verifyResult.verified
                ? `Verified ${verifyResult.totalRows} sequential audit blocks from genesis. No tampering, reordering, or row deletions detected.`
                : verifyResult.error || "A broken row link was detected in the audit log."}
            </p>
          </div>
        </div>
      )}

      {/* Export Error Banner */}
      {exportError && (
        <div className="p-4 rounded-2xl border bg-red-50 border-red-200 text-red-900 flex items-center gap-3 text-xs">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{exportError} (Note: Fresh 2FA session under 10 minutes is required).</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-line rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setFilterSource("all");
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterSource === "all"
                ? "bg-ink text-white"
                : "bg-surface hover:bg-line/60 text-ink-muted"
            }`}
          >
            All ({items.length})
          </button>
          <button
            onClick={() => {
              setFilterSource("audit");
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterSource === "audit"
                ? "bg-ink text-white"
                : "bg-surface hover:bg-line/60 text-ink-muted"
            }`}
          >
            Audit Chain ({items.filter((i) => i.source === "audit").length})
          </button>
          <button
            onClick={() => {
              setFilterSource("security");
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterSource === "security"
                ? "bg-ink text-white"
                : "bg-surface hover:bg-line/60 text-ink-muted"
            }`}
          >
            Security Events ({items.filter((i) => i.source === "security").length})
          </button>
        </div>

        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-3.5 h-3.5 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action, IP, summary..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-line bg-surface text-xs text-ink focus:outline-none focus:border-brand"
          />
        </div>
      </div>

      {/* Activity Table */}
      <div className="bg-white border border-line rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface/70 border-b border-line text-ink-muted font-semibold">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Action / Event</th>
                <th className="px-4 py-3">Summary</th>
                <th className="px-4 py-3">Actor / IP</th>
                <th className="px-4 py-3">Hash (Tip)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {pagedItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-ink-muted">
                    No activity logs recorded yet.
                  </td>
                </tr>
              ) : (
                pagedItems.map((item) => (
                  <tr key={`${item.source}-${item.id}`} className="hover:bg-surface/40 transition-colors">
                    <td className="px-4 py-3 font-mono text-[11px] text-ink-muted whitespace-nowrap">
                      {new Date(item.timestamp).toLocaleString("en-IN", {
                        dateStyle: "short",
                        timeStyle: "medium",
                      })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.source === "audit"
                            ? "bg-brand/10 text-brand border border-brand/20"
                            : "bg-gold/10 text-gold-dark border border-gold/20"
                        }`}
                      >
                        {item.source === "audit" ? "AUDIT_CHAIN" : "SEC_EVENT"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-ink whitespace-nowrap">
                      {item.action}
                    </td>
                    <td className="px-4 py-3 text-ink max-w-sm truncate" title={item.summary}>
                      {item.summary}
                    </td>
                    <td className="px-4 py-3 text-ink-muted whitespace-nowrap text-[11px]">
                      <div>{item.actor}</div>
                      <div className="font-mono text-[10px]">{item.ip || "—"}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[10px] text-ink-muted whitespace-nowrap">
                      {item.hash ? `${item.hash.substring(0, 10)}...` : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-line flex items-center justify-between text-xs text-ink-muted">
            <span>
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} entries
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded-lg border border-line bg-white hover:bg-surface disabled:opacity-40"
              >
                Previous
              </button>
              <span className="font-bold text-ink">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 rounded-lg border border-line bg-white hover:bg-surface disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
