/**
 * ============================================================================
 * PRICING & TREATMENT CARE PLANS (DATA SOURCE)
 * ============================================================================
 *
 * PROMINENT CLINICAL & LEGAL DISCLAIMER:
 * ALL PRICES, PLANS AND CLAIMS ARE PLACEHOLDERS. Replace with the clinic's real, 
 * verified information before launch. Do not publish discounts, insurance or 
 * EMI claims that are not true.
 * ============================================================================
 */

export interface CarePlanFeature {
  text: string;
  included: boolean;
}

export interface CarePlan {
  id: string;
  name: string;
  tagline: string;
  monthlyPrice: number;
  yearlyPrice: number; // per-month equivalent when billed annually
  currency: string;
  highlighted: boolean;
  features: CarePlanFeature[];
  ctaLabel: string;
}

export const carePlans: CarePlan[] = [
  {
    id: "essential-care",
    name: "Essential Care",
    tagline: "Foundational preventive checkups, scaling, and annual diagnostics.",
    monthlyPrice: 699,
    yearlyPrice: 549, // ~21% saving
    currency: "Rs.",
    highlighted: false,
    ctaLabel: "Choose Essential Care",
    features: [
      { text: "2 comprehensive oral health examinations / year", included: true },
      { text: "2 painless ultrasonic scaling & polishing sessions", included: true },
      { text: "Digital bite analysis & intraoral low-dose X-rays", included: true },
      { text: "15% privilege discount on composite tooth fillings", included: true },
      { text: "Priority same-day emergency triage slots", included: false },
      { text: "Annual medical-grade cosmetic teeth whitening", included: false },
    ],
  },
  {
    id: "family-care",
    name: "Family Care",
    tagline: "Comprehensive preventive and restorative shield for the entire household.",
    monthlyPrice: 1499,
    yearlyPrice: 1149, // ~23% saving
    currency: "Rs.",
    highlighted: true,
    ctaLabel: "Choose Family Care",
    features: [
      { text: "Coverage for up to 4 family members (kids & seniors)", included: true },
      { text: "Unlimited routine checkups & consultation reviews", included: true },
      { text: "4 ultrasonic scalings & bio-film polish treatments", included: true },
      { text: "Pediatric fluoride treatments & pit fissure sealants", included: true },
      { text: "20% privilege savings on root canals & ceramic crowns", included: true },
      { text: "Guaranteed same-day priority emergency appointments", included: true },
    ],
  },
  {
    id: "complete-care",
    name: "Complete Care",
    tagline: "All-inclusive clinical excellence, aesthetic privileges, and VIP concierge.",
    monthlyPrice: 2499,
    yearlyPrice: 1899, // ~24% saving
    currency: "Rs.",
    highlighted: false,
    ctaLabel: "Choose Complete Care",
    features: [
      { text: "All diagnostic 3D CBCT scans & optical scans included", included: true },
      { text: "Unlimited deep scalings, air polishing & gum checks", included: true },
      { text: "Annual in-clinic laser teeth whitening session", included: true },
      { text: "25% privilege discount on dental implants & aligners", included: true },
      { text: "Dedicated direct doctor consultation helpline", included: true },
      { text: "Zero waiting room time with scheduled VIP operatory", included: true },
    ],
  },
];

/**
 * Computes the percentage saved for an annual plan relative to its monthly price.
 */
export function getPlanSavingPercent(plan: CarePlan): number {
  if (plan.monthlyPrice <= 0) return 0;
  return Math.round(((plan.monthlyPrice - plan.yearlyPrice) / plan.monthlyPrice) * 100);
}

/**
 * Derives the maximum percentage saving text from the data.
 */
export function getMaxSavingPercent(): number {
  return Math.max(...carePlans.map(getPlanSavingPercent));
}

// ----------------------------------------------------------------------------
// Treatment Price List (Grouped)
// ----------------------------------------------------------------------------

export interface PriceItem {
  name: string;
  price: string;
  note?: string;
}

export interface PriceGroup {
  id: string;
  title: string;
  description: string;
  items: PriceItem[];
}

