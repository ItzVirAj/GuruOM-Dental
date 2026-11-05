import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { LabsContactView } from "@/components/sections/contact";
import { siteConfig } from "@/data/site";
import { labs } from "@/data/labs";

export const metadata: Metadata = {
  title: "Contact Labs & Service Areas | GuruOm Dental",
  description:
    "Direct mobile numbers and email contacts for GuruOm Dental's in-house precision laboratories and regional service areas across Maharashtra.",
  openGraph: {
    title: "Contact Labs & Service Areas | GuruOm Dental",
    description:
      "Direct mobile numbers and email contacts for GuruOm Dental's in-house precision laboratories and regional service areas.",
    url: `${siteConfig.url}/contact`,
    siteName: siteConfig.name,
    type: "website",
  },
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalOrganization",
    name: siteConfig.name,
    url: `${siteConfig.url}/contact`,
    telephone: siteConfig.phone,
    email: siteConfig.email,
    department: labs.map((l) => ({
      "@type": "MedicalBusiness",
      name: `${siteConfig.name} - ${l.name} (${l.type === "lab" ? "Digital Lab" : "Service Area"})`,
      telephone: l.phone || siteConfig.phone,
      email: l.email || siteConfig.email,
      address: {
        "@type": "PostalAddress",
        addressLocality: l.name,
        addressRegion: "Maharashtra",
        addressCountry: "IN",
      },
    })),
  };

  return (
    <main id="main-content" className="bg-surface min-h-screen">
      {/* 1. Structured Data Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 2. Apple-Style Page Header */}
      <PageHeader
        eyebrow="Network Directory"
        title="Labs & Service Areas"
        description="Direct contact details for our in-house digital precision laboratories and regional clinical service hubs across Maharashtra."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Contact" },
        ]}
      />

      {/* 3. Labs and Service Areas Directory */}
      <LabsContactView />
    </main>
  );
}
