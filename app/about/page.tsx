import type { Metadata } from "next";
import {
  AboutHero,
  AboutFounders,
  AboutStoryBento,
  AboutTechBento,
  AboutValues,
  AboutNetwork,
  AboutCta,
} from "@/components/sections/about";

export const metadata: Metadata = {
  title: "About Us | GuruOm Dental & Digital Dental Lab",
  description:
    "Founded in 2019 in Ahilyanagar by Dr. Guruprasad Handal and Dr. Akshata Handal. Pioneering digital dentistry across Maharashtra with intraoral 3D scanners, robotic CAD/CAM milling, and DMLS 3D metal printing.",
  openGraph: {
    title: "About GuruOm Dental — Pioneering Digital Dentistry",
    description:
      "Rooted in biological preservation and driven by digital precision. Discover our journey from Ahilyanagar's earliest intraoral scanner to Central Maharashtra's largest emerging digital lab.",
    url: "https://guruomdental.com/about",
    siteName: "GuruOm Dental",
    images: [
      {
        url: "/images/DRGuruprasad.jpeg",
        width: 800,
        height: 1066,
        alt: "Dr. Guruprasad Handal and Dr. Akshata Handal - GuruOm Dental",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-surface">
      {/* 1. Apple Keynote Hero with Floating Key Metrics Ribbon */}
      <AboutHero />

      {/* 2. Executive Leadership Spotlight: Dr. Guruprasad & Dr. Akshata Handal */}
      <AboutFounders />

      {/* 3. The Evolutionary Odyssey: Apple Narrative Bento Grid */}
      <AboutStoryBento />

      {/* 4. In-House Digital Infrastructure: DMLS, 3D Scanners, 5-Axis CAD/CAM */}
      <AboutTechBento />

      {/* 5. Guiding Philosophy: Four Clinical Pillars */}
      <AboutValues />

      {/* 6. Working Centres (3 Labs) & Services Across 30+ Cities */}
      <AboutNetwork />

      {/* 7. Apple Cinematic Dark Finale CTA */}
      <AboutCta />
    </main>
  );
}
