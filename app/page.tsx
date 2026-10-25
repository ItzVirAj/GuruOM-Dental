import {
  Hero,
  AboutIntro,
  Stats,
  GalleryStrip,
  LabsMap,
  Services,
} from "@/components/sections";

export default function Home() {
  return (
    <>
      {/* 1. Main Immersive Hero Section */}
      <Hero />

      {/* Target anchor for Hero scroll indicator and subsequent sections */}
      <div id="hero-next" tabIndex={-1} aria-hidden="true" />

      {/* 2. About Us Introduction Section */}
      <AboutIntro />

      {/* 3. Impact in Numbers Stats Section */}
      <Stats />

      {/* 4. Inside GuruOm Dental Gallery Strip */}
      <GalleryStrip />

      {/* 5. Our Lab & Service Network Across Maharashtra (3D Isometric Map) */}
      <LabsMap />

      {/* 6. Featured Services Grid Section */}
      <Services />
    </>
  );
}
