import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getEnv } from "@/src/lib/env";
import { auth } from "@/src/server/auth/auth";
import { ownerHref } from "@/src/lib/owner-url";
import { LoginForm } from "./login-form";
import { Shield } from "lucide-react";

export const metadata = {
  title: "Owner Portal Sign-In",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

async function SessionRedirectCheck() {
  const sessionData = await auth.api.getSession({
    headers: await headers(),
  });

  if (sessionData?.user && sessionData?.session) {
    const is2FA = Boolean(
      (sessionData.user as Record<string, unknown>).twoFactorEnabled
    );
    if (is2FA) {
      redirect(ownerHref("/"));
    } else {
      redirect(ownerHref("/setup-2fa"));
    }
  }

  return null;
}

export default function LoginPage() {
  const env = getEnv();
  if (env.OWNER_AREA_ENABLED !== "true") {
    notFound();
  }

  return (
    <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-6 bg-surface min-h-full py-12">
      <Suspense fallback={null}>
        <SessionRedirectCheck />
      </Suspense>
      <div className="max-w-md w-full bg-white border border-line rounded-3xl p-8 sm:p-10 shadow-card space-y-6 my-auto">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="font-display font-bold text-ink text-2xl tracking-tight">
            GuruOm Dental
          </h1>
          <p className="text-xs text-ink-muted leading-relaxed">
            Authorized Owner Access Only. All connections and sign-in attempts are monitored and cryptographically recorded.
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
