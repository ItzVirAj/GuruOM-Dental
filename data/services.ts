/**
 * Shared Services Data Source
 * Powers the homepage Services grid, /services catalogue, and /services/[slug] dynamic routes.
 *
 * NOTE FOR CLINIC ADMINISTRATOR:
 * Replace prices, durations, and clinical details with real clinic information before launch.
 */

export interface ServiceItem {
  slug: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  icon: string;
  imageSlot: string;
  features: string[];
  duration: string;
  startingPrice: string;
}

export const servicesData: ServiceItem[] = [
  {
    slug: "general-dentistry",
    title: "General Dentistry",
    shortDescription: "Comprehensive oral health examinations, preventive screenings, and restorative tooth-colored fillings.",
    longDescription:
      "Our foundational general dentistry services focus on proactive prevention and conservative tooth preservation. We combine digital diagnostics, low-radiation imaging, and gentle restorative materials to protect your oral biological foundation. Every routine visit is engineered for maximum comfort, transparency, and clinical excellence.",
    icon: "Stethoscope",
    imageSlot: "service1",
    features: [
      "Digital bite analysis",
      "Composite enamel fillings",
      "Periodontal gum evaluation",
      "Oral cancer screening",
    ],
    duration: "30 to 45 min",
    startingPrice: "From Rs. 500 (Placeholder)",
  },
  {
    slug: "cleaning-whitening",
    title: "Teeth Cleaning & Whitening",
    shortDescription: "Painless ultrasonic bio-film scaling and gentle enamel-safe cosmetic whitening for a luminous smile.",
    longDescription:
      "Restore natural radiance and gum vitality through specialized prophylaxis protocols. We use computer-controlled ultrasonic scaling to dislodge tartar and bio-film without scraping sensitive enamel. Finish with medical-grade laser teeth whitening that safely lifts deep stains while preserving tooth sensitivity.",
    icon: "Sparkles",
    imageSlot: "service2",
    features: [
      "Painless ultrasonic scaling",
      "Bio-film air polishing",
      "Laser enamel whitening",
      "Sensitivity relief fluoride",
    ],
    duration: "45 to 60 min",
    startingPrice: "From Rs. 1,200 (Placeholder)",
  },
  {
    slug: "orthodontics-aligners",
    title: "Orthodontics & Aligners",
    shortDescription: "Clear invisible aligners and gentle orthodontic corrections that discreetly straighten your smile.",
    longDescription:
      "Realign your teeth with precision 3D-scanned invisible aligners designed for daily comfort and seamless aesthetics. Our digital smile planning maps each micro-movement in advance so you visualize your final alignment before starting. Enjoy freedom without metal brackets, wire pokes, or dietary compromises.",
    icon: "Smile",
    imageSlot: "service3",
    features: [
      "3D digital scan preview",
      "Removable clear trays",
      "Zero wire irritation",
      "Comfortable bi-weekly stages",
    ],
    duration: "6 to 12 Months Avg.",
    startingPrice: "From Rs. 35,000 (Placeholder)",
  },
  {
    slug: "dental-implants",
    title: "Dental Implants",
    shortDescription: "Swiss and German titanium and zirconia implants placed with 3D computer-guided flapless surgery.",
    longDescription:
      "Permanent, bio-integrated tooth replacement that restores natural bite strength and youthful facial contours. Utilizing CBCT guided surgical templates, our implantologists place fixtures with sub-millimeter precision and minimal tissue trauma. Enjoy natural-feeling restorations engineered to last a lifetime.",
    icon: "ShieldCheck",
    imageSlot: "service4",
    features: [
      "3D computer-guided placement",
      "Biocompatible titanium/zirconia",
      "Same-day provisional loading",
      "Lifetime structural stability",
    ],
    duration: "Single Session (45 min)",
    startingPrice: "From Rs. 22,000 (Placeholder)",
  },
  {
    slug: "root-canal-treatment",
    title: "Root Canal Treatment",
    shortDescription: "Painless, single-sitting root canal therapy performed under high-magnification surgical operating microscopes.",
    longDescription:
      "Preserve severely compromised teeth and eliminate pain in a tranquil, anxiety-free setting. Microscopic endodontics allows our specialists to navigate complex root anatomies and micro-canals with surgical accuracy. Thermal 3D obturation ensures a sterile, hermetic seal that prevents recurrent infection.",
    icon: "Activity",
    imageSlot: "service5",
    features: [
      "Carl Zeiss surgical microscope",
      "Painless computerized anesthesia",
      "Single-visit completion",
      "Biocompatible hermetic seal",
    ],
    duration: "45 to 60 min",
    startingPrice: "From Rs. 3,500 (Placeholder)",
  },
  {
    slug: "cosmetic-smile-design",
    title: "Cosmetic Smile Design",
    shortDescription: "Handcrafted ultra-thin porcelain veneers, composite bonding, and digital smile makeovers tailored to your facial harmony.",
    longDescription:
      "Elevate your smile into an expressive work of art through conservative aesthetic dentistry. We custom-sculpt handcrafted ceramic veneers and micro-thin restorations that reflect natural tooth translucency and light refraction. Experience a comprehensive digital aesthetic mock-up to preview your dream smile before any work begins.",
    icon: "Palette",
    imageSlot: "service6",
    features: [
      "Custom porcelain veneers",
      "Digital facial smile design",
      "Micro-invasive preparation",
      "Hand-shaded color matching",
    ],
    duration: "2 to 3 Visits",
    startingPrice: "From Rs. 8,000 (Placeholder)",
  },
  {
    slug: "pediatric-dentistry",
    title: "Pediatric Dentistry",
    shortDescription: "Warm, anxiety-free dentistry, protective fluoride treatments, and gentle caries management for children.",
    longDescription:
      "Cultivate lifelong positive oral health habits in a welcoming, fear-free environment built specially for kids. Our compassionate pediatric specialists turn dental appointments into an enjoyable, educational adventure with zero intimidation. We focus on gentle preventive sealants, cavity interception, and gentle habit coaching.",
    icon: "Heart",
    imageSlot: "service7",
    features: [
      "Child-friendly operatory",
      "Protective pit & fissure sealants",
      "Gentle cavity prevention",
      "Positive behavioral guidance",
    ],
    duration: "30 to 40 min",
    startingPrice: "From Rs. 600 (Placeholder)",
  },
  {
    slug: "emergency-dental-care",
    title: "Emergency Dental Care",
    shortDescription: "Same-day priority appointments for acute toothaches, fractured teeth, oral trauma, and displaced restorations.",
    longDescription:
      "Rapid clinical relief when unexpected dental pain strikes your family. We maintain dedicated daily emergency slots equipped for immediate triage, trauma stabilization, and pain cessation. Contact our on-call dental front desk for rapid diagnosis and same-day soothing clinical intervention.",
    icon: "Clock",
    imageSlot: "service8",
    features: [
      "Same-day emergency slots",
      "Instant pain-relief protocols",
      "Tooth repair & re-cementation",
      "Direct doctor tele-triage",
    ],
    duration: "Immediate Attention (30 min)",
    startingPrice: "From Rs. 800 (Placeholder)",
  },
];

export default servicesData;
