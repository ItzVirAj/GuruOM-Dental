import { siteConfig } from "./site";

export interface TrustChip {
  id: string;
  label: string;
  icon: "doctor" | "hygiene" | "emergency";
}

export interface RatingCardData {
  score: string;
  count: string;
  quote: string;
  author: string;
  location: string;
}

export interface MiniStat {
  value: string;
  label: string;
}

export interface HeroContent {
  eyebrow: string;
  headline: string;
  subheading: string;
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta: {
    label: string;
    href: string;
  };
  trustChips: TrustChip[];
  ratingCard: RatingCardData;
  statsStrip: MiniStat[];
}

export interface AboutIntroHelpLine {
  label: string;
  value: string;
  href: string;
}

export interface AboutIntroContent {
  eyebrow: string;
  title: string;
  paragraph: string;
  quote: {
    text: string;
    icon: string;
  };
  cta: {
    label: string;
    href: string;
  };
  helpCard: {
    title: string;
    lines: AboutIntroHelpLine[];
  };
}

export const heroContent: HeroContent = {
  eyebrow: `Trusted dental care in ${siteConfig.address.city || "your city"}`,
  headline: "Healthy smiles, gently cared for.",
  subheading:
    "Founded in 2019 in Ahilyanagar (Ahmednagar), Guru-Om Dental began with a vision to transform dental care. Our founder, Dr. Guruprasad Handal, a passionate Prosthodontist, envisioned the future of digital dentistry. Embracing innovation, we transitioned from conventional practices to digital dentistry, pioneering a new era of precision and excellence.",
  primaryCta: {
    label: "Book Appointment",
    href: "/appointment",
  },
  secondaryCta: {
    label: "Our Services",
    href: "/services",
  },
  trustChips: [
    {
      id: "doctors",
      label: "Expert Doctors",
      icon: "doctor",
    },
    {
      id: "hygiene",
      label: "Strict Hygiene",
      icon: "hygiene",
    },
    {
      id: "emergency",
      label: "Emergency Support",
      icon: "emergency",
    },
  ],
  ratingCard: {
    score: "4.9",
    count: "2,000+ happy patients",
    quote: "Painless and comfortable from start to finish.",
    author: "Pooja Sharma",
    location: siteConfig.address.city || "City",
  },
  statsStrip: [
    { value: "15+", label: "Years Experience" },
    { value: "10k+", label: "Smiles Restored" },
    { value: "100%", label: "Sterile Facility" },
  ],
};

// ============================================================================
// About Intro Section Content (Homepage)
// ============================================================================

// Replace with the clinic's real story. Do not publish founding years, awards or numbers that are not true.
export const aboutIntroContent: AboutIntroContent = {
  eyebrow: "About GuruOm Dental",
  title: "Pioneering Gentle Care with Advanced Digital Dental Precision",
  paragraph:
    "At GuruOm Dental, we unite clinical warmth with leading-edge restorative technology to make every visit calm and predictable. From computer-guided implantology to microscope-assisted restorations, our dedicated team focuses on preserving your natural teeth with minimal intervention. We believe exceptional oral health begins with patient comfort, transparent guidance, and uncompromising standards of care.",
  quote: {
    text: "To restore healthy, confident smiles through patient-centered compassion, clinical mastery, and digital innovation.",
    icon: "Sparkles",
  },
  cta: {
    label: "More About Us",
    href: "/about",
  },
  helpCard: {
    title: "Need help?",
    lines: [
      {
        label: "Clinic Desk",
        value: siteConfig.phone,
        href: `tel:${siteConfig.phone.replace(/[^+\d]/g, "")}`,
      },
      {
        label: "Emergency & WhatsApp",
        value: siteConfig.emergencyPhone,
        href: `tel:${siteConfig.emergencyPhone.replace(/[^+\d]/g, "")}`,
      },
    ],
  },
};

// ============================================================================
// Stats & Impact Section Content
// ============================================================================

export interface StatItem {
  id: string;
  value: string;
  prefix?: string;
  suffix?: string;
  label: string;
  description: string;
}

export interface StatsContent {
  eyebrow: string;
  title: string;
  intro: string;
  stats: StatItem[];
}

export const statsContent: StatsContent = {
  eyebrow: "Our Impact in Numbers",
  title: "Precision care, measurable results.",
  intro:
    "Over eight years of clinical mastery, advanced digital dental infrastructure, and collaborative partnerships delivering predictable restorative outcomes.",
  stats: [
    {
      id: "years-of-trust",
      value: "8",
      suffix: "+",
      label: "Years of Trust",
      description: "Dedicated speciality care delivered with compassion and integrity.",
    },
    {
      id: "doctors-network",
      value: "800",
      suffix: "+",
      label: "Doctors Working With Us",
      description: "Trusted dental surgeons and clinical practitioners partnering with our digital labs across Maharashtra.",
    },
    {
      id: "happy-smiles",
      value: "25",
      suffix: "k+",
      label: "Happy Smiles",
      description: "Families living with restored oral confidence and healthy bites.",
    },
    {
      id: "patient-satisfaction",
      value: "98",
      suffix: "%",
      label: "Patient Satisfaction",
      description: "Rated five stars for gentle, stress-free clinical experiences.",
    },
  ],
};

// ============================================================================
// Gallery Strip Content
// ============================================================================

export interface GalleryItem {
  id: string;
  label: string;
  imageSlot: string;
}

export interface GalleryContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  items: GalleryItem[];
}

