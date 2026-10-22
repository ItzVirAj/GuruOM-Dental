export type AspectRatio = "1/1" | "4/3" | "3/4" | "16/9" | "21/9" | "4/5";

export interface ImageSlot {
  id: string;
  src: string;
  alt: string;
  ratio: AspectRatio;
  label: string;
  recommendedSize: string;
}

export const plannedImages: Record<string, ImageSlot> = {
  // Brand & Navigation
  logo: {
    id: "logo",
    src: "",
    alt: "GuruOm Dental emblem logo symbol",
    ratio: "1/1",
    label: "Logo Mark (200x200)",
    recommendedSize: "200x200",
  },
  navPromo: {
    id: "navPromo",
    src: "",
    alt: "Mega menu promo image showcasing first visit consultation",
    ratio: "4/5",
    label: "Mega menu promo image (800x1000)",
    recommendedSize: "800x1000",
  },
  footerCta: {
    id: "footerCta",
    src: "",
    alt: "Footer consultation decorative banner",
    ratio: "16/9",
    label: "Footer CTA Preview (1280x720)",
    recommendedSize: "1280x720",
  },

  // Hero section
  hero: {
    id: "hero",
    src: "",
    alt: "GuruOm Dental modern clinical sanctuary with state-of-the-art dental chairs",
    ratio: "16/9",
    label: "Hero Clinic Atmosphere (1920x1080)",
    recommendedSize: "1920x1080",
  },

  // Philosophy & Values (1-4)
  philosophy1: {
    id: "philosophy1",
    src: "",
    alt: "Microscopic dental precision tool in sterile environment",
    ratio: "4/3",
    label: "Philosophy: Precision Tech (1200x900)",
    recommendedSize: "1200x900",
  },
  philosophy2: {
    id: "philosophy2",
    src: "",
    alt: "Calm consultation lounge with natural sunlight",
    ratio: "4/3",
    label: "Philosophy: Calm Environment (1200x900)",
    recommendedSize: "1200x900",
  },
  philosophy3: {
    id: "philosophy3",
    src: "",
    alt: "Doctor discussing digital smile mockup with patient",
    ratio: "4/3",
    label: "Philosophy: Transparent Care (1200x900)",
    recommendedSize: "1200x900",
  },
  philosophy4: {
    id: "philosophy4",
    src: "",
    alt: "Zero-pain anesthetic delivery system",
    ratio: "4/3",
    label: "Philosophy: Pain-Free Protocol (1200x900)",
    recommendedSize: "1200x900",
  },

  // Gallery (1-8)
  gallery1: {
    id: "gallery1",
    src: "",
    alt: "Porcelain veneer smile transformation before and after",
    ratio: "4/3",
    label: "Gallery: Veneer Makeover (800x600)",
    recommendedSize: "800x600",
  },
  gallery2: {
    id: "gallery2",
    src: "",
    alt: "Guided implant placement 3D surgical guide",
    ratio: "4/3",
    label: "Gallery: Implantology Case (800x600)",
    recommendedSize: "800x600",
  },
  gallery3: {
    id: "gallery3",
    src: "",
    alt: "Clear aligner treatment progression",
    ratio: "4/3",
    label: "Gallery: Clear Aligners (800x600)",
    recommendedSize: "800x600",
  },
  gallery4: {
    id: "gallery4",
    src: "",
    alt: "Full mouth rehabilitation smile aesthetic",
    ratio: "4/3",
    label: "Gallery: Full Mouth Rehab (800x600)",
    recommendedSize: "800x600",
  },
  gallery5: {
    id: "gallery5",
    src: "",
    alt: "High magnification endodontic microscope in action",
    ratio: "4/3",
    label: "Gallery: Micro Endodontics (800x600)",
    recommendedSize: "800x600",
  },
  gallery6: {
    id: "gallery6",
    src: "",
    alt: "Laser gum recontouring aesthetic outcome",
    ratio: "4/3",
    label: "Gallery: Laser Periodontics (800x600)",
    recommendedSize: "800x600",
  },
  gallery7: {
    id: "gallery7",
    src: "",
    alt: "Sterilization room with Class-B autoclaves",
    ratio: "4/3",
    label: "Gallery: Sterilization Suite (800x600)",
    recommendedSize: "800x600",
  },
  gallery8: {
    id: "gallery8",
    src: "",
    alt: "Patient relaxation suite with sensory calming view",
    ratio: "4/3",
    label: "Gallery: Relaxation Suite (800x600)",
    recommendedSize: "800x600",
  },

  // Services (1-4)
  service1: {
    id: "service1",
    src: "",
    alt: "Aesthetic porcelain smile design consultation",
    ratio: "16/9",
    label: "Service: Cosmetic Smile Makeover (1280x720)",
    recommendedSize: "1280x720",
  },
  service2: {
    id: "service2",
    src: "",
    alt: "Precision titanium dental implant fixture",
    ratio: "16/9",
    label: "Service: Swiss Dental Implants (1280x720)",
    recommendedSize: "1280x720",
  },
  service3: {
    id: "service3",
    src: "",
    alt: "Microscopic dental illumination during root canal",
    ratio: "16/9",
    label: "Service: Microscopic RCT (1280x720)",
    recommendedSize: "1280x720",
  },
  service4: {
    id: "service4",
    src: "",
    alt: "Invisible clear orthodontic aligner trays",
    ratio: "16/9",
    label: "Service: Clear Aligners (1280x720)",
    recommendedSize: "1280x720",
  },

  // Testing & Diagnostics (1-5)
  testing1: {
    id: "testing1",
    src: "",
    alt: "Low-radiation 3D CBCT maxillofacial scanner",
    ratio: "1/1",
    label: "Diagnostics: 3D CBCT Imaging (600x600)",
    recommendedSize: "600x600",
  },
  testing2: {
    id: "testing2",
    src: "",
    alt: "High-speed digital intraoral 3D scanner wand",
    ratio: "1/1",
    label: "Diagnostics: Intraoral Scanner (600x600)",
    recommendedSize: "600x600",
  },
  testing3: {
    id: "testing3",
    src: "",
    alt: "Digital occlusal analysis system",
    ratio: "1/1",
    label: "Diagnostics: Digital Bite Scan (600x600)",
    recommendedSize: "600x600",
  },
  testing4: {
    id: "testing4",
    src: "",
    alt: "Laser caries fluorescence detection wand",
    ratio: "1/1",
    label: "Diagnostics: Laser Caries Detection (600x600)",
    recommendedSize: "600x600",
  },
  testing5: {
    id: "testing5",
    src: "",
    alt: "Aesthetic digital shade matching spectrophotometer",
    ratio: "1/1",
    label: "Diagnostics: Shade Spectrophotometry (600x600)",
    recommendedSize: "600x600",
  },

  // Doctors (1-5)
  doctor1: {
    id: "doctor1",
    src: "",
    alt: "Dr. Om Patel - Chief Implantologist",
    ratio: "3/4",
    label: "Doctor: Dr. Om Patel (900x1200)",
    recommendedSize: "900x1200",
  },
  doctor2: {
    id: "doctor2",
    src: "",
    alt: "Dr. Guru Sharma - Endodontic & Aesthetic Specialist",
    ratio: "3/4",
    label: "Doctor: Dr. Guru Sharma (900x1200)",
    recommendedSize: "900x1200",
  },
  doctor3: {
    id: "doctor3",
    src: "",
    alt: "Dr. Priya Desai - Orthodontist & Aligner Specialist",
    ratio: "3/4",
    label: "Doctor: Dr. Priya Desai (900x1200)",
    recommendedSize: "900x1200",
  },
  doctor4: {
    id: "doctor4",
    src: "",
    alt: "Dr. Ananya Mehta - Pediatric Dentist",
    ratio: "3/4",
    label: "Doctor: Dr. Ananya Mehta (900x1200)",
    recommendedSize: "900x1200",
  },
  doctor5: {
    id: "doctor5",
    src: "",
    alt: "Dr. Siddharth Joshi - Periodontist & Laser Surgeon",
    ratio: "3/4",
    label: "Doctor: Dr. Siddharth Joshi (900x1200)",
    recommendedSize: "900x1200",
  },

  // Testimonials (1-3)
  testimonial1: {
    id: "testimonial1",
    src: "",
    alt: "Patient portrait after successful implant therapy",
    ratio: "1/1",
    label: "Testimonial: Patient 1 (400x400)",
    recommendedSize: "400x400",
  },
  testimonial2: {
    id: "testimonial2",
    src: "",
    alt: "Patient portrait after full veneer smile design",
    ratio: "1/1",
    label: "Testimonial: Patient 2 (400x400)",
    recommendedSize: "400x400",
  },
  testimonial3: {
    id: "testimonial3",
    src: "",
    alt: "Patient portrait after aligner treatment",
    ratio: "1/1",
    label: "Testimonial: Patient 3 (400x400)",
    recommendedSize: "400x400",
  },

  // CTA Section
  cta: {
    id: "cta",
    src: "",
    alt: "Welcoming reception and clinical sanctuary at GuruOm Dental",
    ratio: "21/9",
    label: "CTA Banner: Clinic Exterior/Lounge (2100x900)",
    recommendedSize: "2100x900",
  },

  // Blogs (1-2)
  blog1: {
    id: "blog1",
    src: "",
    alt: "Comparison guide between dental implants and dental bridges",
    ratio: "16/9",
    label: "Blog: Implants vs Bridges (1200x675)",
    recommendedSize: "1200x675",
  },
  blog2: {
    id: "blog2",
    src: "",
    alt: "Modern painless root canal procedure explanation",
    ratio: "16/9",
    label: "Blog: Modern Root Canals (1200x675)",
    recommendedSize: "1200x675",
  },
};

export default plannedImages;
