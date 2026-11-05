import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Sparkles,
  Phone,
  ArrowRight,
  ShieldAlert,
  UserCheck,
} from "lucide-react";
import { servicesData, STANDARD_CLINICAL_DISCLAIMER } from "@/data/services";
import { doctorsData } from "@/data/doctors";
import { siteConfig } from "@/data/site";
import { getLivePostsForService } from "@/src/server/blog/queries";
import { formatDate } from "@/src/lib/blog-format";
import { CloudinaryImage } from "@/components/ui/CloudinaryImage";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { SmartImage } from "@/components/ui/SmartImage";
import { Button } from "@/components/ui/Button";
import { Accordion, type AccordionItemData } from "@/components/ui/Accordion";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ServiceDetailTimeline } from "@/components/sections/services/ServiceDetailTimeline";
import { ServiceStickyBar } from "@/components/sections/services/ServiceStickyBar";

export function generateStaticParams() {
  return servicesData.map((service) => ({
    slug: service.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = servicesData.find((s) => s.slug === slug);
  if (!service) return { title: "Service Not Found" };

  return {
    title: `${service.title} | GuruOm Dental`,
    description: service.seoDescription || service.shortDescription,
    openGraph: {
      title: `${service.title} | GuruOm Dental Ahilyanagar`,
      description: service.shortDescription,
      url: `${siteConfig.url}/services/${service.slug}`,
      siteName: siteConfig.name,
      type: "website",
    },
    alternates: {
      canonical: `/services/${service.slug}`,
    },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = servicesData.find((s) => s.slug === slug);

  if (!service) {
    notFound();
  }

  // Find up to 3 matching doctors by specialty
  const matchingDoctors = doctorsData
    .filter((doc) =>
      service.doctorSpecialties.some((spec) => doc.specialties.includes(spec))
    )
    .slice(0, 3);

  // Fetch up to 3 live articles referencing this treatment
  const relatedArticles = await getLivePostsForService(service.slug, 3);

  // Related services (3 other services)
  const relatedServices = servicesData
    .filter((s) => s.slug !== service.slug)
    .slice(0, 3);

  // Map service FAQs to Accordion format
  const serviceFaqItems: AccordionItemData[] = service.faqs.map((f, i) => ({
    id: `faq-${service.slug}-${i}`,
    title: f.question,
    content: (
      <p className="text-xs sm:text-sm text-ink-muted leading-relaxed font-body">
        {f.answer}
      </p>
    ),
  }));

  // JSON-LD: 1. Service schema (strictly NO price, rating, or review claims)
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.shortDescription,
    provider: {
      "@type": "Dentist",
      name: siteConfig.name,
      telephone: siteConfig.phone,
      address: {
        "@type": "PostalAddress",
        streetAddress: `${siteConfig.address.line1}, ${siteConfig.address.line2}`,
        addressLocality: siteConfig.address.city,
        addressRegion: siteConfig.address.state,
        postalCode: siteConfig.address.postalCode,
        addressCountry: "IN",
      },
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Ahilyanagar",
    },
  };

  // JSON-LD: 2. FAQPage schema for this service's FAQs only
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: service.faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };

  return (
    <main id="main-content" className="bg-white min-h-screen">
      {/* Structured Data: Service + FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* 1. Page Header */}
      <PageHeader
        eyebrow="Specialized Care"
        title={service.title}
        description={service.shortDescription}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: service.title },
        ]}
      />

      {/* 2. Main Two-Column Treatment Content */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* LEFT COLUMN: Clinical Content */}
            <div className="lg:col-span-8 space-y-12 sm:space-y-16">
              {/* A. Clinical Overview */}
              <div className="space-y-4">
                <Eyebrow variant="dot" color="accent">
                  Treatment Overview
                </Eyebrow>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink tracking-tight">
                  About this procedure.
                </h2>
                <div className="space-y-4 text-sm sm:text-base text-ink-muted font-body leading-relaxed">
                  <p>{service.overview[0]}</p>
                  <p>{service.overview[1]}</p>
                </div>
              </div>

              {/* B. Who it's for */}
              <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-line space-y-5">
                <div className="flex items-center gap-2.5">
                  <UserCheck className="w-5 h-5 text-brand" />
                  <h3 className="font-display text-lg sm:text-xl font-bold text-ink">
                    Who it&apos;s for
                  </h3>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {service.idealFor.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-ink-muted font-body"
                    >
                      <CheckCircle2 className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* C. What to expect (Scrubbed Vertical Timeline) */}
              <div className="space-y-4">
                <Eyebrow variant="dot" color="accent">
                  Clinical Process
                </Eyebrow>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink tracking-tight">
                  What to expect during care.
                </h2>
                <p className="text-xs sm:text-sm text-ink-muted font-body">
                  A predictable, four-stage protocol engineered for biological comfort and lasting results.
                </p>

                <ServiceDetailTimeline steps={service.processSteps} />
              </div>

              {/* D. Benefits */}
              <div className="space-y-4">
                <Eyebrow variant="dot" color="accent">
                  Key Advantages
                </Eyebrow>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink tracking-tight">
                  Clinical benefits of care.
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  {service.benefits.map((benefit, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-surface border border-line flex items-start gap-3"
                    >
                      <Sparkles className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                      <p className="text-xs sm:text-sm font-medium text-ink font-body leading-snug">
                        {benefit}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* E. Aftercare Guidance */}
              <div className="p-6 sm:p-8 rounded-3xl bg-brand/5 border border-brand/20 space-y-4">
                <div className="flex items-center gap-2 text-brand">
                  <ShieldAlert className="w-5 h-5" />
                  <h3 className="font-display text-lg sm:text-xl font-bold text-ink">
                    Aftercare & Recovery Guidance
                  </h3>
                </div>
                <p className="text-xs text-ink-muted font-body">
                  Follow these essential recommendations post-treatment to support tissue healing and longevity:
                </p>
                <ul className="space-y-2.5 pt-2">
                  {service.aftercare.map((tip, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-ink font-body"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0 mt-2" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* F. FAQs Accordion */}
              <div className="space-y-5 pt-4">
                <div className="space-y-1">
                  <Eyebrow variant="dot" color="accent">
                    Treatment Questions
                  </Eyebrow>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink tracking-tight">
                    Frequently asked questions.
                  </h2>
                </div>

                <Accordion items={serviceFaqItems} defaultOpenId={`faq-${service.slug}-0`} />
              </div>

              {/* G. Standard Clinical Disclaimer */}
              <div className="p-4 rounded-2xl bg-surface border border-line text-xs text-ink-muted font-body leading-relaxed">
                <strong className="text-ink font-semibold">Important Clinical Note: </strong>
                {STANDARD_CLINICAL_DISCLAIMER} (Replace with the clinic&apos;s real information)
              </div>
            </div>

            {/* RIGHT COLUMN: Sticky Booking & Details Card */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
              <div className="rounded-3xl bg-surface border border-line p-6 sm:p-7 shadow-soft space-y-6">
                {/* Image */}
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-surface-alt">
                  <SmartImage
                    slot={service.imageSlot}
                    ratio="16/10"
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Treatment Details */}
                <div className="space-y-3 pt-2 border-t border-line/60">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-ink-muted flex items-center gap-1.5 font-body">
                      <Clock className="w-3.5 h-3.5 text-brand" />
                      Estimated Duration
                    </span>
                    <span className="font-semibold text-ink font-body">
                      {service.duration}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-ink-muted flex items-center gap-1.5 font-body">
                      <Sparkles className="w-3.5 h-3.5 text-accent-deep" />
                      Starting Price
                    </span>
                    <span className="font-bold text-brand font-display">
                      {service.startingPrice}
                    </span>
                  </div>

                  <p className="text-[11px] text-ink-muted/80 font-body italic pt-1">
                    *Placeholder fee note: Final fee is determined during examination. See{" "}
                    <Link href="/pricing" className="text-brand underline hover:text-brand-dark">
                      our pricing guide
                    </Link>
                    .
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-2">
                  <Button
                    href={`/appointment?service=${service.slug}`}
                    variant="primary"
                    className="w-full justify-center shadow-md min-h-[48px]"
                  >
                    Book this treatment
                  </Button>

                  <a
                    href={`tel:${siteConfig.phone.replace(/[\s\-\(\)]/g, "")}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full border border-line bg-white hover:bg-black/5 text-ink text-xs font-semibold transition-colors min-h-[44px]"
                  >
                    <Phone className="w-3.5 h-3.5 text-brand" />
                    <span>Call {siteConfig.phone}</span>
                  </a>
                </div>
              </div>

              {/* Doctors for this treatment */}
              {matchingDoctors.length > 0 && (
                <div className="rounded-3xl bg-white border border-line p-6 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-brand font-body block">
                      Clinical Team
                    </span>
                    <h3 className="font-display text-base font-bold text-ink">
                      Doctors for this treatment
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {matchingDoctors.map((doc) => (
                      <div
                        key={doc.slug}
                        className="flex items-center gap-3.5 p-3 rounded-2xl bg-surface border border-line/60"
                      >
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-surface-alt shrink-0">
                          <SmartImage
                            slot={doc.imageSlot}
                            alt={doc.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-display text-xs font-bold text-ink truncate">
                            {doc.name}
                          </h4>
                          <p className="text-[11px] text-brand truncate font-body">
                            {doc.role}
                          </p>
                          <span className="text-[10px] text-ink-muted">
                            {doc.experienceYears}+ Yrs Experience
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* 3. Below the Content: Articles about this treatment (when present) */}
      {relatedArticles.length > 0 && (
        <section
          aria-labelledby="treatment-articles-heading"
          className="py-14 sm:py-16 bg-surface border-t border-line"
        >
          <Container>
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-brand block font-body">
                    Clinical Guides & Research
                  </span>
                  <h3
                    id="treatment-articles-heading"
                    className="font-display text-2xl sm:text-3xl font-bold text-ink tracking-tight mt-1"
                  >
                    Articles about this treatment
                  </h3>
                </div>
                <Link
                  href="/blog"
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline underline-offset-4"
                >
                  <span>All articles</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                {relatedArticles.map((post) => (
                  <article
                    key={post.slug}
                    className="group flex flex-col justify-between rounded-3xl bg-white border border-line p-5 sm:p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card hover:border-brand/40"
                  >
                    <Link href={`/blog/${post.slug}`} className="flex flex-col flex-1">
                      <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-surface-alt mb-4">
                        {post.coverMedia ? (
                          <CloudinaryImage
                            src={post.coverMedia.publicId}
                            alt={post.coverAltOverride || post.coverMedia.alt || post.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 380px"
                            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                          />
                        ) : (
                          <SmartImage
                            slot={post.coverSlot || undefined}
                            alt={post.title}
                            ratio="16/10"
                            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                          />
                        )}
                      </div>

                      <span className="text-[11px] font-semibold text-brand uppercase tracking-wider font-body mb-1">
                        {post.categoryLabel || post.category}
                      </span>
                      <h4 className="font-display text-base font-bold text-ink group-hover:text-brand transition-colors line-clamp-2">
                        {post.title}
                      </h4>
                      <p className="text-xs text-ink-muted line-clamp-2 mt-2 font-body">
                        {post.excerpt}
                      </p>
                    </Link>

                    <div className="mt-4 pt-4 border-t border-line/60 flex items-center justify-between text-[11px] text-ink-muted">
                      <span>{formatDate(post.publishedAt)}</span>
                      <span>{post.readingTimeMinutes || 4} min read</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* 4. Below the Content: Related Services (3) */}
      <section
        aria-labelledby="related-services-heading"
        className="py-14 sm:py-16 bg-white border-t border-line"
      >
        <Container>
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-accent-deep block font-body">
                  Complementary Care
                </span>
                <h3
                  id="related-services-heading"
                  className="font-display text-2xl sm:text-3xl font-bold text-ink tracking-tight mt-1"
                >
                  Related treatments
                </h3>
              </div>
              <Link
                href="/services"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline underline-offset-4"
              >
                <span>View all treatments</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {relatedServices.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/services/${rel.slug}`}
                  className="group flex flex-col justify-between p-6 rounded-3xl bg-surface border border-line shadow-soft transition-all duration-300 hover:border-brand/40 hover:-translate-y-1 hover:shadow-card"
                >
                  <div>
                    <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-5 bg-surface-alt">
                      <SmartImage
                        slot={rel.imageSlot}
                        ratio="16/10"
                        alt={rel.title}
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                    </div>
                    <h4 className="font-display text-lg font-bold text-ink group-hover:text-brand transition-colors">
                      {rel.title}
                    </h4>
                    <p className="text-xs text-ink-muted line-clamp-2 mt-2 font-body">
                      {rel.shortDescription}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-line/60 flex items-center justify-between text-xs">
                    <span className="font-bold text-brand font-display">
                      {rel.startingPrice}
                    </span>
                    <span className="font-semibold text-brand inline-flex items-center gap-1">
                      Explore <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* 5. Mobile Sticky Booking Bar */}
      <ServiceStickyBar
        slug={service.slug}
        title={service.title}
        startingPrice={service.startingPrice}
      />
    </main>
  );
}
