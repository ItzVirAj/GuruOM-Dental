import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { DoctorsList } from "@/components/sections";
import { doctorsData } from "@/data/doctors";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Our Doctors & Specialists",
  description:
    "Meet the team behind your smile at GuruOm Dental. Experienced implantologists, aesthetic smile designers, orthodontists, and pediatric dentists in Ahilyanagar.",
  openGraph: {
    title: "Our Doctors & Specialists | GuruOm Dental",
    description:
      "Meet the team behind your smile at GuruOm Dental. Experienced implantologists, aesthetic smile designers, orthodontists, and pediatric dentists in Ahilyanagar.",
    url: `${siteConfig.url}/doctors`,
    siteName: siteConfig.name,
    type: "website",
  },
  alternates: {
    canonical: "/doctors",
  },
};

export default function DoctorsPage() {
  return (
    <>
      {/* 1. Shared Upgraded PageHeader */}
      <PageHeader
        eyebrow="Our Doctors"
        title="Meet the team behind your smile"
        description="Our clinical specialists bring decades of advanced surgical training, microscopic endodontics, and digital smile engineering to ensure calm, predictable dental health."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Doctors" },
        ]}
      />

      {/* 2. Interactive Directory: Stats, GSAP Flip Filter, Grid & CTA */}
      <DoctorsList doctors={doctorsData} />
    </>
  );
}
