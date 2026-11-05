import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, HelpCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { Accordion, type AccordionItemData } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { servicesData, STANDARD_CLINICAL_DISCLAIMER } from "@/data/services";
import { ServicesCatalogGrid } from "@/components/sections/services/ServicesCatalogGrid";
import { ServicesVisitSteps } from "@/components/sections/services/ServicesVisitSteps";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Clinical Dental Services & Treatments",
  description:
    "Explore comprehensive dental treatments at GuruOm Dental in Ahilyanagar: general examinations, clear aligners, dental implants, root canal therapy, teeth whitening, and pediatric dentistry.",
  openGraph: {
    title: "Clinical Dental Services & Treatments | GuruOm Dental",
    description:
      "Precision dentistry rooted in biological tooth preservation. Comprehensive dental procedures for patients across Ahilyanagar and Central Maharashtra.",
    url: `${siteConfig.url}/services`,
    siteName: siteConfig.name,
    type: "website",
  },
  alternates: {
    canonical: "/services",
  },
};

const generalFaqs: AccordionItemData[] = [
  {
    id: "services-faq-consultation",
    title: "How do I know which dental treatment is right for me?",
    content: (
      <p className="text-xs sm:text-sm text-ink-muted leading-relaxed font-body">
        During your initial consultation, your dentist performs high-magnification intraoral
        examinations and digital imaging. We explain clinical findings, outline treatment
        alternatives, and provide transparent estimates so you can make an informed choice with no pressure.
      </p>
    ),
  },
  {
    id: "services-faq-pain",
    title: "Are dental treatments at GuruOm Dental comfortable and pain-free?",
    content: (
      <p className="text-xs sm:text-sm text-ink-muted leading-relaxed font-body">
        Yes. We use computerized local anesthesia, gentle ultrasonic instruments, and surgical
        magnification loupes. Our calm operatory atmosphere and gentle clinical technique ensure
        that procedures remain tranquil from start to finish.
      </p>
    ),
  },
  {
    id: "services-faq-same-day",
    title: "Can I begin treatment on the day of my first examination?",
    content: (
      <p className="text-xs sm:text-sm text-ink-muted leading-relaxed font-body">
        Yes. In many cases—including teeth cleanings, emergency pain relief, optical 3D scans,
        or routine fillings—treatment can begin immediately following your diagnostic examination if you choose.
      </p>
    ),
  },
  {
    id: "services-faq-pricing",
    title: "How are treatment fees structured and presented?",
    content: (
      <p className="text-xs sm:text-sm text-ink-muted leading-relaxed font-body">
        We provide written, itemized treatment plans before beginning any clinical procedure. There
        are no hidden sterilization surcharges or unexpected add-ons. Flexible payment and EMI options
        are available for comprehensive procedures.
      </p>
    ),
  },
];

export default function ServicesPage() {
  return (
    <main id="main-content" className="bg-white min-h-screen">
      {/* 1. Page Header */}
      <PageHeader
        eyebrow="Our Services"
        title="Comprehensive Dental Care for Every Smile"
        description="Every treatment at GuruOm Dental pairs European dental technology with tissue-preserving protocols and transparent care."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Services" },
        ]}
      />

      {/* 2. Intro Statement & Catalog Grid */}
      <section
        aria-labelledby="services-catalog-heading"
        className="py-14 sm:py-16 lg:py-20 bg-white"
      >
        <Container>
          <div className="max-w-2xl mb-12 sm:mb-16">
            <Eyebrow variant="dot" color="accent">
              Clinical Catalog
            </Eyebrow>
            <h2
              id="services-catalog-heading"
              className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-ink tracking-tight mt-2"
            >
              Treatments engineered for longevity.
            </h2>
            <p className="text-sm sm:text-base text-ink-muted mt-3 font-body leading-relaxed">
              Explore our core procedures below. From routine preventive prophylaxis to
              specialized 3D-guided implant surgery, we treat every patient with unhurried
              attention and biological preservation.
            </p>
          </div>

          <ServicesCatalogGrid services={servicesData} />

          {/* Clinical Disclaimer Notice */}
          <div className="mt-12 p-4 rounded-2xl bg-surface border border-line text-center text-xs text-ink-muted font-body">
            <p>
              <strong className="text-ink font-semibold">Please Note: </strong>
              {STANDARD_CLINICAL_DISCLAIMER} (Replace with the clinic&apos;s real information)
            </p>
          </div>
        </Container>
      </section>

      {/* 3. How a Visit Works (4-Step Strip) */}
      <ServicesVisitSteps />

      {/* 4. General FAQs Accordion */}
      <section
        aria-labelledby="services-faq-heading"
        className="py-16 sm:py-20 lg:py-24 bg-white"
      >
        <Container className="max-w-4xl">
          <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16">
            <Eyebrow variant="dot" color="accent" className="justify-center">
              Frequently Asked Questions
            </Eyebrow>
            <h2
              id="services-faq-heading"
              className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-ink tracking-tight mt-2"
            >
              Common questions about care.
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted mt-3 font-body">
              Everything you need to know about scheduling, treatment pathways, and clinic visits.
            </p>
          </div>

          <Accordion items={generalFaqs} defaultOpenId="services-faq-consultation" />

          <div className="mt-10 text-center">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline underline-offset-4"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Have questions about fees? View our transparent pricing guide</span>
            </Link>
          </div>
        </Container>
      </section>

      {/* 5. Not sure which treatment you need? CTA Band */}
      <section
        aria-labelledby="services-cta-heading"
        className="py-14 sm:py-16 bg-surface border-t border-line"
      >
        <Container>
          <div className="rounded-3xl bg-brand-dark text-white p-8 sm:p-12 lg:p-14 relative overflow-hidden shadow-2xl">
            {/* Subtle Gradient Glow */}
            <div
              className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-accent/20 blur-3xl pointer-events-none"
              aria-hidden="true"
            />

            <div className="relative z-10 max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-accent block font-body mb-2">
                Personalized Clinical Triage
              </span>
              <h2
                id="services-cta-heading"
                className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-balance leading-tight"
              >
                Not sure which treatment you need?
              </h2>
              <p className="text-xs sm:text-sm sm:text-base text-white/80 mt-3 font-body leading-relaxed max-w-xl">
                Book an unhurried consultation. Our dental specialists will examine your teeth,
                answer your questions, and formulate a step-by-step care plan tailored to you.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button href="/contact" variant="primary">
                  Contact Our Clinic
                </Button>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/20 text-xs sm:text-sm font-medium text-white hover:bg-white/10 transition-colors min-h-[44px]"
                >
                  <span>Explore Care Plans & Pricing</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
