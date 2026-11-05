"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  request2FASetupAction,
  confirm2FASetupAction,
} from "@/src/server/auth/actions";
import {
  Lock,
  QrCode,
  Key,
  Copy,
  Check,
  Download,
  Printer,
  ShieldCheck,
  AlertCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";

export function SetupFlow({ ownerEmail }: { ownerEmail: string }) {
  const router = useRouter();

  const [step, setStep] = useState<"password" | "confirm">("password");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Setup data from server
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [savedCodesConfirmed, setSavedCodesConfirmed] = useState(false);

  async function handleStartSetup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await request2FASetupAction(password);
      if (res.error) {
        setError(res.error);
      } else if (res.qrCodeDataUrl && res.secret && res.backupCodes) {
        setQrCodeDataUrl(res.qrCodeDataUrl);
        setSecret(res.secret);
        setBackupCodes(res.backupCodes);
        setStep("confirm");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to begin setup.");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmSetup(e: React.FormEvent) {
    e.preventDefault();
    if (!savedCodesConfirmed) {
      setError("Please confirm that you have saved your backup codes.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await confirm2FASetupAction(code);
      if (res.error) {
        setError(res.error);
      } else if (res.redirectUrl) {
        router.push(res.redirectUrl);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to confirm 2FA.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopySecret() {
    if (secret) {
      navigator.clipboard.writeText(secret);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  }

  function handleCopyBackupCodes() {
    if (backupCodes.length > 0) {
      navigator.clipboard.writeText(backupCodes.join("\n"));
      setCopiedCodes(true);
      setTimeout(() => setCopiedCodes(false), 2000);
    }
  }

  function handleDownloadBackupCodes() {
    const text = `GURUOM DENTAL - EMERGENCY 2FA BACKUP CODES\nOwner: ${ownerEmail}\nGenerated: ${new Date().toISOString()}\n\nEach code can only be used once:\n\n${backupCodes.join("\n")}\n\nKeep these in a secure password manager or offline safe.`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `guruom-dental-backup-codes-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handlePrintBackupCodes() {
    window.print();
  }

  return (
    <div className="space-y-6">
      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-3"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {step === "password" ? (
        <form onSubmit={handleStartSetup} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="verify-pass"
              className="block text-xs font-semibold text-ink uppercase tracking-wider"
            >
              Confirm Account Password to Begin
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="verify-pass"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your master password"
                className="w-full bg-surface border border-line rounded-xl pl-10 pr-4 py-3 text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all font-mono"
              />
            </div>
            <p className="text-[11px] text-ink-muted leading-relaxed">
              Two-Factor Authentication is strictly mandatory for the GuruOm Dental owner area.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full inline-flex items-center justify-center gap-2 bg-brand text-white font-semibold py-3.5 px-6 rounded-xl text-sm shadow-brand/20 shadow-md hover:bg-brand-dark active:scale-[0.99] disabled:opacity-60 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Cryptographic Secret...</span>
              </>
            ) : (
              <>
                <span>Configure Two-Factor App</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleConfirmSetup} className="space-y-6">
          {/* Step 1: Scan QR Code */}
          <div className="p-5 bg-surface border border-line rounded-2xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-ink uppercase tracking-wider">
              <QrCode className="w-4 h-4 text-brand" />
              <span>Step 1: Scan Authenticator QR Code</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center py-2">
              {qrCodeDataUrl && (
                <div className="bg-white p-3 rounded-2xl border border-line shadow-sm shrink-0">
                  <Image
                    src={qrCodeDataUrl}
                    alt="Scan this TOTP QR Code with your authenticator"
                    width={180}
                    height={180}
                    unoptimized
                    className="w-44 h-44 rounded-lg"
                  />
                </div>
              )}

              <div className="space-y-3 text-left">
                <p className="text-xs text-ink-muted leading-relaxed">
                  Open Google Authenticator, 1Password, Apple Passwords, or Authy and scan the QR code.
                </p>
                {secret && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-ink-muted block mb-1">
                      Manual Secret Key
                    </span>
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono font-bold bg-white px-3 py-1.5 rounded-lg border border-line text-ink select-all">
                        {secret}
                      </code>
                      <button
                        type="button"
                        onClick={handleCopySecret}
                        className="p-1.5 rounded-lg border border-line bg-white hover:bg-surface text-ink-muted hover:text-ink transition-colors cursor-pointer"
                        title="Copy Secret"
                      >
                        {copiedSecret ? (
                          <Check className="w-4 h-4 text-teal" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Step 2: Backup Codes */}
          <div className="p-5 bg-surface border border-line rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-ink uppercase tracking-wider">
                <Key className="w-4 h-4 text-brand" />
                <span>Step 2: Emergency Backup Codes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyBackupCodes}
                  className="px-2.5 py-1 rounded-lg text-xs border border-line bg-white text-ink-muted hover:text-ink font-medium inline-flex items-center gap-1 cursor-pointer"
                >
                  {copiedCodes ? <Check className="w-3.5 h-3.5 text-teal" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCodes ? "Copied" : "Copy"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadBackupCodes}
                  className="px-2.5 py-1 rounded-lg text-xs border border-line bg-white text-ink-muted hover:text-ink font-medium inline-flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrintBackupCodes}
                  className="px-2.5 py-1 rounded-lg text-xs border border-line bg-white text-ink-muted hover:text-ink font-medium inline-flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-ink-muted">
              Save these 10 one-time codes safely. They are required if you lose access to your authenticator device.
            </p>

            <div className="grid grid-cols-2 gap-2 p-3 bg-white border border-line rounded-xl font-mono text-xs text-center font-bold text-ink select-all">
              {backupCodes.map((c, idx) => (
                <div key={idx} className="p-1 bg-surface rounded">
                  {c}
                </div>
              ))}
            </div>

            <label className="flex items-start gap-2.5 pt-1 cursor-pointer text-xs text-ink font-medium select-none">
              <input
                type="checkbox"
                required
                checked={savedCodesConfirmed}
                onChange={(e) => setSavedCodesConfirmed(e.target.checked)}
                className="mt-0.5 rounded border-line text-brand focus:ring-brand w-4 h-4"
              />
              <span>
                I have securely saved these 10 backup codes in a safe place.
              </span>
            </label>
          </div>

          {/* Step 3: Confirmation Code */}
          <div className="space-y-3">
            <div className="space-y-1.5 text-center">
              <label
                htmlFor="confirm-code"
                className="block text-xs font-semibold text-ink uppercase tracking-wider"
              >
                Step 3: Enter 6-Digit Authenticator Code
              </label>
              <input
                id="confirm-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="000000"
                className="w-full bg-surface border border-line rounded-2xl py-3.5 text-center text-2xl font-mono tracking-[0.5em] text-ink focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all placeholder:text-ink-muted/30"
              />
              <p className="text-[11px] text-ink-muted">
                Type the 6-digit code currently visible in your authenticator app to activate.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6 || !savedCodesConfirmed}
              className="w-full inline-flex items-center justify-center gap-2 bg-brand text-white font-semibold py-3.5 px-6 rounded-xl text-sm shadow-brand/20 shadow-md hover:bg-brand-dark active:scale-[0.99] disabled:opacity-60 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enforcing Two-Factor Protection...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Activate &amp; Enforce 2FA</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
