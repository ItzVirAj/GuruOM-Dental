/**
 * ============================================================================
 * CLINICAL DOCTORS DIRECTORY (DATA SOURCE)
 * ============================================================================
 * 
 * Official Clinical Leadership at GuruOm Dental:
 * - Dr. Guruprasad Handal (Founder & Chief Prosthodontist)
 * - Dr. Akshata Handal (Co-Founder & Dental Surgeon)
 * ============================================================================
 */

export interface DoctorAvailability {
  days: string[];
  hours: string;
}

export interface Doctor {
  slug: string;
  name: string;
  role: string;
  specialties: string[];
  experienceYears: number;
  qualifications: string[];
  languages: string[];
  shortBio: string;
  longBio: string[];
  focusAreas: string[];
  availability: DoctorAvailability;
  imageSlot: string;
  featured: boolean;
}

export const doctorsData: Doctor[] = [
  {
    slug: "dr-guruprasad-handal",
    name: "Dr. Guruprasad Handal",
    role: "Founder & Chief Prosthodontist",
    specialties: [
      "Prosthodontics",
      "Implantology",
      "Oral Surgery",
      "Cosmetic Dentistry",
      "Full Mouth Rehabilitation",
    ],
    experienceYears: 16,
    qualifications: [
      "B.D.S. - Bachelor of Dental Surgery",
      "M.D.S. - Prosthodontics & Crown Bridge",
      "Fellow - Advanced Digital & Implant Prosthetics",
    ],
    languages: ["English", "Hindi", "Marathi"],
    shortBio:
      "Founder of GuruOm Dental and pioneer in digital restorative sciences across Central Maharashtra. Specializing in guided full-arch implantology, DMLS 3D metal prosthetics, and complete smile rehabilitation.",
    longBio: [
      "Dr. Guruprasad Handal is the founder of GuruOm Dental and a dedicated Prosthodontist who spearheaded the digital dentistry revolution in Ahilyanagar. In 2019, he introduced optical intraoral 3D scanning and computer-aided precision milling to the region, establishing one of the most advanced digital prosthetics workflows in Maharashtra.",
      "His clinical expertise centers on computer-guided implant surgeries, All-on-4 and All-on-6 full arch rehabilitations, and high-translucency zirconia restorations, ensuring biologically conservative, predictable, and long-lasting patient outcomes.",
    ],
    focusAreas: [
      "Full-Arch All-on-4 / All-on-6 Implants",
      "Computer-Guided Flapless Implantology",
      "Full Mouth Rehabilitation & Occlusal Design",
      "CAD/CAM & DMLS 3D Metal Prosthetics",
    ],
    availability: {
      days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      hours: "9:00 AM - 8:30 PM",
    },
    imageSlot: "drGuruprasad",
    featured: true,
  },
  {
    slug: "dr-akshata-handal",
    name: "Dr. Akshata Handal",
    role: "Co-Founder & Dental Surgeon",
    specialties: [
      "General Dentistry",
      "Endodontics",
      "Pediatric Dentistry",
      "Preventive Care",
      "Clear Aligners",
      "Orthodontics",
      "Cosmetic Dentistry",
    ],
    experienceYears: 12,
    qualifications: [
      "B.D.S. - Bachelor of Dental Surgery",
      "Fellowship in Aesthetic & Conservative Micro-Dentistry",
      "Certified Clear Aligner & Preventive Provider",
    ],
    languages: ["English", "Hindi", "Marathi"],
    shortBio:
      "Co-founder of GuruOm Dental specializing in aesthetic smile design, gentle family dentistry, and compassionate, anxiety-free clinical care.",
    longBio: [
      "Dr. Akshata Handal co-founded GuruOm Dental with a commitment to creating an empathetic, patient-centered clinical sanctuary. She believes dentistry should be gentle, transparent, and completely free of anxiety.",
      "Her clinical focus spans aesthetic conservative restorations, enamel-safe smile enhancements, clear aligner treatments, and pediatric preventive care, ensuring every member of the family enjoys optimal oral wellness.",
    ],
    focusAreas: [
      "Aesthetic Smile Design & Composite Veneers",
      "Painless Root Canal & Conservative Restorations",
      "Gentle Preventive & Pediatric Dentistry",
      "Ultrasonic Periodontal Prophylaxis & Clear Aligners",
    ],
    availability: {
      days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      hours: "9:00 AM - 6:00 PM",
    },
    imageSlot: "drAkshata",
    featured: true,
  },
];

/**
 * Lookup a doctor by their URL slug.
 */
export function getDoctorBySlug(slug: string): Doctor | undefined {
  return doctorsData.find((doc) => doc.slug === slug);
}

/**
 * Get a flat, deduplicated array of all specialties across doctors.
 */
export function getAllSpecialties(): string[] {
  const set = new Set<string>();
  doctorsData.forEach((doc) => {
    doc.specialties.forEach((spec) => set.add(spec));
  });
  return Array.from(set);
}

export default doctorsData;
