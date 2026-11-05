"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animations/Reveal";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[APP_ERROR_BOUNDARY]", error);
    }
  }, [error]);

  return (
    <main className="min-h-[75vh] flex items-center justify-center py-20 bg-surface">
      <Container className="max-w-md">
        <Reveal
          variant="scale"
          duration={0.5}
          className="bg-white border border-line rounded-3xl p-8 sm:p-12 text-center shadow-card space-y-6"
        >
          <div className="w-14 h-14 rounded-2xl bg-danger/10 text-danger flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h1 className="font-display font-bold text-ink text-2xl sm:text-3xl">
              Something went wrong
            </h1>
            <p className="text-sm text-ink-muted max-w-sm mx-auto leading-relaxed">
              We encountered an unexpected issue while loading this page. Please try again or return to the clinic homepage.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ink text-white hover:bg-ink-muted text-xs font-semibold transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-line bg-white hover:bg-surface text-xs font-semibold text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Return Home</span>
            </Link>
          </div>
        </Reveal>
      </Container>
    </main>
  );
}
