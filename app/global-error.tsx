"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[GLOBAL_ERROR_BOUNDARY]", error?.digest || "unspecified error");
    }
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F8F9FA] text-[#1E1B1C] flex items-center justify-center p-6 antialiased font-sans">
        <div className="bg-white border border-[#E9ECEF] rounded-3xl p-8 sm:p-10 max-w-md w-full text-center shadow-lg space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-[#008080]/10 text-[#008080] flex items-center justify-center mx-auto font-bold text-xl">
            !
          </div>

          <div className="space-y-2">
            <h1 className="font-bold text-2xl text-[#1E1B1C]">
              Unable to Load Page
            </h1>
            <p className="text-xs text-[#6C757D] leading-relaxed">
              A temporary application error occurred. No sensitive details are exposed. Please reload to try again.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="px-5 py-2.5 rounded-xl bg-[#1E1B1C] text-white hover:opacity-90 text-xs font-semibold transition-all shadow-sm"
            >
              Reload Application
            </button>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl border border-[#E9ECEF] bg-white hover:bg-[#F8F9FA] text-xs font-semibold text-[#1E1B1C] transition-colors"
            >
              Return Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
