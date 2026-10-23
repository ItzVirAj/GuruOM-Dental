import type { Metadata } from "next";
import { PageHeader, Container } from "@/components/ui";
import {
  QuickContactCards,
  ContactForm,
  ContactInfoColumn,
  MapBlock,
  ContactCtaBand,
} from "@/components/sections/contact";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Contact Us | GuruOm Dental",
  description:
    "Get in touch with GuruOm Dental in Ahilyanagar. Call, WhatsApp, email, or visit our clinic. View real-time clinic opening hours, location directions, and emergency contact.",
  openGraph: {
    title: "Contact Us | GuruOm Dental",
    description:
      "Get in touch with GuruOm Dental in Ahilyanagar. Direct phone, WhatsApp, location directions, and enquiry desk.",
    url: `${siteConfig.url}/contact`,
    siteName: siteConfig.name,
    type: "website",
  },
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  // Generate LocalBusiness / Dentist JSON-LD using strictly verified siteConfig data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dentist",
    name: siteConfig.name,
    url: `${siteConfig.url}/contact`,
    telephone: siteConfig.phone,
    email: siteConfig.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: `${siteConfig.address.line1}, ${siteConfig.address.line2}`,
      addressLocality: siteConfig.address.city,
      addressRegion: siteConfig.address.state,
      postalCode: siteConfig.address.postalCode,
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: siteConfig.coordinates.lat,
      longitude: siteConfig.coordinates.lng,
    },
    openingHoursSpecification: siteConfig.openingHours
      .filter((h) => !h.isClosed && h.open && h.close)
      .map((h) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: h.day,
        opens: h.open,
        closes: h.close,
      })),
  };

  return (
    <main id="main-content" className="bg-white min-h-screen">
      {/* 1. Structured Data Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 2. Page Header */}
      <PageHeader
        eyebrow="Contact Us"
        title="We'd love to hear from you."
        description="Have questions about dental treatments, insurance coverage, or our clinic location? Reach our patient coordination desk directly or send us an enquiry."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Contact" },
        ]}
      />

      {/* 3. Quick Contact Channels (Call, WhatsApp, Email, Directions) */}
      <QuickContactCards />

      {/* 4. Main Two-Column Block: Form & Info Column */}
      <section aria-label="Contact form and clinic schedule" className="py-14 sm:py-16 md:py-20 bg-white">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* LEFT: Contact Form Card */}
            <div className="lg:col-span-7 xl:col-span-8">
              <ContactForm />
            </div>

            {/* RIGHT: Opening Hours, Emergency Callout & Social Links */}
            <div className="lg:col-span-5 xl:col-span-4">
              <ContactInfoColumn />
            </div>
          </div>
        </Container>
      </section>

      {/* 5. Map Block (Privacy-safe placeholder until requested) */}
      <MapBlock />

      {/* 6. Direct Booking CTA Band */}
      <ContactCtaBand />
    </main>
  );
}