export const treatmentPriceGroups: PriceGroup[] = [
  {
    id: "preventive",
    title: "Diagnostics & Preventive",
    description: "Proactive clinical examinations, high-resolution imaging, and gentle biofilm cleanings.",
    items: [
      {
        name: "Comprehensive Specialist Consultation",
        price: "Rs. 400 - 600",
        note: "Includes digital intraoral camera preview & medical history assessment",
      },
      {
        name: "Digital Intraoral RVG X-Rays (Per View)",
        price: "Rs. 250 - 350",
        note: "Instant ultra-low radiation sensor imaging",
      },
      {
        name: "Full-Mouth 3D CBCT Surgical Scan",
        price: "Rs. 2,000 - 3,500",
        note: "Sub-millimeter volumetric bone and nerve mapping",
      },
      {
        name: "Painless Ultrasonic Biofilm Scaling & Polish",
        price: "Rs. 1,200 - 2,000",
        note: "Computer-controlled gentle prophylaxis without enamel scraping",
      },
      {
        name: "Child Preventive Fluoride & Sealant Therapy",
        price: "Rs. 600 - 1,000",
        note: "Cavity interception and enamel remineralization per quadrant",
      },
    ],
  },
  {
    id: "restorative",
    title: "Restorative & Endodontics",
    description: "Preserving natural tooth vitality through micro-dentistry and biocompatible ceramics.",
    items: [
      {
        name: "Composite Tooth-Colored Enamel Filling",
        price: "Rs. 800 - 1,800",
        note: "Biomimetic layered resin matched to your natural shade",
      },
      {
        name: "Single-Sitting Microscopic Root Canal (RCT)",
        price: "Rs. 3,500 - 6,000",
        note: "Carl Zeiss surgical operating microscope & thermal 3D seal",
      },
      {
        name: "Complex Molar Re-RCT with Fiber Post",
        price: "Rs. 5,500 - 8,500",
        note: "Includes canal disinfection and fiber-reinforced post placement",
      },
      {
        name: "Monolithic CAD/CAM Zirconia Crown",
        price: "Rs. 7,000 - 12,000",
        note: "Digital scan, precision 5-axis milled, 10-year warranty",
      },
      {
        name: "E.max Pressed Lithium Disilicate Inlay / Onlay",
        price: "Rs. 6,000 - 9,500",
        note: "Conservative alternative to full crowns preserving tooth structure",
      },
    ],
  },
  {
    id: "aesthetics",
    title: "Cosmetic & Smile Design",
    description: "Handcrafted porcelain veneers, laser brightening, and digital smile preview makeovers.",
    items: [
      {
        name: "Medical Laser Teeth Whitening (In-Clinic)",
        price: "Rs. 7,500 - 11,000",
        note: "Painless diode laser activation, lifts 4-8 shades in 45 minutes",
      },
      {
        name: "Ultra-Thin Handcrafted Porcelain Veneer",
        price: "Rs. 9,000 - 15,000",
        note: "Per tooth. 0.3mm micro-invasive ceramic crafted by master ceramists",
      },
      {
        name: "Direct Composite Smile Bonding",
        price: "Rs. 2,500 - 4,500",
        note: "Single-visit repair of chips, gaps, and tooth asymmetries",
      },
      {
        name: "Laser Aesthetic Gum Contouring & Depigmentation",
        price: "Rs. 4,000 - 8,000",
        note: "Soothes gummy smiles with zero scalpel cuts and immediate healing",
      },
    ],
  },
  {
    id: "implants-ortho",
    title: "Implants & Orthodontics",
    description: "Guided titanium/zirconia dental implants and invisible clear orthodontic aligners.",
    items: [
      {
        name: "Swiss / German Titanium Dental Implant",
        price: "Rs. 25,000 - 45,000",
        note: "Fixture only. Lifetime warranty with 3D surgical guide placement",
      },
      {
        name: "Custom Screw-Retained Zirconia Implant Crown",
        price: "Rs. 12,000 - 18,000",
        note: "Custom CAD/CAM titanium base and natural aesthetic zirconia crown",
      },
      {
        name: "Clear Invisible Aligners (Mild / Moderate)",
        price: "Rs. 45,000 - 85,000",
        note: "3D digital motion planning and full series of custom thermoformed trays",
      },
      {
        name: "Comprehensive Clear Aligners (Complex Bites)",
        price: "Rs. 95,000 - 1,50,000",
        note: "Full dual-arch correction including refinements and retainers",
      },
      {
        name: "Minimally Invasive Wisdom Tooth Micro-Surgery",
        price: "Rs. 3,500 - 6,500",
        note: "Painless atraumatic extraction with laser recovery protocol",
      },
    ],
  },
];

// ----------------------------------------------------------------------------
// Payment & Financial Options
// ----------------------------------------------------------------------------

