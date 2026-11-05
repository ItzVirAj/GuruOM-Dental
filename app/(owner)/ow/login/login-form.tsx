"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginAction, type ActionState } from "@/src/server/auth/actions";
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";

const initialState: ActionState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.redirectUrl) {
      router.push(state.redirectUrl);
    }
  }, [state.redirectUrl, router]);

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div
          role="alert"
          aria-live="polite"
          className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-3"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{state.error}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="block text-xs font-semibold text-ink uppercase tracking-wider"
        >
          Owner Email
        </label>
        <div className="relative">
          <Mail className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="username"
            placeholder="owner@guruomdental.com"
            className="w-full bg-surface border border-line rounded-xl pl-10 pr-4 py-3 text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="block text-xs font-semibold text-ink uppercase tracking-wider"
        >
          Master Password
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••••••••••"
            className="w-full bg-surface border border-line rounded-xl pl-10 pr-4 py-3 text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all font-mono"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-brand text-white font-semibold py-3.5 px-6 rounded-xl text-sm shadow-brand/20 shadow-md hover:bg-brand-dark active:scale-[0.99] disabled:opacity-60 transition-all cursor-pointer"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Verifying Credentials...</span>
          </>
        ) : (
          <>
            <span>Authenticate</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      <div className="pt-2 text-center">
        <p className="text-[11px] text-ink-muted inline-flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-teal" />
          <span>Strict Single-Owner Policy &amp; Rate-Limited</span>
        </p>
      </div>
    </form>
  );
}
