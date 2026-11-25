"use client";

import React, { useState } from "react";
import { Copy, CheckCheck, MessageCircle, Mail } from "lucide-react";

export interface BlogShareBlockProps {
  title: string;
  url?: string;
  className?: string;
}

export const BlogShareBlock: React.FC<BlogShareBlockProps> = ({
  title,
  url,
  className = "",
}) => {
  const [copied, setCopied] = useState(false);

  const currentUrl =
    url || (typeof window !== "undefined" ? window.location.href : "");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(
    `${title} - Read more at: ${currentUrl}`
  )}`;

  const emailHref = `mailto:?subject=${encodeURIComponent(
    `Dental article: ${title}`
  )}&body=${encodeURIComponent(
    `I thought you might find this article from GuruOm Dental helpful:\n\n${title}\n\nRead here: ${currentUrl}`
  )}`;

  return (
    <div aria-label="Share article options" className={`space-y-3 ${className}`}>
      <p className="text-sm font-semibold text-ink pb-2 border-b border-line">
        Share this article
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "Link copied to clipboard" : "Copy article link"}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-line bg-white hover:bg-surface text-xs font-medium text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
        >
          {copied ? (
            <CheckCheck className="w-3.5 h-3.5 text-success" aria-hidden="true" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-ink-muted" aria-hidden="true" />
          )}
          <span>{copied ? "Copied link" : "Copy link"}</span>
        </button>

        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share this guide via WhatsApp"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-line bg-white hover:bg-surface text-xs font-medium text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <MessageCircle className="w-3.5 h-3.5 text-success" aria-hidden="true" />
          <span>WhatsApp</span>
        </a>

        <a
          href={emailHref}
          aria-label="Share this guide via Email"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-line bg-white hover:bg-surface text-xs font-medium text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Mail className="w-3.5 h-3.5 text-ink-muted" aria-hidden="true" />
          <span>Email</span>
        </a>
      </div>

      <div aria-live="polite" className="sr-only">
        {copied ? "Article link copied to clipboard" : ""}
      </div>
    </div>
  );
};
