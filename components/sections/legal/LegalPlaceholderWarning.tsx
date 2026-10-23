"use client";

import React, { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { LegalDocument } from "@/data/legal";

export interface LegalPlaceholderWarningProps {
  document: LegalDocument;
}

interface PlaceholderFound {
  token: string;
  location: string;
}

export const LegalPlaceholderWarning: React.FC<LegalPlaceholderWarningProps> = ({
  document,
}) => {
  // Never render in production
  const isDev = process.env.NODE_ENV !== "production";

  const placeholders = useMemo<PlaceholderFound[]>(() => {
    if (!isDev) return [];

    const found: PlaceholderFound[] = [];
    const seen = new Set<string>();

    const scanText = (text: string | undefined, location: string) => {
      if (!text) return;
      const regex = /\[PLACEHOLDER:[^\]]+\]/g;
      let match: RegExpExecArray | null;
      while ((match = regex.exec(text)) !== null) {
        const token = match[0];
        const key = `${token}|${location}`;
        if (!seen.has(key)) {
          seen.add(key);
          found.push({ token, location });
        }
      }
    };

    scanText(document.intro, "Introduction");

    for (const section of document.sections) {
      scanText(section.heading, section.heading);
      for (const block of section.blocks) {
        if (block.type === "paragraph") {
          scanText(block.text, section.heading);
        } else if (block.type === "list") {
          for (const item of block.items) {
            scanText(item, section.heading);
          }
        } else if (block.type === "note") {
          scanText(block.title, section.heading);
          scanText(block.text, section.heading);
        }
      }
    }

    return found;
  }, [document, isDev]);

  if (!isDev || placeholders.length === 0) {
    return null;
  }

  return (
    <aside
      aria-label="Development Mode Warning: Unresolved Legal Placeholders"
      className="my-8 rounded-2xl border-2 border-amber-400/80 bg-amber-50/90 p-5 sm:p-6 text-amber-950 shadow-soft print:hidden"
    >
      <div className="flex items-start gap-3.5">
        <div className="mt-0.5 rounded-lg bg-amber-500/20 p-2 text-amber-700 shrink-0">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-md">
              DEV ONLY NOTICE
            </span>
            <h3 className="font-display font-semibold text-sm sm:text-base text-amber-950">
              Unresolved Legal Placeholders ({placeholders.length} found)
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed font-body">
            This document is a draft template. Before launching the clinic website, a qualified
            lawyer must review, approve, and replace all{" "}
            <code className="px-1.5 py-0.5 rounded bg-amber-200/70 font-mono text-xs font-bold">
              [PLACEHOLDER: ...]
            </code>{" "}
            tokens in <code className="font-mono text-xs font-semibold">/data/legal.ts</code> with
            verified entity, registration, and grievance details. (This warning is automatically
            stripped in production builds).
          </p>

          <div className="pt-2">
            <details className="text-xs group">
              <summary className="font-semibold text-amber-900 cursor-pointer hover:underline select-none">
                View all {placeholders.length} placeholder tokens in this document
              </summary>
              <ul className="mt-3 space-y-1.5 pl-3 border-l-2 border-amber-300">
                {placeholders.map((item, idx) => (
                  <li key={`${item.token}-${idx}`} className="font-mono text-[11px] text-amber-950 break-words">
                    <span className="font-semibold text-amber-800">{item.location}:</span>{" "}
                    <span className="bg-amber-200/80 px-1 py-0.2 rounded font-bold">
                      {item.token}
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default LegalPlaceholderWarning;
