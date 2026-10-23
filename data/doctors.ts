/**
 * ============================================================================
 * CLINICAL DOCTORS DIRECTORY (DATA SOURCE)
 * ============================================================================
 * 
 * PROMINENT CLINICAL & LEGAL DISCLAIMER:
 * Replace with real doctors, real qualifications and registration numbers. 
 * Never publish unverified credentials. All names, registrations, and biographical 
 * details in this file are temporary placeholder values for development.
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
    slug: "dr-om-patel",
    name: "Dr. Placeholder Om Patel",
    role: "Chief Dental Surgeon & Implantologist",
    specialties: ["Implantology", "Oral Surgery"],
    experienceYears: 16,
    qualifications: [
      "BDS - Maharashtra University of Health Sciences",
      "MDS - Oral & Maxillofacial Implantology",
      "Fellow - International Congress of Oral Implantologists (ICOI, USA)",
    ],
    languages: ["English", "Hindi", "Marathi"],
    shortBio:
      "Pioneering minimally invasive guided implantology and complex full-arch oral restorations with 16+ years of surgical precision.",
    longBio: [
      "Dr. Placeholder Om Patel specializes in advanced implantology and computer-guided digital dental reconstructions. Having performed thousands of successful implant procedures, he leads our clinical team with an uncompromising commitment to biological bone preservation and patient tranquility.",
      "He regularly trains in international surgical symposia across Zurich and Frankfurt, bringing the latest sub-millimeter 3D-guided surgical templates and same-day tooth loading protocols directly to our patients.",
    ],
    focusAreas: [
      "3D Guided Flapless Implants",
      "Full-Arch All-on-4 Restorations",
      "Bone Grafting & Augmentation",
      "Sinus Floor Elevation Surgery",
    ],
    availability: {
      days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      hours: "9:30 AM - 5:00 PM",
    },
    imageSlot: "doctor1",
    featured: true,
  },
  {
    slug: "dr-guru-sharma",
    name: "Dr. Placeholder Guru Sharma",
    role: "Aesthetic Restorative Dentist & Endodontist",
    specialties: ["Endodontics", "Cosmetic Dentistry"],
    experienceYears: 14,
    qualifications: [
      "BDS - Government Dental College",
      "MDS - Conservative Dentistry & Endodontics",
      "Active Member - Indian Endodontic Society (IES)",
    ],
    languages: ["English", "Hindi", "Marathi", "Gujarati"],
    shortBio:
      "Saving natural teeth through high-magnification Carl Zeiss microscopic root canal therapy and handcrafted smile design.",
    longBio: [
      "Dr. Placeholder Guru Sharma merges engineering precision with delicate artistic vision. He pioneered single-visit painless microscopic endodontics at GuruOm Dental, ensuring compromised teeth are preserved with maximum structural vitality and zero procedural anxiety.",
      "His aesthetic practice focuses on micro-thin porcelain veneers and minimally invasive biomimetic composite restorations that integrate seamlessly with each patient's natural facial symmetry and light dynamics.",
    ],
    focusAreas: [
      "Microscopic Root Canal Therapy",
      "Handcrafted Porcelain Veneers",
      "Digital Facial Smile Architecture",
      "Single-Visit Ceramic Restorations",
    ],
    availability: {
      days: ["Mon", "Wed", "Thu", "Fri", "Sat"],
      hours: "10:00 AM - 6:30 PM",
    },
    imageSlot: "doctor2",
    featured: true,
  },
  {
    slug: "dr-priya-desai",
    name: "Dr. Placeholder Priya Desai",
    role: "Orthodontist & Clear Aligner Specialist",
    specialties: ["Orthodontics", "Clear Aligners"],
    experienceYears: 11,
    qualifications: [
      "BDS - Rajiv Gandhi University",
      "MDS - Orthodontics & Dentofacial Orthopedics",
      "Certified Digital Clear Aligner Specialist",
    ],
    languages: ["English", "Hindi", "Marathi"],
    shortBio:
      "Transforming smiles with clear invisible aligners and gentle dentofacial alignment for teens and adults.",
    longBio: [
      "Dr. Placeholder Priya Desai brings 11 years of specialized orthodontic precision to our clinic, correcting complex malocclusions without unnecessary tooth extractions wherever biologically viable.",
      "Utilizing 3D digital intraoral motion planning, she allows patients to visualize every stage of their future smile before aligner fabrication begins, ensuring predictable and discrete results.",
    ],
    focusAreas: [
      "Clear Invisible Aligners",
      "Early Interceptive Orthodontics",
      "Self-Ligating Low-Friction Braces",
      "Adult Bite Alignment Therapy",
    ],
    availability: {
      days: ["Tue", "Wed", "Thu", "Sat"],
      hours: "11:00 AM - 7:00 PM",
    },
    imageSlot: "doctor3",
    featured: false,
  },
  {
    slug: "dr-ananya-mehta",
    name: "Dr. Placeholder Ananya Mehta",
    role: "Pediatric Dentist & Preventive Specialist",
    specialties: ["Pediatric Dentistry", "Preventive Care"],
    experienceYears: 9,
    qualifications: [
      "BDS - Maharashtra University",
      "MDS - Pediatric & Preventive Dentistry",
      "Member - Indian Society of Pedodontics & Preventive Dentistry",
    ],
    languages: ["English", "Hindi", "Marathi"],
    shortBio:
      "Creating comforting, joyful dental experiences for infants, children, and teenagers with gentle behavioral guidance.",
    longBio: [
      "Dr. Placeholder Ananya Mehta believes that a child's earliest visits to the dental clinic set the cornerstone for lifelong oral health and confidence. Her appointments are relaxed, educational, and completely fear-free.",
      "She specializes in gentle interceptive preventive treatments, fluoride enamel remineralization, and pain-free cavity management tailored specifically to developing dentition.",
    ],
    focusAreas: [
      "Fear-Free Pediatric Care",
      "Fluoride & Pit Fissure Sealants",
      "Early Space Maintainer Therapy",
      "Gentle Pediatric Pulp Care",
    ],
    availability: {
      days: ["Mon", "Tue", "Fri", "Sat"],
      hours: "9:00 AM - 3:30 PM",
    },
    imageSlot: "doctor4",
    featured: false,
  },
  {
    slug: "dr-siddharth-joshi",
    name: "Dr. Placeholder Siddharth Joshi",
    role: "Periodontist & Soft-Tissue Micro-Surgeon",
    specialties: ["Periodontics", "Laser Surgery"],
    experienceYears: 12,
    qualifications: [
      "BDS - Manipal Academy of Higher Education",
      "MDS - Periodontology & Oral Implantology",
      "Certified Diode & Nd:YAG Laser Specialist",
    ],
    languages: ["English", "Hindi", "Marathi"],
    shortBio:
      "Restoring oral foundation health through minimally invasive diode laser periodontics and regenerative gum therapy.",
    longBio: [
      "Dr. Placeholder Siddharth Joshi focuses on preserving the biological foundation of every smile: healthy alveolar bone and periodontal gum tissue. Utilizing focused soft-tissue lasers, he treats deep periodontal pockets without scalpels or sutures.",
      "He is also renowned for aesthetic gum re-contouring to correct gummy smiles and delicate microsurgical root coverage procedures that eliminate cold sensitivity.",
    ],
    focusAreas: [
      "Minimally Invasive Laser Gum Care",
      "Aesthetic Gingival Re-contouring",
      "Regenerative Bone Grafting",
      "Connective Tissue Micro-Surgery",
    ],
    availability: {
      days: ["Mon", "Thu", "Fri", "Sat"],
      hours: "10:30 AM - 6:00 PM",
    },
    imageSlot: "doctor5",
    featured: false,
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
