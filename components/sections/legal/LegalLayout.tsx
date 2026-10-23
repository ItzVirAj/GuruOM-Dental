"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Printer,
  Link as LinkIcon,
  CheckCheck,
  ChevronDown,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  Info,
  AlertTriangle,
} from "lucide-react";
import { Container, PageHeader, Button } from "@/components/ui";
import { LegalDocument, formatLegalDate, LegalBlockNote } from "@/data/legal";
import { LegalPlaceholderWarning } from "./LegalPlaceholderWarning";
import { ScrollTrigger } from "@/lib/gsap";

export interface LegalLayoutProps {
  document: LegalDocument;
  otherDocument: {
    title: string;
    href: string;
  };
}

export const LegalLayout: React.FC<LegalLayoutProps> = ({
  document: doc,
  otherDocument,
}) => {
  const [activeId, setActiveId] = useState<string>(doc.sections[0]?.id || "");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [liveMessage, setLiveMessage] = useState<string>("");
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Setup ScrollTrigger for active section tracking
  useEffect(() => {
    const triggers: ScrollTrigger[] = [];

    // Small delay to ensure DOM and fonts are ready
    const timer = setTimeout(() => {
      doc.sections.forEach((section) => {
        const el = window.document.getElementById(section.id);
        if (!el) return;

        const st = ScrollTrigger.create({
          trigger: el,
          start: "top 160px",
          end: "bottom 160px",
          onEnter: () => setActiveId(section.id),
          onEnterBack: () => setActiveId(section.id),
        });

        triggers.push(st);
      });
    }, 150);

    return () => {
      clearTimeout(timer);
      triggers.forEach((t) => t.kill());
    };
  }, [doc.sections]);

  // Handle smooth scroll to section
  const handleScrollTo = (id: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();

    const target = window.document.getElementById(id);
    if (!target) return;

    setActiveId(id);

    // Lenis smooth scroll if present on window
    const lenis = (window as unknown as { lenis?: { scrollTo: (target: HTMLElement | string, options?: { offset?: number }) => void } }).lenis;
    if (lenis) {
      lenis.scrollTo(target, { offset: -96 });
    } else {
      const top = target.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({
        top,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
    }

    // Update URL hash without jumping
    if (window.history.replaceState) {
      window.history.replaceState(null, "", `#${id}`);
    }
  };

  // Copy section anchor link to clipboard
  const handleCopySectionLink = async (id: string) => {
    try {
      const url = `${window.location.origin}${window.location.pathname}#${id}`;
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setLiveMessage(`Link to section copied to clipboard: ${url}`);
      setTimeout(() => {
        setCopiedId(null);
        setLiveMessage("");
      }, 3000);
    } catch {
      setLiveMessage("Could not copy link to clipboard.");
    }
  };

  // Trigger browser print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-surface text-ink min-h-screen">
      {/* 1. Page Header with Meta line */}
      <PageHeader
        eyebrow="Legal"
        title={doc.title}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: doc.title },
        ]}
      >
        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-white/80 font-body">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <span>Last updated:</span>
            <time dateTime={doc.lastUpdated} className="text-accent font-semibold">
              {formatLegalDate(doc.lastUpdated)}
            </time>
          </span>
          <span aria-hidden="true" className="opacity-40">
            •
          </span>
          <span className="inline-block px-2 py-0.5 rounded-full bg-white/10 text-white/90 text-xs font-mono">
            Version {doc.version}
          </span>
        </div>
      </PageHeader>

      <Container className="py-10 sm:py-14 lg:py-16">
        {/* Development Mode Notice: Unresolved Placeholders */}
        <LegalPlaceholderWarning document={doc} />

        {/* 2. Document Utility Toolbar (Print + Share Status) */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-line print:hidden">
          <div className="text-xs font-body text-ink-muted">
            Official compliance document for{" "}
            <span className="font-semibold text-ink">GuruOm Dental</span>.
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              showIcon={false}
              onClick={handlePrint}
              aria-label={`Print ${doc.title}`}
              className="text-xs cursor-pointer select-none"
            >
              <span className="flex items-center gap-2">
                <Printer className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Print Document</span>
              </span>
            </Button>
          </div>
        </div>

        {/* 3. Mobile Table of Contents (Collapsible Disclosure) */}
        <div className="lg:hidden mb-8 print:hidden">
          <details className="group rounded-2xl border border-line bg-surface-alt/60 p-4 transition-all open:bg-surface-alt">
            <summary className="flex items-center justify-between cursor-pointer list-none font-display font-semibold text-sm text-ink select-none">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent" />
                <span>On this page ({doc.sections.length} sections)</span>
              </span>
              <ChevronDown className="w-4 h-4 text-ink-muted transition-transform group-open:rotate-180" />
            </summary>
            <nav aria-label="Table of contents (mobile)" className="mt-4 pt-3 border-t border-line/60">
              <ol className="space-y-2 text-xs font-body">
                {doc.sections.map((section) => (
                  <li key={section.id}>
                    <button
                      type="button"
                      onClick={(e) => handleScrollTo(section.id, e)}
                      className={`block w-full text-left py-1 px-2 rounded-md transition-colors ${
                        activeId === section.id
                          ? "bg-brand text-white font-medium"
                          : "text-ink/80 hover:text-brand hover:bg-black/5"
                      }`}
                    >
                      {section.heading}
                    </button>
                  </li>
                ))}
              </ol>
            </nav>
          </details>
        </div>

        {/* 4. Desktop Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: Sticky Desktop Table of Contents */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-28 space-y-6 print:hidden">
            <div className="rounded-2xl border border-line bg-surface-alt/40 p-5 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-accent block mb-3">
                Contents
              </span>
              <nav aria-label="Table of contents">
                <ol className="space-y-1 text-xs font-body">
                  {doc.sections.map((section) => {
                    const isActive = activeId === section.id;
                    return (
                      <li key={section.id}>
                        <a
                          href={`#${section.id}`}
                          onClick={(e) => handleScrollTo(section.id, e)}
                          aria-current={isActive ? "true" : undefined}
                          className={`block py-1.5 px-3 rounded-xl transition-all ${
                            isActive
                              ? "bg-brand text-white font-medium shadow-2xs translate-x-1"
                              : "text-ink-muted hover:text-ink hover:bg-black/5"
                          }`}
                        >
                          {section.heading}
                        </a>
                      </li>
                    );
                  })}
                </ol>
              </nav>
            </div>

            {/* Quick cross-link card */}
            <div className="rounded-2xl border border-line p-5 bg-white shadow-2xs space-y-2 font-body text-xs">
              <span className="font-semibold text-ink block">Related Document</span>
              <p className="text-ink-muted leading-relaxed">
                Review our accompanying guidelines and terms.
              </p>
              <Link
                href={otherDocument.href}
                className="inline-flex items-center gap-1.5 text-brand font-semibold hover:underline pt-1"
              >
                <span>Read {otherDocument.title}</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          </aside>

          {/* Right Column: Main Readable Document Column */}
          <main
            ref={contentRef}
            className="lg:col-span-8 max-w-[740px] font-body print:max-w-none print:w-full"
          >
            {/* Introduction Lead Paragraph */}
            <div className="p-5 sm:p-6 rounded-2xl bg-surface-alt/50 border border-line mb-10 text-sm sm:text-base text-ink/90 leading-relaxed font-body">
              {doc.intro}
            </div>

            {/* Document Sections */}
            <div className="space-y-12 sm:space-y-14">
              {doc.sections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-28 space-y-4 break-inside-avoid print:break-inside-avoid"
                  aria-labelledby={`heading-${section.id}`}
                >
                  {/* Numbered Heading with Hover Anchor Link */}
                  <div className="group flex items-baseline justify-between gap-4 border-b border-line/60 pb-2">
                    <h2
                      id={`heading-${section.id}`}
                      className="font-display text-lg sm:text-xl font-bold text-ink tracking-tight"
                    >
                      {section.heading}
                    </h2>

                    <button
                      type="button"
                      onClick={() => handleCopySectionLink(section.id)}
                      title="Copy link to this section"
                      aria-label={`Copy permanent link to ${section.heading}`}
                      className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1.5 rounded-lg text-ink-muted hover:text-brand hover:bg-black/5 shrink-0 print:hidden cursor-pointer"
                    >
                      {copiedId === section.id ? (
                        <CheckCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                      ) : (
                        <LinkIcon className="w-4 h-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>

                  {/* Section Content Blocks */}
                  <div className="space-y-4 text-xs sm:text-sm text-ink/80 leading-relaxed font-body break-words">
                    {section.blocks.map((block, bIdx) => {
                      if (block.type === "paragraph") {
                        return (
                          <p key={bIdx} className="leading-relaxed">
                            {block.text}
                          </p>
                        );
                      }

                      if (block.type === "list") {
                        const ListTag = block.ordered ? "ol" : "ul";
                        return (
                          <ListTag
                            key={bIdx}
                            className={`space-y-2.5 my-3 pl-5 leading-relaxed ${
                              block.ordered
                                ? "list-decimal"
                                : "list-disc marker:text-brand"
                            }`}
                          >
                            {block.items.map((item, itemIdx) => (
                              <li key={itemIdx} className="pl-1">
                                {item}
                              </li>
                            ))}
                          </ListTag>
                        );
                      }

                      if (block.type === "note") {
                        return (
                          <LegalNoteBlock key={bIdx} note={block} />
                        );
                      }

                      return null;
                    })}
                  </div>
                </section>
              ))}
            </div>

            {/* 5. End-of-document Support Card */}
            <div className="mt-14 sm:mt-18 pt-8 border-t border-line print:hidden">
              <div className="rounded-3xl bg-surface-alt/70 border border-line p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-2xs">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-brand font-semibold text-xs uppercase tracking-wider">
                    <HelpCircle className="w-4 h-4" aria-hidden="true" />
                    <span>Questions about this document?</span>
                  </div>
                  <h3 className="font-display font-bold text-base sm:text-lg text-ink">
                    Need clarification on clinical policies or records?
                  </h3>
                  <p className="text-xs sm:text-sm text-ink-muted leading-relaxed font-body max-w-md">
                    Our administrative team and patient grievance officer are happy to address any
                    questions regarding confidentiality, care plans, or scheduling.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                  <Button href="/contact" variant="primary" size="md">
                    Contact Clinic
                  </Button>
                  <Button href={otherDocument.href} variant="ghost" size="md" showIcon={false}>
                    {otherDocument.title}
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* Accessible screen-reader live region for copy confirmation */}
        <div aria-live="polite" className="sr-only">
          {liveMessage}
        </div>
      </Container>

      {/* Embedded print styles for clean, ink-friendly output */}
      <style jsx global>{`
        @media print {
          /* Hide non-content elements */
          header,
          footer,
          nav,
          aside,
          button,
          .print\\:hidden {
            display: none !important;
          }

          /* Ensure black text on white paper */
          body,
          main,
          div,
          p,
          h1,
          h2,
          h3,
          li {
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            border-color: #cccccc !important;
          }

          /* Section page break prevention */
          section {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            margin-bottom: 2rem !important;
          }

          /* Print URLs for outbound hyperlinks */
          a[href^="http"]::after {
            content: " (" attr(href) ")";
            font-size: 80%;
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
};

interface LegalNoteBlockProps {
  note: LegalBlockNote;
}

const LegalNoteBlock: React.FC<LegalNoteBlockProps> = ({ note }) => {
  const tone = note.tone || "info";

  let containerStyles = "bg-brand/5 border-brand/20 text-brand-dark";
  let icon = <Info className="w-4 h-4 text-brand shrink-0 mt-0.5" aria-hidden="true" />;

  if (tone === "warning") {
    containerStyles = "bg-amber-50/80 border-amber-300 text-amber-950";
    icon = <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />;
  } else if (tone === "alert") {
    containerStyles = "bg-rose-50/80 border-rose-300 text-rose-950";
    icon = <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />;
  }

  return (
    <aside
      aria-label={note.title || "Note"}
      className={`my-4 p-4 sm:p-5 rounded-2xl border text-xs sm:text-sm font-body shadow-2xs ${containerStyles}`}
    >
      <div className="flex items-start gap-3">
        {icon}
        <div className="space-y-1 flex-1">
          {note.title && (
            <h4 className="font-semibold text-xs uppercase tracking-wider">
              {note.title}
            </h4>
          )}
          <p className="leading-relaxed opacity-95">{note.text}</p>
        </div>
      </div>
    </aside>
  );
};

export default LegalLayout;
