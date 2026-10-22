import { clinicInfo } from "./dental-data";

export interface NavLink {
  label: string;
  href: string;
}

export interface MegaMenuItem {
  label: string;
  href: string;
  description: string;
}

export interface MegaMenuGroup {
  title: string;
  items: MegaMenuItem[];
}

export interface FooterLinkCol {
  title: string;
  links: { label: string; href: string }[];
}

export const siteConfig = {
  name: "GuruOm Dental",
  tagline: clinicInfo.tagline || "Advanced Dental Care & Precision Smile Aesthetics",
  phone: clinicInfo.phone || "+91 98765 43210",
  phonePlaceholder: "+91 00000 00000",
  email: clinicInfo.email || "care@guruomdental.com",
  emailPlaceholder: "hello@guruomdental.com",
  whatsapp: "+91 98765 43210",
  address: clinicInfo.address || "Suite 402, Lotus Tower, S.G. Highway, Ahmedabad, Gujarat 380054",
  googleMapsUrl: "https://maps.google.com/?q=GuruOm+Dental+Clinic+Ahmedabad",
  workingHours: clinicInfo.timing || "Mon - Sat: 9:00 AM - 8:30 PM | Sun: By Appointment",
  socials: {
    instagram: "https://instagram.com/guruomdental",
    facebook: "https://facebook.com/guruomdental",
    youtube: "https://youtube.com/@guruomdental",
    whatsapp: "https://wa.me/919876543210",
  },
};

export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Doctors", href: "/doctors" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export const megaMenuGroups: Record<string, MegaMenuGroup> = {
  main: {
    title: "Main",
    items: [
      { label: "Home", href: "/", description: "Sanctuary overview and entrance" },
      { label: "About Us", href: "/about", description: "Our values, safety & philosophy" },
      { label: "Treatments", href: "/services", description: "Full spectrum oral wellness" },
      { label: "Service Details", href: "/services#details", description: "In-depth procedural steps" },
      { label: "Specialists", href: "/doctors", description: "Meet our surgeons & faculty" },
      { label: "Doctor Profile", href: "/doctors#dr-om-patel", description: "Credentials & expertise" },
      { label: "Contact", href: "/contact", description: "Directions, phone & hours" },
      { label: "Appointment", href: "/appointment", description: "Book your smile consultation" },
    ],
  },
  resources: {
    title: "Resources",
    items: [
      { label: "Pricing & Plans", href: "/pricing", description: "Transparent treatment fees" },
      { label: "Clinical Blog", href: "/blog", description: "Doctor guides & dental tips" },
      { label: "Blog Article", href: "/blog#featured", description: "Deep-dive clinical articles" },
      { label: "Careers", href: "/careers", description: "Join our nursing & dental staff" },
    ],
  },
  utility: {
    title: "Utility",
    items: [
      { label: "Privacy Policy", href: "/privacy", description: "Confidentiality & health records" },
      { label: "Terms & Conditions", href: "/terms", description: "Patient rights & policies" },
      { label: "404 Error Page", href: "/404", description: "Sample not-found template" },
    ],
  },
};

export const footerLinkColumns: FooterLinkCol[] = [
  {
    title: "Treatments",
    links: [
      { label: "Cosmetic Smile Makeover", href: "/services#cosmetic-dentistry" },
      { label: "Swiss Dental Implants", href: "/services#dental-implants" },
      { label: "Clear Invisible Aligners", href: "/services#invisible-aligners" },
      { label: "Microscopic Root Canal", href: "/services#microscopic-rct" },
      { label: "Laser Periodontics", href: "/services#laser-gum-therapy" },
      { label: "Pediatric Dentistry", href: "/services#pediatric-dentistry" },
    ],
  },
  {
    title: "Practice",
    links: [
      { label: "About Our Clinic", href: "/about" },
      { label: "Meet the Doctors", href: "/doctors" },
      { label: "Hospital Sterilization", href: "/about#hygiene" },
      { label: "Transparent Pricing", href: "/pricing" },
      { label: "Patient Testimonials", href: "/animation-lab#counter" },
      { label: "Emergency Care", href: "/contact#emergency" },
    ],
  },
  {
    title: "Resources & Legal",
    links: [
      { label: "Smile Health Blog", href: "/blog" },
      { label: "Design System Showcase", href: "/design-system" },
      { label: "Animation Lab", href: "/animation-lab" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Settings", href: "/privacy#cookies" },
    ],
  },
];
