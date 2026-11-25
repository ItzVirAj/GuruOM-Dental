import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { getEnv } from "@/src/lib/env";
import { auth } from "@/src/server/auth/auth";
import { ownerHref } from "@/src/lib/owner-url";
import { heroLogoSrc } from "@/data/home-images";
import { LoginForm } from "./login-form";

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
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-full bg-surface text-ink font-aileron">
      <Suspense fallback={null}>
        <SessionRedirectCheck />
      </Suspense>

      {/* Left architectural brand chamber */}
      <aside className="lg:col-span-5 bg-brand-dark text-ink-inverse flex flex-col justify-between px-7 py-8 sm:px-12 sm:py-12 lg:px-14 lg:py-14 relative overflow-hidden">
        {/* Top wordmark */}
        <div className="relative z-10 flex items-center justify-between">
          <Image
            src={heroLogoSrc}
            alt="GuruOm Dental"
            width={843}
            height={193}
            priority
            className="h-7 sm:h-8 w-auto object-contain object-left"
          />
          <Link
            href="/"
            className="lg:hidden text-xs text-white/75 underline underline-offset-4 hover:text-white transition-colors"
          >
            Return to website
          </Link>
        </div>

        {/* Center editorial statement */}
        <div className="relative z-10 my-10 lg:my-auto max-w-md">
          <div className="flex items-start gap-5">
            <div className="flex flex-col items-center pt-2 shrink-0" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-accent" />
              <span className="mt-2 h-24 sm:h-32 w-px bg-white/20" />
            </div>
            <div>
              <p className="font-just-serif text-3xl sm:text-4xl lg:text-[2.65rem] leading-[1.08] tracking-[-0.025em] text-white text-balance">
                Calm precision for every published detail.
              </p>
              <p className="mt-4 text-sm text-white/70 leading-relaxed max-w-sm">
                Private editorial and media workspace for GuruOm Dental Clinic &amp; Digital Lab.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom clinic context */}
        <div className="relative z-10 pt-6 border-t border-white/15 flex flex-col gap-1 text-xs text-white/65">
          <p className="font-medium text-white/90">Ahilyanagar clinic desk</p>
          <p>Protected by two-factor verification and session logging.</p>
        </div>
      </aside>

      {/* Right sunlit linen sign-in workspace */}
      <main className="lg:col-span-7 flex flex-col justify-between px-6 py-8 sm:px-12 sm:py-12 lg:px-20 lg:py-14 bg-surface">
        <div className="hidden lg:flex justify-end">
          <Link
            href="/"
            className="text-xs font-medium text-ink-muted hover:text-ink underline underline-offset-4 decoration-line hover:decoration-ink transition-colors"
          >
            Return to website
          </Link>
        </div>

        <div className="my-auto w-full max-w-[540px] mx-auto py-8">
          <header className="mb-10">
            <h1 className="font-just-serif text-4xl sm:text-5xl lg:text-[3.1rem] font-normal leading-[1.08] tracking-[-0.025em] text-ink">
              Sign in to the clinic desk
            </h1>
            <p className="mt-3.5 text-base sm:text-lg text-ink-muted leading-relaxed">
              Manage journal articles, homepage gallery cards, and clinical media.
            </p>
          </header>

          <LoginForm />
        </div>

        <div className="w-full max-w-[540px] mx-auto pt-6 border-t border-line/80">
          <p className="text-xs sm:text-sm text-ink-muted">
            Single-owner access only. Unauthorized sign-in attempts are rate-limited and recorded.
          </p>
        </div>
      </main>
    </div>
  );
}
