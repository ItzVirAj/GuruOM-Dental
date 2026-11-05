"use client";

import { useState, useTransition } from "react";
import {
  revokeSessionAction,
  revokeAllOtherSessionsAction,
  changePasswordAction,
  regenerateBackupCodesAction,
} from "@/src/server/auth/actions";
import {
  Laptop,
  Smartphone,
  Key,
  Lock,
  RefreshCw,
  Copy,
  Check,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  History,
  Trash2,
} from "lucide-react";

interface SessionItem {
  id: string;
  token: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string | Date;
  expiresAt: string | Date;
}

interface SecurityEventItem {
  id: string;
  type: string;
  ip?: string | null;
  userAgent?: string | null;
  createdAt: string | Date;
  metadata?: unknown;
}

export function SecurityView({
  currentToken,
  initialSessions,
  events,
}: {
  currentToken: string;
  initialSessions: SessionItem[];
  events: SecurityEventItem[];
}) {
  const [sessions, setSessions] = useState<SessionItem[]>(initialSessions);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  // Backup codes regeneration state
  const [regenPassword, setRegenPassword] = useState("");
  const [regenLoading, setRegenLoading] = useState(false);
  const [newBackupCodes, setNewBackupCodes] = useState<string[] | null>(null);
  const [copiedCodes, setCopiedCodes] = useState(false);

  // Revoke individual session
  function handleRevokeSession(token: string) {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const res = await revokeSessionAction(token);
      if (res.error) {
        setError(res.error);
      } else {
        setSessions((prev) => prev.filter((s) => s.token !== token));
        setMessage("Session revoked successfully.");
      }
    });
  }

  // Revoke all other sessions
  function handleRevokeOthers() {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const res = await revokeAllOtherSessionsAction();
      if (res.error) {
        setError(res.error);
      } else {
        setSessions((prev) => prev.filter((s) => s.token === currentToken));
        setMessage("All other sessions have been terminated.");
      }
    });
  }

  // Submit Password Change
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setPwdLoading(true);

    const formData = new FormData();
    formData.append("currentPassword", currentPassword);
    formData.append("newPassword", newPassword);
    formData.append("confirmPassword", confirmPassword);

    try {
      const res = await changePasswordAction({}, formData);
      if (res.error) {
        setError(res.error);
      } else {
        setMessage(res.message || "Password changed successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setSessions((prev) => prev.filter((s) => s.token === currentToken));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to change password.");
    } finally {
      setPwdLoading(false);
    }
  }

  // Regenerate Backup Codes
  async function handleRegenerateCodes(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setRegenLoading(true);

    const formData = new FormData();
    formData.append("password", regenPassword);

    try {
      const res = await regenerateBackupCodesAction({}, formData);
      if (res.error) {
        setError(res.error);
      } else if (res.backupCodes) {
        setNewBackupCodes(res.backupCodes);
        setRegenPassword("");
        setMessage("New backup codes generated. Previous codes have been invalidated.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate backup codes.");
    } finally {
      setRegenLoading(false);
    }
  }

  function handleCopyNewCodes() {
    if (newBackupCodes) {
      navigator.clipboard.writeText(newBackupCodes.join("\n"));
      setCopiedCodes(true);
      setTimeout(() => setCopiedCodes(false), 2000);
    }
  }

  function handleDownloadNewCodes() {
    if (!newBackupCodes) return;
    const text = `GURUOM DENTAL - REGENERATED BACKUP CODES\nGenerated: ${new Date().toISOString()}\n\n${newBackupCodes.join("\n")}`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `guruom-backup-codes-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Simple password strength calculator for visual feedback
  const pwdLength = newPassword.length;
  let strengthLabel = "Too short";
  let strengthColor = "bg-red-400";
  let strengthPercent = "20%";

  if (pwdLength >= 14) {
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasNum = /[0-9]/.test(newPassword);

    if (hasSpecial && hasUpper && hasNum && pwdLength >= 16) {
      strengthLabel = "Excellent (Secure)";
      strengthColor = "bg-teal";
      strengthPercent = "100%";
    } else if ((hasSpecial || hasUpper) && hasNum) {
      strengthLabel = "Strong";
      strengthColor = "bg-brand";
      strengthPercent = "75%";
    } else {
      strengthLabel = "Moderate (min 14 chars met)";
      strengthColor = "bg-amber-400";
      strengthPercent = "50%";
    }
  }

  return (
    <div className="space-y-8">
      {/* Global feedback alerts */}
      {message && (
        <div
          role="status"
          aria-live="polite"
          className="p-4 rounded-2xl bg-teal/10 border border-teal/20 text-teal text-xs flex items-center gap-3 font-medium"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Section 1: Active Sessions */}
      <section className="bg-white border border-line rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Laptop className="w-5 h-5 text-brand" />
              <h2 className="font-display font-bold text-ink text-lg">
                Active Devices &amp; Sessions
              </h2>
            </div>
            <p className="text-xs text-ink-muted">
              Sessions expire after 60 minutes of inactivity or at the 12-hour absolute limit.
            </p>
          </div>

          {sessions.length > 1 && (
            <button
              type="button"
              disabled={isPending}
              onClick={handleRevokeOthers}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Revoke All Other Sessions</span>
            </button>
          )}
        </div>

        <div className="divide-y divide-line border border-line rounded-2xl overflow-hidden bg-surface">
          {sessions.map((s) => {
            const isCurrent = s.token === currentToken;
            const isMobile = s.userAgent?.toLowerCase().includes("mobile");

            return (
              <div
                key={s.id || s.token}
                className="p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-surface border border-line flex items-center justify-center shrink-0 text-ink">
                    {isMobile ? (
                      <Smartphone className="w-4 h-4" />
                    ) : (
                      <Laptop className="w-4 h-4" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-ink">
                        {s.userAgent
                          ? s.userAgent.slice(0, 60) + (s.userAgent.length > 60 ? "..." : "")
                          : "Unknown Browser"}
                      </span>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal/15 text-teal border border-teal/20">
                          Current Device
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-ink-muted">
                      <span>IP: {s.ipAddress || "127.0.0.1"}</span>
                      <span>•</span>
                      <span>Created {new Date(s.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {!isCurrent && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleRevokeSession(s.token)}
                    className="px-3 py-1.5 rounded-lg border border-line text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer self-end sm:self-auto"
                  >
                    Revoke
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 2: Change Password */}
      <section className="bg-white border border-line rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-brand" />
            <h2 className="font-display font-bold text-ink text-lg">
              Change Master Password
            </h2>
          </div>
          <p className="text-xs text-ink-muted">
            Changing your password terminates all other active sessions across devices automatically.
          </p>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••••••"
              className="w-full bg-surface border border-line rounded-xl px-4 py-2.5 text-sm font-mono text-ink focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider">
              New Password (min 14 chars)
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••••••"
              className="w-full bg-surface border border-line rounded-xl px-4 py-2.5 text-sm font-mono text-ink focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
            />
            {newPassword.length > 0 && (
              <div className="pt-1 space-y-1">
                <div className="h-1.5 w-full bg-line rounded-full overflow-hidden">
                  <div
                    className={`h-full ${strengthColor} transition-all duration-300`}
                    style={{ width: strengthPercent }}
                  />
                </div>
                <span className="text-[11px] text-ink-muted">
                  Strength: {strengthLabel}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••••••"
              className="w-full bg-surface border border-line rounded-xl px-4 py-2.5 text-sm font-mono text-ink focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
            />
          </div>

          <button
            type="submit"
            disabled={pwdLoading || !currentPassword || newPassword.length < 14}
            className="inline-flex items-center gap-2 bg-brand text-white font-semibold py-2.5 px-5 rounded-xl text-xs hover:bg-brand-dark transition-all disabled:opacity-50 cursor-pointer"
          >
            {pwdLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <span>Update Password</span>
            )}
          </button>
        </form>
      </section>

      {/* Section 3: Backup Codes Regeneration */}
      <section className="bg-white border border-line rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-brand" />
            <h2 className="font-display font-bold text-ink text-lg">
              Regenerate Backup Codes
            </h2>
          </div>
          <p className="text-xs text-ink-muted">
            Generating new backup codes immediately invalidates any previously generated codes.
          </p>
        </div>

        {newBackupCodes ? (
          <div className="p-5 bg-surface border border-line rounded-2xl space-y-4 max-w-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink uppercase tracking-wider">
                10 Fresh Backup Codes
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyNewCodes}
                  className="px-2.5 py-1 rounded-lg border border-line bg-white text-xs text-ink font-medium inline-flex items-center gap-1 cursor-pointer"
                >
                  {copiedCodes ? <Check className="w-3.5 h-3.5 text-teal" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCodes ? "Copied" : "Copy"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadNewCodes}
                  className="px-2.5 py-1 rounded-lg border border-line bg-white text-xs text-ink font-medium inline-flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 p-3 bg-white border border-line rounded-xl font-mono text-xs text-center font-bold text-ink select-all">
              {newBackupCodes.map((c, i) => (
                <div key={i} className="p-1 bg-surface rounded">
                  {c}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleRegenerateCodes} className="space-y-4 max-w-md">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider">
                Confirm Account Password
              </label>
              <input
                type="password"
                required
                value={regenPassword}
                onChange={(e) => setRegenPassword(e.target.value)}
                placeholder="Enter password to regenerate"
                className="w-full bg-surface border border-line rounded-xl px-4 py-2.5 text-sm font-mono text-ink focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
              />
            </div>

            <button
              type="submit"
              disabled={regenLoading || !regenPassword}
              className="inline-flex items-center gap-2 bg-brand text-white font-semibold py-2.5 px-5 rounded-xl text-xs hover:bg-brand-dark transition-all disabled:opacity-50 cursor-pointer"
            >
              {regenLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating New Codes...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Generate New Codes</span>
                </>
              )}
            </button>
          </form>
        )}
      </section>

      {/* Section 4: Security Audit Events */}
      <section className="bg-white border border-line rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-brand" />
            <h2 className="font-display font-bold text-ink text-lg">
              Security Audit Trail (Last 25 Events)
            </h2>
          </div>
          <p className="text-xs text-ink-muted">
            All administrative logins, 2FA challenges, lockouts, and credential changes (180-day retention).
          </p>
        </div>

        <div className="border border-line rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface border-b border-line text-ink-muted uppercase tracking-wider text-[10px] font-semibold">
                <tr>
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">User Agent / Details</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-white font-mono text-[11px]">
                {events.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-ink-muted font-body">
                      No security events recorded yet.
                    </td>
                  </tr>
                ) : (
                  events.map((ev) => (
                    <tr key={ev.id} className="hover:bg-surface/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-ink">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-surface border border-line text-ink font-semibold font-mono text-[10px]">
                          {ev.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-ink-muted">{ev.ip || "—"}</td>
                      <td className="py-3 px-4 text-ink-muted font-body max-w-xs truncate">
                        {ev.metadata ? JSON.stringify(ev.metadata) : ev.userAgent || "—"}
                      </td>
                      <td className="py-3 px-4 text-right text-ink-muted font-sans text-xs">
                        {new Date(ev.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
