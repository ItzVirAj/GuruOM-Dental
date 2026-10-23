"use client";

import React, { useState, useMemo } from "react";
import { pricingFaqs, PricingFaqItem, FaqCategory } from "@/data/pricing";
import { Container, Accordion, AccordionItemData } from "@/components/ui";

export interface PricingFaqProps {
  faqs?: PricingFaqItem[];
}

const categories: ("All" | FaqCategory)[] = [
  "All",
  "Pricing",
  "Appointments",
  "Treatments",
  "Insurance",
];

export function PricingFaq({ faqs = pricingFaqs }: PricingFaqProps) {
  const [activeCategory, setActiveCategory] = useState<"All" | FaqCategory>("All");

  // Filter FAQs based on active category
  const filteredFaqs = useMemo(() => {
    if (activeCategory === "All") return faqs;
    return faqs.filter((faq) => faq.category === activeCategory);
  }, [faqs, activeCategory]);

  // Convert to AccordionItemData format
  const accordionItems: AccordionItemData[] = useMemo(() => {
    return filteredFaqs.map((faq) => ({
      id: faq.id,
      title: faq.question,
      content: <p>{faq.answer}</p>,
      badge: activeCategory === "All" ? faq.category : undefined,
    }));
  }, [filteredFaqs, activeCategory]);

  // Complete FAQPage JSON-LD structured data generated from ALL faqs
  const faqJsonLd = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        "name": faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    };
  }, [faqs]);

  return (
    <section
      id="faq"
      className="py-16 sm:py-20 lg:py-24 bg-surface"
      aria-labelledby="pricing-faq-heading"
    >
      {/* FAQPage JSON-LD Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Container>
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-brand mb-2">
            Clear Answers
          </span>

          <h2
            id="pricing-faq-heading"
            className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-ink leading-tight mb-3.5"
          >
            Frequently asked questions
          </h2>

          <p className="text-body text-ink-muted leading-relaxed max-w-xl font-body">
            Have questions about clinical insurance claims, treatment milestones, or our no-hidden-cost guarantee? Find your answer below.
          </p>

          {/* Category Filter Pills */}
          <div className="mt-8 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
            <div
              role="group"
              aria-label="FAQ categories filter"
              className="inline-flex items-center gap-1.5 p-1 rounded-full bg-surface-alt border border-surface-alt/90 shadow-inner min-w-max mx-auto"
            >
              {categories.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                      isActive
                        ? "bg-brand text-white shadow-xs"
                        : "text-ink-muted hover:text-ink"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Accordion Container (Single open at a time with GSAP height animation) */}
        <div className="max-w-3xl mx-auto rounded-3xl bg-surface border border-surface-alt/90 p-4 sm:p-8 shadow-xs">
          <Accordion
            items={accordionItems}
            defaultOpenId={accordionItems[0]?.id || null}
            headingLevel="h3"
          />
        </div>
      </Container>
    </section>
  );
}

export default PricingFaq;
