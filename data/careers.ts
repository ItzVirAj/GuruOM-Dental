/**
 * Careers & Clinical Opportunities Data
 *
 * NOTE FOR CLINIC ADMINISTRATOR:
 * Never publish fake or expired openings.
 * Keep openings array empty ([]) when there are no active, verified openings.
 * All text below is original placeholder copy (replace with the clinic's real information).
 */

export interface CareerOpening {
  slug: string;
  title: string;
  department: string;
  location: string;
  type: string; // e.g. "Full-time", "Part-time"
  summary: string;
  responsibilities: string[];
  requirements: string[];
  postedOn: string; // ISO Date "YYYY-MM-DD"
  jsonLd: boolean;
}

export interface CareerValue {
  title: string;
  description: string;
  icon: "learning" | "teamwork" | "patientCare" | "fairTreatment";
}

export interface HiringStep {
  step: string;
  title: string;
  description: string;
}

export const careerValues: CareerValue[] = [
  {
    title: "Continuous Clinical Learning",
    description:
      "We cultivate an academic culture where clinicians and assistants regularly study modern digital techniques, micro-restorative protocols, and evidence-based materials.",
    icon: "learning",
  },
  {
    title: "Respectful Teamwork",
    description:
      "Every clinical operatory runs on mutual dignity. Dentists, lab ceramists, and front desk coordinators collaborate closely with unhurried transparency.",
    icon: "teamwork",
  },
  {
    title: "Patient-Centered Care",
    description:
      "We prioritize conservative biological preservation and gentle patient listening above procedural volume. Quality of care always guides clinical choices.",
    icon: "patientCare",
  },
  {
    title: "Fair Treatment & Safety",
    description:
      "Hospital-grade sterilization standards, ergonomic operatory equipment, and structured working schedules ensure safety and balance for every team member.",
    icon: "fairTreatment",
  },
];

export const hiringSteps: HiringStep[] = [
  {
    step: "01",
    title: "1. Introductory Note",
    description:
      "Submit an inquiry through our contact form selecting the careers department and introducing your clinical background.",
  },
  {
    step: "02",
    title: "2. Initial Conversation",
    description:
      "A brief, conversational phone or video call with our clinical coordinator to discuss your career aspirations and clinic alignment.",
  },
  {
    step: "03",
    title: "3. Clinical Dialogue",
    description:
      "An in-person clinic tour and unhurried discussion with our senior dental surgeons about clinical philosophy and treatment workflows.",
  },
  {
    step: "04",
    title: "4. Welcome & Onboarding",
    description:
      "Structured orientation on our digital scanner workflows, digital dental lab coordination, and patient care standards.",
  },
];

/**
 * EMPTY by default per security and verification guidelines.
 * Never publish unverified or placeholder job openings as active postings.
 */
export const openings: CareerOpening[] = [];

export function getOpeningBySlug(slug: string): CareerOpening | undefined {
  if (!slug) return undefined;
  return openings.find((o) => o.slug === slug);
}

