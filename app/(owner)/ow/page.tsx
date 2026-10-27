import { notFound } from "next/navigation";
import { getEnv } from "@/src/lib/env";
import { ShieldAlert } from "lucide-react";

export default function OwnerRootPage() {
  const env = getEnv();

  // Return 404 unless OWNER_AREA_ENABLED is explicitly "true"
  if (env.OWNER_AREA_ENABLED !== "true") {
    notFound();
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-surface">
      <div className="max-w-md w-full bg-white border border-line rounded-3xl p-8 shadow-card text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h1 className="font-display font-bold text-ink text-xl">
          Owner area: setup in progress
        </h1>
        <p className="text-xs text-ink-muted leading-relaxed font-body">
          Database, blog schema, and route rewriting scaffold are active.
          Authentication and administration controls will be initialized in the next step.
        </p>
        <div className="pt-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-surface border border-line text-ink-muted">
            Environment: Ready
          </span>
        </div>
      </div>
    </div>
  );
}
