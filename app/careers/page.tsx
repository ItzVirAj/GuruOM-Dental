import type { Metadata } from "next";
import {
  GraduationCap,
  Users,
  Heart,
  ShieldCheck,
  Briefcase,
  CheckCircle2,
  Clock,
  MapPin,
} from "lucide-react";
import { PageHeader, Container, Button } from "@/components/ui";
import { Accordion, AccordionItemData } from "@/components/ui/Accordion";
import { careerValues, hiringSteps, openings } from "@/data/careers";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Careers & Clinical Opportunities | GuruOm Dental",
  description:
    "Explore clinical and patient-care opportunities at GuruOm Dental in Ahilyanagar. Learn about our values, hiring process, and practice standards.",
  openGraph: {
    title: "Careers | GuruOm Dental",
    description:
      "Explore clinical and dental assistant career opportunities at GuruOm Dental. Dedicated to evidence-based dentistry, respectful teamwork, and patient safety.",
    url: `${siteConfig.url}/careers`,
    siteName: siteConfig.name,
    type: "website",
  },
  alternates: {
    canonical: "/careers",
  },
};

const valueIcons = {
  learning: GraduationCap,
  teamwork: Users,
  patientCare: Heart,
  fairTreatment: ShieldCheck,
};

export default function CareersPage() {
  const jsonLdPostings = openings
    .filter((o) => o.jsonLd && o.title && o.summary && o.postedOn)
    .map((o) => ({
      "@context": "https://schema.org",
      "@type": "JobPosting",
      title: o.title,
      description: o.summary,
      datePosted: o.postedOn,
      employmentType: o.type.toUpperCase().replace(/\s+/g, "_"),
      hiringOrganization: {
        "@type": "Organization",
        name: siteConfig.name,
        sameAs: siteConfig.url,
      },
      jobLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressLocality: siteConfig.address.city,
          addressRegion: siteConfig.address.state,
          postalCode: siteConfig.address.postalCode,
          addressCountry: "IN",
        },
      },
    }));

  const accordionItems: AccordionItemData[] = openings.map((item) => ({
    id: item.slug,
    title: `${item.title} (${item.type})`,
    badge: item.department,
    content: (
      <div className="space-y-4 pt-2">
        <p className="text-sm text-ink-muted leading-relaxed">{item.summary}</p>
        <div className="flex flex-wrap gap-4 text-xs text-ink-muted">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-brand" />
            {item.location}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-brand" />
            {item.type}
          </span>
        </div>

        {item.responsibilities && item.responsibilities.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-ink uppercase tracking-wider mb-2">
              Key Responsibilities
            </h4>
            <ul className="space-y-1.5 text-xs text-ink-muted">
              {item.responsibilities.map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand shrink-0 mt-0.5" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {item.requirements && item.requirements.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-ink uppercase tracking-wider mb-2">
              Requirements & Qualifications
            </h4>
            <ul className="space-y-1.5 text-xs text-ink-muted">
              {item.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand shrink-0 mt-0.5" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-2">
          <Button
            href={`/contact?reason=careers&role=${item.slug}`}
            variant="primary"
            size="sm"
          >
            Apply for this role
          </Button>
        </div>
      </div>
    ),
  }));

  return (
    <main id="main-content" className="bg-white min-h-screen">
      {/* 1. JobPosting Structured Data (Only if active openings with jsonLd: true) */}
      {jsonLdPostings.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              jsonLdPostings.length === 1 ? jsonLdPostings[0] : jsonLdPostings
            ),
          }}
        />
      )}

      {/* 2. Page Header */}
      <PageHeader
        eyebrow="Join Our Clinical Team"
        title="Careers at GuruOm Dental"
        description="Work alongside dedicated clinicians committed to biological tooth preservation, modern digital precision, and compassionate patient care in Ahilyanagar."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Careers" },
        ]}
      />

      {/* 3. Clinic Values */}
      <section
        aria-label="Our clinical values"
        className="py-14 sm:py-16 md:py-20 bg-surface/40 border-b border-line"
      >
        <Container>
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand">
              Practice Principles
            </span>
            <h2 className="text-display-sm sm:text-display-md font-display text-ink tracking-tight mt-1">
              What it means to practice with us.
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              We cultivate a relaxed, unhurried operatory culture where clinical excellence and patient well-being always come before volume.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {careerValues.map((val) => {
              const Icon = valueIcons[val.icon] || GraduationCap;
              return (
                <div
                  key={val.title}
                  className="bg-white rounded-2xl p-6 border border-line shadow-soft flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-semibold text-ink font-display mb-2">
                      {val.title}
                    </h3>
                    <p className="text-xs text-ink-muted leading-relaxed">
                      {val.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* 4. Hiring Steps */}
      <section
        aria-label="Our hiring process"
        className="py-14 sm:py-16 md:py-20 bg-white border-b border-line"
      >
        <Container>
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand">
              How We Connect
            </span>
            <h2 className="text-display-sm sm:text-display-md font-display text-ink tracking-tight mt-1">
              Our 4-step dialogue.
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              We respect your clinical time. Our process is designed to be clear, transparent, and focused on mutual clinical fit.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {hiringSteps.map((step) => (
              <div
                key={step.step}
                className="bg-surface/30 rounded-2xl p-6 border border-line flex flex-col"
              >
                <span className="font-mono text-xs font-bold text-brand uppercase tracking-wider mb-3">
                  Step {step.step}
                </span>
                <h3 className="text-sm font-semibold text-ink font-display mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 5. Open Positions / Friendly Empty State */}
      <section
        id="openings"
        aria-label="Current opportunities"
        className="py-14 sm:py-16 md:py-20 bg-white"
      >
        <Container>
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand">
                Current Opportunities
              </span>
              <h2 className="text-display-sm sm:text-display-md font-display text-ink tracking-tight mt-1">
                Open Positions
              </h2>
            </div>

            {openings.length > 0 ? (
              <Accordion items={accordionItems} headingLevel="h3" />
            ) : (
              <div className="bg-surface/50 border border-line rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mx-auto">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold font-display text-ink">
                  No active openings at this moment
                </h3>
                <p className="text-sm text-ink-muted leading-relaxed">
                  While we do not have an active opening listed right now, we are always glad to connect with skilled dentists, oral hygienists, and clinical assistants who share our values.
                </p>
                <div className="pt-2">
                  <Button
                    href="/contact?reason=careers"
                    variant="primary"
                    size="md"
                  >
                    Send general careers enquiry
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Container>
      </section>
    </main>
  );
}
