import { describe, it, expect } from "vitest";
import {
  stripXmlControlChars,
  escapeXml,
  formatRfc822Date,
  buildRssFeed,
} from "@/src/lib/rss";
import { buildFaqJsonLd } from "@/src/lib/faq-schema";
import { contactReasons } from "@/data/site";
import { servicesData } from "@/data/services";
import { doctorsData } from "@/data/doctors";
import type { PublicBlogPost } from "@/src/server/blog/types";

describe("Public Site: RSS Feed Utilities", () => {
  it("strips disallowed XML 1.0 control characters while preserving valid characters", () => {
    // \x00 (NUL), \x07 (BEL), \x1F (US) should be stripped
    // \t (\x09), \n (\x0A), \r (\x0D) must be preserved
    const raw = "Clean\x00Text\x07With\tTabs\nAnd\rNewlines\x1FEnd";
    const cleaned = stripXmlControlChars(raw);
    expect(cleaned).toBe("CleanTextWith\tTabs\nAnd\rNewlinesEnd");
  });

  it("escapes XML special entities properly", () => {
    const raw = `Teeth & Gums: <Dr. "Om's" Clinic>`;
    const escaped = escapeXml(raw);
    expect(escaped).toBe(
      "Teeth &amp; Gums: &lt;Dr. &quot;Om&apos;s&quot; Clinic&gt;"
    );
  });

  it("formats dates to standard RFC 822 GMT format", () => {
    const dateStr = "2026-03-08T12:00:00.000Z";
    const formatted = formatRfc822Date(dateStr);
    expect(formatted).toMatch(/^[A-Za-z]{3},\s\d{2}\s[A-Za-z]{3}\s\d{4}\s\d{2}:\d{2}:\d{2}\sGMT$/);
    expect(formatted).toContain("GMT");

    // Fallback for invalid input
    const invalidFormatted = formatRfc822Date("not-a-date");
    expect(invalidFormatted).toContain("GMT");
  });

  it("builds valid RSS 2.0 XML with atom:link self", () => {
    const mockPosts: PublicBlogPost[] = [
      {
        slug: "post-1",
        title: "Painless Cleaning & Scaling",
        excerpt: "Learn how modern ultrasonic scaling prevents gum disease.",
        category: "hygiene",
        categoryLabel: "Dental Hygiene",
        publishedAt: "2026-03-01T10:00:00.000Z",
        authorName: "Dr. Ananya Mehta",
        authorRole: "Periodontist",
        tags: ["cleaning", "gums"],
        featured: false,
        readingTimeMinutes: 4,
        content: [],
      },
    ];

    const xml = buildRssFeed(mockPosts);

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">');
    expect(xml).toContain('<atom:link href="https://guruomdental.com/feed.xml" rel="self" type="application/rss+xml"/>');
    expect(xml).toContain("<title>Painless Cleaning &amp; Scaling</title>");
    expect(xml).toContain("<link>https://guruomdental.com/blog/post-1</link>");
    expect(xml).toContain("<guid isPermaLink=\"true\">https://guruomdental.com/blog/post-1</guid>");
    expect(xml).toContain("<author>Dr. Ananya Mehta</author>");
    expect(xml).toContain("<category>Dental Hygiene</category>");
  });
});

describe("Public Site: Contact & Careers Integration", () => {
  it("includes 'careers' in valid contactReasons", () => {
    const careerReason = contactReasons.find((r) => r.value === "careers");
    expect(careerReason).toBeDefined();
    expect(careerReason?.label).toContain("Careers");
  });

  it("validates known vs unknown contact reasons", () => {
    const validValues = contactReasons.map((r) => r.value);
    expect(validValues.includes("careers")).toBe(true);
    expect(validValues.includes("general")).toBe(true);
    expect(validValues.includes("invalid_reason")).toBe(false);
  });
});

describe("Public Site: Service to Doctor Specialty Matching", () => {
  it("every service matches at least one doctor in doctorsData by specialty", () => {
    for (const service of servicesData) {
      expect(service.doctorSpecialties).toBeDefined();
      expect(service.doctorSpecialties.length).toBeGreaterThan(0);

      const matchingDocs = doctorsData.filter((doc) =>
        doc.specialties.some((s) => service.doctorSpecialties.includes(s))
      );

      expect(
        matchingDocs.length,
        `Service "${service.slug}" has no matching doctors for specialties: ${service.doctorSpecialties.join(", ")}`
      ).toBeGreaterThan(0);
    }
  });
});

describe("Public Site: FAQ JSON-LD Schema", () => {
  it("builds valid schema.org FAQPage structured data object", () => {
    const testFaqs = [
      { question: "What are your hours?", answer: "We are open Monday to Saturday." },
      { question: "Do you accept emergency visits?", answer: "Yes, 24/7 on-call." },
    ];

    const jsonLd = buildFaqJsonLd(testFaqs);

    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@type"]).toBe("FAQPage");
    expect(jsonLd.mainEntity).toHaveLength(2);

    expect(jsonLd.mainEntity[0]["@type"]).toBe("Question");
    expect(jsonLd.mainEntity[0].name).toBe("What are your hours?");
    expect(jsonLd.mainEntity[0].acceptedAnswer["@type"]).toBe("Answer");
    expect(jsonLd.mainEntity[0].acceptedAnswer.text).toBe("We are open Monday to Saturday.");
  });
});

