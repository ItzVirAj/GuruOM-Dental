import { Metadata } from "next";
import { siteConfig } from "@/data/site";
import { termsOfServiceData } from "@/data/legal";
import { LegalLayout } from "@/components/sections/legal";

export const metadata: Metadata = {
  title: "Terms & Conditions | GuruOm Dental",
  description:
    "Patient guidelines, appointment scheduling policies, fee estimates, and website terms of use for GuruOm Dental.",
  alternates: {
    canonical: `${siteConfig.url}/terms`,
  },
  openGraph: {
    title: "Terms & Conditions | GuruOm Dental",
    description:
      "Website usage terms, clinical disclaimers, and consultation scheduling policies at GuruOm Dental.",
    url: `${siteConfig.url}/terms`,
    siteName: siteConfig.name,
    type: "website",
  },
};

export default function TermsPage() {
  return (
    <LegalLayout
      document={termsOfServiceData}
      otherDocument={{
        title: "Privacy Policy",
        href: "/privacy",
      }}
    />
  );
}
