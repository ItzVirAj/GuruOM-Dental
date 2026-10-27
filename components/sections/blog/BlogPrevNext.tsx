"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { BlogPost } from "@/src/server/blog/types";

export interface BlogPrevNextProps {
  prev: BlogPost | null;
  next: BlogPost | null;
}

export const BlogPrevNext: React.FC<BlogPrevNextProps> = ({ prev, next }) => {
  if (!prev && !next) return null;

  return (
    <nav aria-label="Adjacent articles" className="pt-8 border-t border-line grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Previous Post */}
      {prev ? (
        <Link
          href={`/blog/${prev.slug}`}
          className="group flex flex-col justify-between p-5 rounded-2xl border border-line bg-surface/50 hover:bg-surface hover:border-brand/40 transition-all shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <span className="flex items-center gap-1.5 text-[11px] uppercase font-semibold tracking-wider text-ink-muted group-hover:text-brand transition-colors">
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Previous Article</span>
          </span>
          <span className="font-display font-semibold text-ink text-sm sm:text-base mt-2 line-clamp-2 group-hover:text-brand transition-colors">
            {prev.title}
          </span>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}

      {/* Next Post */}
      {next && (
        <Link
          href={`/blog/${next.slug}`}
          className="group flex flex-col justify-between p-5 rounded-2xl border border-line bg-surface/50 hover:bg-surface hover:border-brand/40 transition-all text-right shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:ml-auto w-full"
        >
          <span className="flex items-center justify-end gap-1.5 text-[11px] uppercase font-semibold tracking-wider text-ink-muted group-hover:text-brand transition-colors">
            <span>Next Article</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </span>
          <span className="font-display font-semibold text-ink text-sm sm:text-base mt-2 line-clamp-2 group-hover:text-brand transition-colors">
            {next.title}
          </span>
        </Link>
      )}
    </nav>
  );
};
