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

export interface ClinicOpeningHour {
  day: string;
  dayIndex: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  open?: string; // "09:00"
  close?: string; // "20:30"
  label: string;
  isClosed?: boolean;
}

export interface ContactReasonOption {
  value: string;
  label: string;
}

/**
 * ============================================================================
 * CLINIC MASTER CONFIGURATION
 * ============================================================================
 * NOTE FOR CLINIC ADMINISTRATOR:
 * All contact details, opening hours, emergency numbers, and coordinates in this
 * file are placeholders. Replace with real clinic information before launch.
 * ============================================================================
 */
export const siteConfig = {
  name: "GuruOm Dental",
  url: "https://guruomdental.com",
  tagline: clinicInfo.tagline || "Advanced Dental Care & Precision Smile Aesthetics",
  phone: clinicInfo.phone || "+91 98765 43210",
  phonePlaceholder: "+91 00000 00000",
  emergencyPhone: "+91 98765 43219",
  emergencyNote:
    "For severe acute trauma, severe toothaches, or uncontrolled bleeding outside regular clinic hours, our on-call dental emergency team is reachable 24/7.",
  email: clinicInfo.email || "care@guruomdental.com",
  emailPlaceholder: "hello@guruomdental.com",
  whatsapp: "+91 98765 43210",
  whatsappPlaceholder: "+91 00000 00000",
  timezone: "Asia/Kolkata",
  address: {
    line1: "Abhiyanta Colony, Shriram Nagar",
    line2: "Sawli Housing Society, Surya Nagar",
    city: "Ahilyanagar",
    state: "Maharashtra",
    postalCode: "414003",
    country: "India",
    full: clinicInfo.address || "GuruOm Dental, Abhiyanta Colony, Shriram Nagar, Sawli Housing Society, Surya Nagar, Ahilyanagar, Maharashtra 414003",
    plusCodeAddress: "4QM5+F35, Abhiyanta Colony, Shriram Nagar, Sawli Housing Society, Surya Nagar, Ahilyanagar, Maharashtra 414003",
    street: "Abhiyanta Colony, Shriram Nagar, Sawli Housing Society, Surya Nagar",
    pincode: "414003",
    plusCode: "4QM5+F35",
  },
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=4QM5%2BF35%2C+Abhiyanta+Colony%2C+Shriram+Nagar%2C+Sawli+Housing+Society%2C+Surya+Nagar%2C+Ahilyanagar%2C+Maharashtra+414003",
  googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=4QM5%2BF35%2C+Abhiyanta+Colony%2C+Shriram+Nagar%2C+Sawli+Housing+Society%2C+Surya+Nagar%2C+Ahilyanagar%2C+Maharashtra+414003",
  mapEmbedUrl: "", // Placeholder string, empty by default. Add Google Maps iframe embed src when available.
  coordinates: {
    lat: 19.0948,
    lng: 74.748,
  },
  openingHours: [
    { day: "Monday", dayIndex: 1, open: "09:00", close: "20:30", label: "9:00 AM – 8:30 PM" },
    { day: "Tuesday", dayIndex: 2, open: "09:00", close: "20:30", label: "9:00 AM – 8:30 PM" },
    { day: "Wednesday", dayIndex: 3, open: "09:00", close: "20:30", label: "9:00 AM – 8:30 PM" },
    { day: "Thursday", dayIndex: 4, open: "09:00", close: "20:30", label: "9:00 AM – 8:30 PM" },
    { day: "Friday", dayIndex: 5, open: "09:00", close: "20:30", label: "9:00 AM – 8:30 PM" },
    { day: "Saturday", dayIndex: 6, open: "09:00", close: "18:00", label: "9:00 AM – 6:00 PM" },
    { day: "Sunday", dayIndex: 0, isClosed: true, label: "Closed (Emergency Only)" },
  ] as ClinicOpeningHour[],
  workingHours: {
    text: clinicInfo.timing || "Mon - Sat: 9:00 AM - 8:30 PM | Sun: By Appointment",
    weekdays: "Mon - Fri: 9:00 AM - 8:30 PM",
    saturday: "Saturday: 9:00 AM - 6:00 PM",
    sunday: "Sunday: Closed (Emergency On-Call)",
  },
  socials: {
    instagram: "https://instagram.com/guruomdental",
    facebook: "https://facebook.com/guruomdental",
    youtube: "https://youtube.com/@guruomdental",
    whatsapp: "https://wa.me/919876543210",
  },
};

export const contactReasons: ContactReasonOption[] = [
  { value: "general", label: "General enquiry" },
  { value: "treatment", label: "Treatment question" },
  { value: "pricing", label: "Pricing question" },
  { value: "feedback", label: "Feedback" },
  { value: "partnership", label: "Partnership or careers" },
];

export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Doctors", href: "/doctors" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export const megaMenuGroups: MegaMenuGroup[] = [
  {
    title: "Main",
    items: [
      { label: "Home", href: "/", description: "Sanctuary overview & intro" },
      { label: "About Us", href: "/about", description: "Our values, hygiene & philosophy" },
      { label: "Services", href: "/services", description: "Full spectrum oral wellness" },
      { label: "Service Details", href: "/services#details", description: "In-depth treatment procedures" },
      { label: "Doctors", href: "/doctors", description: "Meet our specialist clinicians" },
      { label: "Doctor Profile", href: "/doctors#profile", description: "Accreditations & background" },
      { label: "Contact", href: "/contact", description: "Front desk & clinic directions" },
      { label: "Appointment", href: "/appointment", description: "Direct booking & priority consults" },
    ],
  },
  {
    title: "Resources",
    items: [
      { label: "Pricing", href: "/pricing", description: "Transparent fees & insurance support" },
      { label: "Blog", href: "/blog", description: "Dental health articles & advice" },
      { label: "Blog Post", href: "/blog#post", description: "Deep dive patient care spotlight" },
      { label: "Careers", href: "/careers", description: "Join our clinical medical team" },
    ],
  },
  {
    title: "Utility",
    items: [
      { label: "Privacy Policy", href: "/privacy", description: "Medical records confidentiality" },
      { label: "Terms & Conditions", href: "/terms", description: "Appointment & treatment terms" },
      { label: "404 Page", href: "/not-found-preview", description: "Custom not found redirect" },
    ],
  },
];

export const footerLinkColumns: FooterLinkCol[] = [
  {
    title: "Quick Links",
    links: [
      { label: "Home", href: "/" },
      { label: "About Us", href: "/about" },
      { label: "Our Treatments", href: "/services" },
      { label: "Specialist Doctors", href: "/doctors" },
      { label: "Pricing & Coverage", href: "/pricing" },
    ],
  },
  {
    title: "Treatments",
    links: [
      { label: "Dental Implants", href: "/services#implants" },
      { label: "Clear Aligners", href: "/services#aligners" },
      { label: "Cosmetic Veneers", href: "/services#veneers" },
      { label: "Painless Root Canal", href: "/services#rct" },
      { label: "Kids Dentistry", href: "/services#pediatric" },
    ],
  },
  {
    title: "Patient Center",
    links: [
      { label: "Book Consultation", href: "/appointment" },
      { label: "Oral Health Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Clinic Location", href: "/contact" },
      { label: "Emergency Support", href: "/contact#emergency" },
    ],
  },
];
