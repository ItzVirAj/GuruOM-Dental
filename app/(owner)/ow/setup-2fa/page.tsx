import { redirect, notFound } from "next/navigation";
import { Suspense } from "react";
import { getEnv } from "@/src/lib/env";
import { requireOwner } from "@/src/server/auth/guard";
import { ownerHref } from "@/src/lib/owner-url";
import { SetupFlow } from "./setup-flow";
import { ShieldAlert, Loader2 } from "lucide-react";

export const metadata = {
  title: "Setup Two-Factor Authentication",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

async function SetupContent() {
  // Allow unverified 2FA session so the owner can complete onboarding
  const { user: owner } = await requireOwner({ allowUnverified2FA: true });

  // If already enabled, redirect to owner root
  if (Boolean((owner as Record<string, unknown>).twoFactorEnabled)) {
    redirect(ownerHref("/"));
  }

  return <SetupFlow ownerEmail={owner.email} />;
}

export default function Setup2FAPage() {
  const env = getEnv();
  if (env.OWNER_AREA_ENABLED !== "true") {
    notFound();
  }

  return (
    <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-6 bg-surface min-h-full py-12">
      <div className="max-w-xl w-full bg-white border border-line rounded-3xl p-8 sm:p-10 shadow-card space-y-6 my-auto">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-3">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="font-display font-bold text-ink text-2xl tracking-tight">
            Mandatory Two-Factor Setup
          </h1>
          <p className="text-xs text-ink-muted leading-relaxed max-w-md mx-auto">
            GuruOm Dental requires mandatory hardware or authenticator TOTP 2-factor protection for all administrative accounts.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-10 text-xs text-ink-muted gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-brand" />
              <span>Checking onboarding state...</span>
            </div>
          }
        >
          <SetupContent />
        </Suspense>
      </div>
    </div>
  );
}
