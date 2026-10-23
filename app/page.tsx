import {
  Hero,
  Philosophy,
  Stats,
  GalleryStrip,
  ScopeOfCare,
  Services,
  Comparison,
  CheckupStack,
} from "@/components/sections";

export default function Home() {
  return (
    <>
      {/* 1. Main Immersive Hero Section */}
      <Hero />

      {/* Target anchor for Hero scroll indicator and subsequent sections */}
      <div id="hero-next" tabIndex={-1} aria-hidden="true" />

      {/* 2. Our Philosophy Pinned Slides Section */}
      <Philosophy />

      {/* 3. Impact in Numbers Stats Section */}
      <Stats />

      {/* 4. Inside GuruOm Dental Gallery Strip */}
      <GalleryStrip />

      {/* 5. Scope of Care Interactive Accordion Section */}
      <ScopeOfCare />

      {/* 6. Featured Services Grid Section */}
      <Services />

      {/* 7. GuruOm vs Common Practice Comparison Section */}
      <Comparison />

      {/* 8. What We Check Sticky Stacking Cards Section */}
      <CheckupStack />
    </>
  );
}
