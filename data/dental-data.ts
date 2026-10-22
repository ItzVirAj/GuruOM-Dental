export interface Service {
  id: string;
  title: string;
  category: string;
  description: string;
  duration: string;
  highlight: string;
  icon: string;
}

export interface Doctor {
  id: string;
  name: string;
  role: string;
  experience: string;
  specialization: string;
}

export interface ClinicInfo {
  name: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  timing: string;
  rating: number;
  reviewCount: number;
}

export const clinicInfo: ClinicInfo = {
  name: "GuruOm Dental",
  tagline: "Advanced Dental Care & Precision Smile Aesthetics",
  phone: "+91 98765 43210",
  email: "care@guruomdental.com",
  address: "Suite 402, Lotus Tower, S.G. Highway, Ahmedabad, Gujarat 380054",
  timing: "Mon - Sat: 9:00 AM - 8:30 PM | Sun: By Appointment",
  rating: 4.9,
  reviewCount: 1420,
};

export const dentalServices: Service[] = [
  {
    id: "cosmetic-dentistry",
    title: "Cosmetic Smile Makeover",
    category: "Aesthetics",
    description: "Digital smile design, porcelain veneers, and laser teeth whitening tailored to enhance your natural facial harmony.",
    duration: "2-3 Sessions",
    highlight: "Digital 3D Preview",
    icon: "Sparkles",
  },
  {
    id: "dental-implants",
    title: "Precision Dental Implants",
    category: "Restoration",
    description: "Swiss & German titanium/zirconia implants with guided flapless surgery for permanent, natural-feeling teeth.",
    duration: "Same-Day Loading Available",
    highlight: "Lifetime Warranty",
    icon: "ShieldCheck",
  },
  {
    id: "invisible-aligners",
    title: "Clear Invisible Aligners",
    category: "Orthodontics",
    description: "Custom thermoformed aligners that discreetly straighten your smile without wires, brackets, or dietary restrictions.",
    duration: "6-12 Months Avg.",
    highlight: "Zero Wire Irritation",
    icon: "Smile",
  },
  {
    id: "microscopic-rct",
    title: "Microscopic Root Canal Therapy",
    category: "Endodontics",
    description: "Painless, single-sitting root canal treatment performed under high-magnification dental operating microscopes.",
    duration: "Single Visit (45 mins)",
    highlight: "99.4% Success Rate",
    icon: "Activity",
  },
  {
    id: "pediatric-dentistry",
    title: "Gentle Pediatric Dentistry",
    category: "Family Care",
    description: "Warm, child-friendly preventive dentistry, fluoride treatments, and gentle caries management in a relaxed atmosphere.",
    duration: "30-40 mins",
    highlight: "Anxiety-Free Environment",
    icon: "Heart",
  },
  {
    id: "laser-gum-therapy",
    title: "Laser Periodontics & Gum Care",
    category: "Periodontics",
    description: "Advanced diode laser treatment for gum contouring, depigmentation, and deep periodontal pocket therapy with minimal bleeding.",
    duration: "Single Session",
    highlight: "Fast Healing & Painless",
    icon: "Zap",
  },
];

export const doctors: Doctor[] = [
  {
    id: "dr-om-patel",
    name: "Dr. Om Patel",
    role: "Chief Dental Surgeon & Implantologist",
    experience: "16+ Years Experience",
    specialization: "MDS - Oral & Maxillofacial Implantology (Fellow ICOI)",
  },
  {
    id: "dr-guru-sharma",
    name: "Dr. Guru Sharma",
    role: "Aesthetic & Digital Smile Designer",
    experience: "12+ Years Experience",
    specialization: "MDS - Conservative Dentistry & Endodontics",
  },
];
