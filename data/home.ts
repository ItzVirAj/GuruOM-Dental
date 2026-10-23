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

export interface PhilosophySlide {
  id: string;
  number: string;
  title: string;
  text: string;
  imageSlot: string;
}

export interface PhilosophyContent {
  eyebrow: string;
  title: string;
  intro: string;
  slides: PhilosophySlide[];
}

export const heroContent: HeroContent = {
  eyebrow: `Trusted dental care in ${siteConfig.address.city || "your city"}`,
  headline: "Healthy smiles, gently cared for.",
  subheading:
    "Experience calm, hospital-grade dentistry with our team of specialists. Precision 3D diagnostics, painless treatments, and comprehensive care for your whole family.",
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

export const philosophyContent: PhilosophyContent = {
  eyebrow: "OUR PHILOSOPHY",
  title: "Trusted Dental Care for a Brighter Smile.",
  intro:
    "At the heart of our practice is a commitment to precision and patient comfort. We don't just treat symptoms; we focus on the long-term health and vitality of your smile.",
  slides: [
    {
      id: "diagnostic-accuracy",
      number: "01",
      title: "Diagnostic Accuracy",
      text: "This is skeleton filler text, written only to keep the shape alive. It does not carry meaning, it does not aim to convince, it simply marks the rhythm of where real words will eventually go. Like bones under the skin, this placeholder creates a frame that can stand without flesh.",
      imageSlot: "philosophy1",
    },
    {
      id: "gentle-care",
      number: "02",
      title: "Gentle, Anxiety-Free Care",
      text: "A dental visit should never be an ordeal. Through sound-dampening operatory suites, compassionate communication, and computer-controlled gentle anesthetic delivery, we create a tranquil treatment experience that removes anxiety entirely.",
      imageSlot: "philosophy2",
    },
    {
      id: "minimally-invasive",
      number: "03",
      title: "Modern, Minimally Invasive Treatment",
      text: "Our conservative philosophy preserves your natural tooth enamel whenever possible. By using micro-dentistry optics and premium biocompatible ceramics, we ensure restorations are exceptionally durable, aesthetically seamless, and gentle on surrounding gum tissue.",
      imageSlot: "philosophy3",
    },
    {
      id: "hospital-grade-hygiene",
      number: "04",
      title: "Hospital-Grade Hygiene",
      text: "Uncompromising patient safety is our highest ethical obligation. Our clinic adheres to multi-barrier autoclave sterilization, medical-grade ultrasonic cleansing, and continuous HEPA air exchange so every instrument and surface is completely sterile.",
      imageSlot: "philosophy4",
    },
  ],
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
    "Over fifteen years of patient-centered dentistry, advanced hospital-grade technology, and specialized clinical care reflected in real restorative outcomes.",
  stats: [
    {
      id: "years-of-trust",
      value: "15",
      suffix: "+",
      label: "Years of Trust",
      description: "Dedicated speciality care delivered with compassion and integrity.",
    },
    {
      id: "treatment-success",
      value: "99.9",
      suffix: "%",
      label: "Treatment Success",
      description: "Documented success rate in restorative, implant, and laser therapies.",
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
// Scope of Care Accordion Content
// ============================================================================

export interface ScopeItem {
  id: string;
  number?: string;
  icon: "tooth" | "heart-pulse" | "dna" | "droplet";
  title: string;
  text: string;
  highlights?: string[];
  imageSlot: string;
  imageSrc?: string;
}

export interface ScopeContent {
  eyebrow?: string;
  title: string;
  intro?: string;
  cta?: {
    label: string;
    href: string;
  };
  items: ScopeItem[];
}

export const scopeContent: ScopeContent = {
  eyebrow: "Our Scope of Care",
  title: "The Scope of Our Care",
  intro:
    "From routine preventive cleanings to complex 3D guided surgical reconstructions, our multidisciplinary clinic delivers integrated dental expertise with a gentle touch.",
  cta: {
    label: "View All Services",
    href: "/services",
  },
  items: [
    {
      id: "diagnostic-accuracy",
      number: "01",
      icon: "tooth",
      title: "Diagnostic Accuracy",
      text: "It completely eliminates the need for traditional, messy, and gag-inducing putty impressions. Patients love the comfort, speed, and seeing a live 3D model of their teeth on screen instantly.",
      imageSlot: "scope1",
      imageSrc: "/images/scope/scope-diagnostic.jpg",
    },
    {
      id: "systemic-recovery",
      number: "02",
      icon: "heart-pulse",
      title: "Systemic Recovery",
      text: "Supports total body wellness through calm, biologically aligned restorative care, gentle sedation options, and zero-anxiety clinical protocols designed for comprehensive recovery.",
      imageSlot: "scope2",
      imageSrc: "/images/scope/scope-recovery.jpg",
    },
    {
      id: "biological-integrity",
      number: "03",
      icon: "dna",
      title: "Biological Integrity",
      text: "We preserve your natural tooth structure using micro-dentistry optics, biocompatible metal-free ceramics, and adhesive bonding engineered for maximum longevity and biological harmony.",
      imageSlot: "scope3",
      imageSrc: "/images/scope/scope-integrity.jpg",
    },
    {
      id: "preventive-hygiene",
      number: "04",
      icon: "droplet",
      title: "Preventive Hygiene",
      text: "It completely eliminates the need for traditional, messy, and gag-inducing putty impressions. Patients love the comfort, speed, and seeing a live 3D model of their teeth on screen instantly.",
      imageSlot: "scope4",
      imageSrc: "/images/scope/scope-hygiene.jpg",
    },
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
// GuruOm vs Common Practice Comparison Section Content
// ============================================================================

export interface ComparisonRow {
  id: string;
  feature: string;
  usValue: string | boolean;
  themValue: string | boolean;
}

export interface ComparisonContent {
  eyebrow: string;
  title: string;
  intro: string;
  columns: {
    us: string;
    them: string;
  };
  rows: ComparisonRow[];
}

export const comparisonContent: ComparisonContent = {
  eyebrow: "Why GuruOm Dental",
  title: "The difference you can feel.",
  intro:
    "We believe dentistry should be transparent, unhurried, and comfortable. Here is how our commitment to patient-first care sets us apart.",
  columns: {
    us: "GuruOm Dental",
    them: "Common Practice",
  },
  rows: [
    {
      id: "imaging",
      feature: "Digital X-rays & 3D CBCT Imaging",
      usValue: "Ultra-low radiation 3D scans with instant chairside review",
      themValue: "Traditional 2D film with delays & higher radiation",
    },
    {
      id: "sterilization",
      feature: "Hospital-Grade Sterilization Protocol",
      usValue: "Multi-barrier Class-B autoclaving & vacuum sealed pouches",
      themValue: "Standard basic chemical disinfection",
    },
    {
      id: "painless-injections",
      feature: "Painless Computer-Guided Injections",
      usValue: true,
      themValue: false,
    },
    {
      id: "transparent-pricing",
      feature: "Transparent Upfront Itemized Pricing",
      usValue: "Fixed quote provided in writing before treatment begins",
      themValue: "Hidden charges & surprise mid-treatment additions",
    },
    {
      id: "emergency-slots",
      feature: "Dedicated Same-Day Emergency Slots",
      usValue: true,
      themValue: false,
    },
    {
      id: "treatment-plan",
      feature: "Treatment Plan Explained Before Starting",
      usValue: "Visualized on high-res monitors with all alternative options",
      themValue: "Rushed explanations without showing clear options",
    },
    {
      id: "follow-up-care",
      feature: "Proactive Follow-Up Care & Healing Checks",
      usValue: true,
      themValue: false,
    },
    {
      id: "child-friendly",
      feature: "Gentle Child-Friendly Environment",
      usValue: "Specially trained pedodontic staff & anxiety-free approach",
      themValue: "Adult clinical setups that intimidate young children",
    },
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

export default philosophyContent;
