"use client";

import { useTransition } from "react";
import { logoutAction } from "@/src/server/auth/actions";
import { LogOut, Loader2 } from "lucide-react";

interface LogoutButtonProps {
  className?: string;
}

export function LogoutButton({ className }: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await logoutAction();
        });
      }}
      className={
        className ||
        "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/[0.03] hover:bg-red-500/10 text-ink-muted/90 hover:text-red-600 border border-black/[0.05] hover:border-red-200/60 text-xs font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 select-none focus-visible:ring-2 focus-visible:ring-red-400/40 focus-visible:outline-none"
      }
      title="Terminate current session and sign out"
      aria-label="Sign out"
    >
      {isPending ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <LogOut className="w-3.5 h-3.5 stroke-[1.75]" />
      )}
      <span className="hidden sm:inline">Sign Out</span>
    </button>
  );
}