export const galleryContent: GalleryContent = {
  eyebrow: "Inside GuruOm Dental",
  title: "Where clinical science meets refined aesthetics.",
  subtitle: "A visual tour across our advanced operatory suites, 3D imaging lab, and serene patient lounge.",
  items: [
    { id: "preventive", label: "Preventive", imageSlot: "gallery1" },
    { id: "oral-surgery", label: "Oral Surgery", imageSlot: "gallery2" },
    { id: "laser-care", label: "Laser Care", imageSlot: "gallery3" },
    { id: "cosmetic", label: "Cosmetic", imageSlot: "gallery4" },
    { id: "implants", label: "Implants", imageSlot: "gallery5" },
    { id: "orthodontics", label: "Orthodontics", imageSlot: "gallery6" },
    { id: "pediatric", label: "Pediatric", imageSlot: "gallery7" },
    { id: "emergency", label: "Emergency", imageSlot: "gallery8" },
  ],
};

// ============================================================================
// Services Grid Section Content
// ============================================================================

export interface ServicesSectionContent {
  eyebrow: string;
  title: string;
  intro: string;
  cta: {
    label: string;
    href: string;
  };
  featuredSlugs: string[];
}

export const servicesSectionContent: ServicesSectionContent = {
  eyebrow: "What We Treat",
  title: "Complete dental care for every age.",
  intro:
    "Explore our full spectrum of specialized dental treatments, combining advanced hospital-grade technology with personalized, compassionate patient care.",
  cta: {
    label: "View All Services",
    href: "/services",
  },
  featuredSlugs: [
    "general-dentistry",
    "cleaning-whitening",
    "orthodontics-aligners",
    "dental-implants",
  ],
};

// ============================================================================
// What We Check (Checkup Stack) Section Content
// ============================================================================

export type CheckupTone = "brand" | "accent" | "dark" | "white" | "alt";

export interface CheckupCard {
  id: string;
  number: string;
  title: string;
  summary: string;
  checklist: string[];
  duration: string;
  imageSlot: string;
  tone: CheckupTone;
}

export interface CheckupContent {
  eyebrow: string;
  title: string;
  intro: string;
  cta: {
    label: string;
    href: string;
  };
  cards: CheckupCard[];
}

export const checkupContent: CheckupContent = {
  eyebrow: "Your Checkup, Explained",
  title: "Five checks that protect your smile.",
  intro:
    "Every comprehensive examination at GuruOm Dental combines advanced optical diagnostics, low-radiation imaging, and holistic soft tissue reviews to detect issues long before they cause discomfort.",
  cta: {
    label: "Book a Checkup",
    href: "/appointment",
  },
  cards: [
    {
      id: "cavity-screening",
      number: "01",
      title: "Teeth & Cavity Screening",
      summary:
        "High-definition intraoral macro photography and transillumination detect micro-fissures and incipient decay before cavities reach sensitive dentin. Our dentists inspect every enamel surface, previous restoration margin, and developmental groove with magnification loupes.",
      checklist: [
        "High-magnification optical loupes",
        "Painless transillumination scan",
        "Enamel micro-fissure mapping",
        "Restoration margin evaluation",
      ],
      duration: "10 min",
      imageSlot: "checkup1",
      tone: "dark",
    },
    {
      id: "gum-health",
      number: "02",
      title: "Gum Health Assessment",
      summary:
        "Sub-millimeter periodontal probing maps gum attachment levels to intercept early gingivitis and hidden bone loss around natural teeth. We identify microbial bio-film buildup and evaluate soft tissue inflammation to safeguard the foundational anchor of your smile.",
      checklist: [
        "6-point periodontal pocket chart",
        "Gingival bleeding index review",
        "Bacterial bio-film detection",
        "Customized home-care plan",
      ],
      duration: "12 min",
      imageSlot: "checkup2",
      tone: "brand",
    },
    {
      id: "digital-imaging",
      number: "03",
      title: "Digital X-ray & Imaging",
      summary:
        "Green sensor ultra-low radiation panoramic and bite-wing radiographs reveal hidden interproximal cavities and root canal anatomies invisible to the naked eye. Scans appear instantly on chairside 4K monitors so you clearly see what our specialists see.",
      checklist: [
        "90% lower radiation sensor",
        "Instant chairside 4K display",
        "Interproximal bone density check",
        "Hidden root pathology detection",
      ],
      duration: "8 min",
      imageSlot: "checkup3",
      tone: "accent",
    },
    {
      id: "bite-alignment",
      number: "04",
      title: "Bite & Jaw Alignment",
      summary:
        "Digital occlusal analysis evaluates how your upper and lower arches meet to prevent abnormal tooth wear, cracked cusps, and temporomandibular joint (TMJ) strain. We balance chewing dynamics to protect your facial muscle harmony and restorative longevity.",
      checklist: [
        "TMJ joint range & click check",
        "Occlusal wear facet assessment",
        "Nighttime bruxism screening",
        "Bite force distribution analysis",
      ],
      duration: "10 min",
      imageSlot: "checkup4",
      tone: "white",
    },
    {
      id: "oral-cancer-screening",
      number: "05",
      title: "Oral Cancer Screening",
      summary:
        "A gentle tactile and visual examination of the tongue, palate, inner cheeks, and cervical lymph nodes screens for early mucosal abnormalities and lesions. Early detection is painless, takes only moments, and offers vital peace of mind for your whole health.",
      checklist: [
        "Mucosal tissue visual examination",
        "Tongue and salivary duct check",
        "Cervical lymph node palpation",
        "Rapid pathology referral pathway",
      ],
      duration: "5 min",
      imageSlot: "checkup5",
      tone: "alt",
    },
  ],
};

export default aboutIntroContent;