export interface PaymentOption {
  icon: "Banknote" | "CreditCard" | "CalendarClock" | "ShieldCheck";
  title: string;
  text: string;
}

export const paymentOptions: PaymentOption[] = [
  {
    icon: "Banknote",
    title: "Cash & Direct UPI",
    text: "Instant zero-surcharge payments via Google Pay, PhonePe, BHIM, Paytm, or direct IMPS/NEFT bank transfers.",
  },
  {
    icon: "CreditCard",
    title: "Cards & Contactless",
    text: "All major domestic and international debit and credit cards accepted (Visa, Mastercard, RuPay, and American Express).",
  },
  {
    icon: "CalendarClock",
    title: "Phased Treatment Milestones",
    text: "Multi-stage procedures (such as implants and veneers) can be structured across appointment milestones for comfortable budgeting.",
  },
  {
    icon: "ShieldCheck",
    title: "Insurance & Reimbursement Support",
    text: "Our patient care desk provides comprehensive itemized clinical receipts and procedure codes to expedite your corporate medical claims.",
  },
];

// ----------------------------------------------------------------------------
// FAQs (8 High Quality Items)
// ----------------------------------------------------------------------------

export type FaqCategory = "Pricing" | "Appointments" | "Treatments" | "Insurance";

export interface PricingFaqItem {
  id: string;
  category: FaqCategory;
  question: string;
  answer: string;
}

export const pricingFaqs: PricingFaqItem[] = [
  {
    id: "faq-hidden-charges",
    category: "Pricing",
    question: "Are there any hidden clinical charges or sterilization fees?",
    answer:
      "No. At GuruOm Dental, we provide transparent, written estimates before beginning any clinical procedure. Hospital-grade autoclave sterilization, disposable operatory barriers, and routine diagnostic digital X-rays are always integrated upfront with zero surprise surcharges.",
  },
  {
    id: "faq-plan-vs-retail",
    category: "Pricing",
    question: "How do care plans differ from paying for treatments individually?",
    answer:
      "Care plans are designed for predictable preventive care and substantial long-term savings. In addition to covering scheduled examinations and ultrasonic biofilm cleanings, active plan members receive a privilege discount (15% to 25%) across all specialized restorative treatments throughout the year.",
  },
  {
    id: "faq-emi-options",
    category: "Pricing",
    question: "Do you offer no-cost EMI or interest-free installments?",
    answer:
      "Yes. For high-value procedures like full-arch dental implants, porcelain smile makeovers, and clear aligners, we partner with leading medical financing institutions to offer 0% interest EMI tenures from 3 to 12 months with minimal paperwork.",
  },
  {
    id: "faq-insurance-claims",
    category: "Insurance",
    question: "Can I use my medical insurance for dental treatments?",
    answer:
      "Most standard Indian health insurance policies cover dental care only when resulting from accidental trauma or requiring hospitalization. However, many corporate wellness policies provide outpatient dental allowances. Our desk supplies itemized diagnostic invoices to facilitate your claim submission.",
  },
  {
    id: "faq-consultation-fee",
    category: "Appointments",
    question: "Is the first consultation fee deductible from treatment costs?",
    answer:
      "Yes. If you decide to begin your treatment plan (such as dental fillings, scaling, root canal therapy, or implants) on the day of your consultation, your initial consultation fee is credited directly toward your procedure total.",
  },
  {
    id: "faq-same-day-emergency",
    category: "Appointments",
    question: "How are emergency dental appointments handled and billed?",
    answer:
      "We maintain dedicated emergency triage slots every day. Urgent visits focus on immediate pain cessation and diagnostic triage. Emergency visit fees are transparent and follow our standard diagnostic schedule with no premium surcharge during regular clinic hours.",
  },
  {
    id: "faq-implant-cost-factors",
    category: "Treatments",
    question: "What determines the cost variation in dental implants?",
    answer:
      "Implant pricing depends primarily on the bone density (whether supplemental bone grafting or sinus lifting is required), the surgical template complexity (freehand vs 3D computer-guided), and the choice between standard titanium or metal-free zirconia fixtures.",
  },
  {
    id: "faq-plan-cancellation",
    category: "Pricing",
    question: "Can I cancel or upgrade my care plan at any time?",
    answer:
      "Yes. Annual care plans can be upgraded at any time by paying the prorated difference. If you relocate or wish to cancel an unused plan within 30 days of purchase, our administration desk provides a hassle-free refund minus any utilized clinical visits.",
  },
];
