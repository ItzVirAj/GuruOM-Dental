"use client";

import Link from "next/link";
import type { BlogPost } from "@/src/server/blog/types";

export interface BlogPrevNextProps {
  prev: BlogPost | null;
  next: BlogPost | null;
}

export const BlogPrevNext: React.FC<BlogPrevNextProps> = ({ prev, next }) => {
  if (!prev && !next) return null;

  return (
    <nav
      aria-label="Adjacent articles"
      className="pt-8 border-t border-line grid grid-cols-1 sm:grid-cols-2 gap-6"
    >
      {prev ? (
        <Link
          href={`/blog/${prev.slug}`}
          className="group flex flex-col justify-between py-3 pr-4 border-l-2 border-transparent hover:border-accent pl-4 -ml-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <span className="text-xs text-ink-muted group-hover:text-ink transition-colors">
            Previous article
          </span>
          <span className="font-just-serif font-normal text-ink text-lg mt-1 line-clamp-2 group-hover:text-accent-deep transition-colors">
            {prev.title}
          </span>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}

      {next && (
        <Link
          href={`/blog/${next.slug}`}
          className="group flex flex-col justify-between py-3 pl-4 border-r-2 border-transparent hover:border-accent pr-4 -mr-4 text-right transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:ml-auto w-full"
        >
          <span className="text-xs text-ink-muted group-hover:text-ink transition-colors">
            Next article
          </span>
          <span className="font-just-serif font-normal text-ink text-lg mt-1 line-clamp-2 group-hover:text-accent-deep transition-colors">
            {next.title}
          </span>
        </Link>
      )}
    </nav>
  );
};
