export interface FaqItemSchema {
  question: string;
  answer: string;
}

/**
 * Builds schema.org FAQPage structured data object.
 */
export function buildFaqJsonLd(faqs: FaqItemSchema[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

