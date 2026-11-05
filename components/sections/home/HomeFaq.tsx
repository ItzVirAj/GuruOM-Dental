"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, HelpCircle } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Accordion, AccordionItemData } from "@/components/ui/Accordion";
import { homeFaqs } from "@/data/home";
import { buildFaqJsonLd } from "@/src/lib/faq-schema";

export const HomeFaq: React.FC = () => {
  const faqJsonLd = buildFaqJsonLd(homeFaqs);

  const accordionItems: AccordionItemData[] = homeFaqs.map((item) => ({
    id: item.id,
    title: item.question,
    content: (
      <p className="text-sm text-ink-muted leading-relaxed pt-1">
        {item.answer}
      </p>
    ),
  }));

  return (
    <section
      aria-labelledby="home-faq-heading"
      className="py-16 sm:py-20 md:py-24 bg-surface/30 border-b border-line"
    >
      {/* FAQPage JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Container>
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand">
              Help & Answers
            </span>
            <h2
              id="home-faq-heading"
              className="text-display-md sm:text-display-lg font-display text-ink tracking-tight mt-1"
            >
              Common questions.
            </h2>
            <p className="mt-2 text-sm sm:text-base text-ink-muted max-w-lg mx-auto">
              Everything you need to know about your visits, emergency support, insurance, and clinical hygiene.
            </p>
          </div>

          {/* Accordion */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-line shadow-soft">
            <Accordion items={accordionItems} headingLevel="h3" />
          </div>

          {/* Footer Assistance */}
          <div className="mt-8 text-center flex flex-col sm:flex-row items-center justify-center gap-2 text-xs sm:text-sm text-ink-muted">
            <span className="flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-brand" />
              Have more questions about our treatments or financing?
            </span>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1 font-semibold text-brand hover:underline underline-offset-4"
            >
              <span>Contact our front desk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
};

