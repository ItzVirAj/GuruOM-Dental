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
  whatsappPlaceholder: "+91 00000 00000",
  address: {
    full: clinicInfo.address || "Suite 402, Lotus Tower, S.G. Highway, Ahmedabad, Gujarat 380054",
    city: "Ahmedabad",
    state: "Gujarat",
  },
  googleMapsUrl: "https://maps.google.com/?q=GuruOm+Dental+Clinic+Ahmedabad",
  workingHours: {
    text: clinicInfo.timing || "Mon - Sat: 9:00 AM - 8:30 PM | Sun: By Appointment",
    weekdays: "Mon - Fri: 9:00 AM - 8:30 PM",
    saturday: "Saturday: 9:00 AM - 6:00 PM",
    sunday: "Sunday: By Appointment Only",
  },
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
