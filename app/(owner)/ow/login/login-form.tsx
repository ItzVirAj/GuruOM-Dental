"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction, type ActionState } from "@/src/server/auth/actions";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";

const initialState: ActionState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (state.redirectUrl) {
      router.push(state.redirectUrl);
    }
  }, [state.redirectUrl, router]);

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-xl border border-danger/30 border-l-4 border-l-danger bg-white px-4 py-3.5 text-sm sm:text-base text-ink flex items-start gap-3 shadow-soft"
        >
          <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" aria-hidden="true" />
          <span className="leading-relaxed">{state.error}</span>
        </div>
      )}

      <div className="space-y-2.5">
        <label
          htmlFor="email"
          className="block text-sm sm:text-base font-medium text-ink"
        >
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          placeholder="owner@guruomdental.com"
          className="w-full h-14 rounded-xl border border-line bg-white px-4 text-base text-ink placeholder:text-ink-muted/60 focus:outline-none focus:ring-2 focus:ring-accent focus:border-brand-dark transition-colors"
        />
      </div>

      <div className="space-y-2.5">
        <label
          htmlFor="password"
          className="block text-sm sm:text-base font-medium text-ink"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            placeholder="Enter your password"
            className="w-full h-14 rounded-xl border border-line bg-white pl-4 pr-14 text-base text-ink placeholder:text-ink-muted/60 focus:outline-none focus:ring-2 focus:ring-accent focus:border-brand-dark transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink-muted hover:text-ink hover:bg-surface transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Eye className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full h-14 mt-2 inline-flex items-center justify-center gap-2.5 rounded-xl bg-brand-dark px-6 text-base font-semibold text-white hover:bg-brand active:scale-[0.995] disabled:opacity-60 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface"
      >
        {isPending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            <span>Signing in…</span>
          </>
        ) : (
          <span>Sign in</span>
        )}
      </button>
    </form>
  );
}
