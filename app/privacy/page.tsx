import { Metadata } from "next";
import { siteConfig } from "@/data/site";
import { privacyPolicyData } from "@/data/legal";
import { LegalLayout } from "@/components/sections/legal";

export const metadata: Metadata = {
  title: "Privacy Policy | GuruOm Dental",
  description:
    "Learn how GuruOm Dental protects your confidentiality, handles online appointment inquiries, and complies with healthcare data privacy standards.",
  alternates: {
    canonical: `${siteConfig.url}/privacy`,
  },
  openGraph: {
    title: "Privacy Policy | GuruOm Dental",
    description:
      "Patient data privacy, appointment request handling, and medical records confidentiality protocols at GuruOm Dental.",
    url: `${siteConfig.url}/privacy`,
    siteName: siteConfig.name,
    type: "website",
  },
};

export default function PrivacyPage() {
  return (
    <LegalLayout
      document={privacyPolicyData}
      otherDocument={{
        title: "Terms & Conditions",
        href: "/terms",
      }}
    />
  );
}
