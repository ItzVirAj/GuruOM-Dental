import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import {
  PricingPlans,
  PriceList,
  PaymentOptions,
  PricingFaq,
  PricingCta,
} from "@/components/sections/pricing";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Transparent Treatment Pricing & Care Plans",
  description:
    "Clear, upfront treatment estimates, zero hidden fees, and flexible preventive care plans at GuruOm Dental in Ahilyanagar.",
  openGraph: {
    title: "Transparent Treatment Pricing & Care Plans | GuruOm Dental",
    description:
      "Clear, upfront treatment estimates, zero hidden fees, and flexible preventive care plans at GuruOm Dental in Ahilyanagar.",
    url: `${siteConfig.url}/pricing`,
    siteName: siteConfig.name,
    type: "website",
  },
  alternates: {
    canonical: "/pricing",
  },
};

export default function PricingPage() {
  return (
    <>
      {/* 1. Shared Upgraded PageHeader */}
      <PageHeader
        eyebrow="Transparent Pricing"
        title="Clear prices, no surprises."
        description="We believe financial clarity is an essential foundation of comfortable healthcare. Explore our monthly care memberships and itemized clinical fee estimates."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Pricing" },
        ]}
      />

      {/* 2. Care Plans with Billing Toggle (Surface Background) */}
      <PricingPlans />

      {/* 3. Itemized Treatment Price Table with Category Tabs (Alt Background) */}
      <PriceList />

      {/* 4. Payment & Financing Options (White Background) */}
      <PaymentOptions />

      {/* 5. FAQs with Accessible Accordion & FAQPage JSON-LD (Surface Background) */}
      <PricingFaq />

      {/* 6. Final Questions Consultation CTA Band (Brand-Dark Background) */}
      <PricingCta />
    </>
  );
}
