"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  verifyTotpAction,
  verifyBackupCodeAction,
  type ActionState,
} from "@/src/server/auth/actions";
import { KeyRound, ShieldAlert, ArrowRight, Loader2, Key } from "lucide-react";

export function VerifyForm() {
  const [useBackupCode, setUseBackupCode] = useState(false);
  const router = useRouter();

  const [totpState, totpFormAction, isTotpPending] = useActionState(
    verifyTotpAction,
    {} as ActionState
  );

  const [backupState, backupFormAction, isBackupPending] = useActionState(
    verifyBackupCodeAction,
    {} as ActionState
  );

  const state = useBackupCode ? backupState : totpState;
  const isPending = useBackupCode ? isBackupPending : isTotpPending;

  useEffect(() => {
    if (state.redirectUrl) {
      router.push(state.redirectUrl);
    }
  }, [state.redirectUrl, router]);

  return (
    <div className="space-y-6">
      {state.error && (
        <div
          role="alert"
          aria-live="polite"
          className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-3"
        >
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{state.error}</span>
        </div>
      )}

      {!useBackupCode ? (
        <form action={totpFormAction} className="space-y-5">
          <div className="space-y-2 text-center">
            <label
              htmlFor="totp-code"
              className="block text-xs font-semibold text-ink uppercase tracking-wider"
            >
              Enter 6-Digit Authenticator Code
            </label>
            <div className="relative">
              <input
                id="totp-code"
                name="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                required
                autoFocus
                autoComplete="one-time-code"
                placeholder="000000"
                className="w-full bg-surface border border-line rounded-2xl py-3.5 text-center text-2xl font-mono tracking-[0.5em] text-ink focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all placeholder:text-ink-muted/30"
              />
            </div>
            <p className="text-[11px] text-ink-muted">
              Check Google Authenticator, Apple Passwords, or 1Password.
            </p>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full inline-flex items-center justify-center gap-2 bg-brand text-white font-semibold py-3.5 px-6 rounded-xl text-sm shadow-brand/20 shadow-md hover:bg-brand-dark active:scale-[0.99] disabled:opacity-60 transition-all cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Token...</span>
              </>
            ) : (
              <>
                <span>Complete Verification</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        <form action={backupFormAction} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="backup-code"
              className="block text-xs font-semibold text-ink uppercase tracking-wider"
            >
              Enter One-Time Backup Code
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="backup-code"
                name="code"
                type="text"
                required
                autoFocus
                placeholder="e.g. 1a2b3c4d5e"
                className="w-full bg-surface border border-line rounded-xl pl-10 pr-4 py-3 text-sm font-mono text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all"
              />
            </div>
            <p className="text-[11px] text-ink-muted">
              Backup codes are 10 characters long and can each only be used once.
            </p>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full inline-flex items-center justify-center gap-2 bg-brand text-white font-semibold py-3.5 px-6 rounded-xl text-sm shadow-brand/20 shadow-md hover:bg-brand-dark active:scale-[0.99] disabled:opacity-60 transition-all cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Validating Backup Code...</span>
              </>
            ) : (
              <>
                <span>Verify Backup Code</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      <div className="pt-2 border-t border-line text-center">
        <button
          type="button"
          onClick={() => setUseBackupCode(!useBackupCode)}
          className="text-xs text-brand hover:underline font-medium inline-flex items-center gap-1.5 cursor-pointer"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>
            {useBackupCode
              ? "Use Authenticator App (TOTP) instead"
              : "Lost device? Use a backup code instead"}
          </span>
        </button>
      </div>
    </div>
  );
}
