import { notFound } from "next/navigation";
import { getEnv } from "@/src/lib/env";
import { VerifyForm } from "./verify-form";
import { ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Two-Factor Verification",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function VerifyPage() {
  const env = getEnv();
  if (env.OWNER_AREA_ENABLED !== "true") {
    notFound();
  }

  return (
    <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-6 bg-surface min-h-full py-12">
      <div className="max-w-md w-full bg-white border border-line rounded-3xl p-8 sm:p-10 shadow-card space-y-6 my-auto">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-teal/10 text-teal flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="font-display font-bold text-ink text-2xl tracking-tight">
            Second-Factor Verification
          </h1>
          <p className="text-xs text-ink-muted leading-relaxed">
            Please verify your identity using your configured time-based one-time password (TOTP) or an emergency backup code.
          </p>
        </div>

        <VerifyForm />
      </div>
    </div>
  );
}
