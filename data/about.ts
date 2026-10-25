/**
 * ============================================================================
 * ABOUT US PAGE CONTENT (DATA SOURCE)
 * ============================================================================
 * Authentic clinic journey & milestones for GuruOm Dental, Ahilyanagar.
 * ============================================================================
 */

export interface AboutFounderSignoff {
  name: string;
  degree: string;
  role: string;
}

export interface AboutMilestone {
  value: string;
  label: string;
  sublabel: string;
}

export interface MissionVisionItem {
  id: "mission" | "vision" | "values";
  title: string;
  description: string;
  icon: string;
  tagline: string;
}

export interface ValueItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface ApproachStep {
  step: string;
  title: string;
  description: string;
  highlight: string;
}

export interface ClinicTechFeature {
  title: string;
  description: string;
  badge: string;
}

export interface ClinicBentoItem {
  slot: string;
  caption: string;
  ratio: "4/3" | "1/1" | "3/4" | "16/9";
}

export interface AboutStoryContent {
  eyebrow: string;
  title: string;
  imageSlot: string;
  paragraphs: string[];
  signoff: {
    salutation: string;
    founders: AboutFounderSignoff[];
  };
}

export interface AboutPageData {
  header: {
    eyebrow: string;
    title: string;
    description: string;
  };
  milestones: AboutMilestone[];
  story: AboutStoryContent;
  highlights: {
    title: string;
    tech: string[];
    procedures: string[];
    cities: string[];
  };
  cta: {
    title: string;
    description: string;
    primaryButton: { label: string; href: string };
    secondaryButton: { label: string; href: string };
  };
  missionVision: {
    eyebrow: string;
    title: string;
    cards: MissionVisionItem[];
    valuesHeading: string;
    values: ValueItem[];
  };
  approach: {
    eyebrow: string;
    title: string;
    description: string;
    steps: ApproachStep[];
  };
  clinicTech: {
    eyebrow: string;
    title: string;
    description: string;
    bento: ClinicBentoItem[];
    features: ClinicTechFeature[];
  };
}

export type AboutPageContent = AboutPageData;

export const aboutPageContent: AboutPageData = {
  header: {
    eyebrow: "About GuruOm Dental",
    title: "Our Story: Pioneering Digital Dentistry in Ahilyanagar",
    description:
      "From our first intraoral scanner in 2019 to becoming the largest emerging digital dental lab in Central Maharashtra — rooted in clinical excellence, compassionate care, and digital precision.",
  },

  milestones: [
    {
      value: "2019",
      label: "Founded in Ahilyanagar",
      sublabel: "Transitioned to digital platform with first intraoral scanner",
    },
    {
      value: "40+",
      label: "Team Members",
      sublabel: "Prosthodontists, dentists, technicians & skilled assistants",
    },
    {
      value: "30+",
      label: "Cities Served",
      sublabel: "Across Maharashtra including Pune, Navi Mumbai & Nashik",
    },
    {
      value: "DMLS",
      label: "3D Metal Printing",
      sublabel: "State-of-the-art CAD, 3D printers & automated milling",
    },
  ],

  story: {
    eyebrow: "Our Journey",
    title: "From Conventional Roots to Digital Pioneers",
    imageSlot: "aboutStory",
    paragraphs: [
      "In the heart of Ahilyanagar, (Ahmednagar) the Guru-Om Dental began its journey in 2019. Initially rooted in conventional practices, our founder Dr. Guruprasad Handal, a passionate Prosthodontist, foresaw a transformative shift towards digital dentistry. Recognizing the potential for innovation, we took a bold step and transitioned to a digital platform, marking the first of many pivotal moments in our story.",
      "Our journey took flight with the acquisition of our first intraoral scanner in 2019, setting the stage for our commitment to embracing technological advancements. In just a few short years, we evolved from performing traditional dental work to becoming pioneers in the digital realm. Today, our lab boasts an impressive array of state-of-the-art equipment, including advanced CAD software, 3D printers, milling machines, and even a 3D metal printer (DMLS).",
      "When we started, our team consisted of just seven dedicated individuals. Today, we have grown to a vibrant workforce of over 40 professionals, comprising prosthodontists, general dentists, qualified technicians, and skilled dental lab assistants. This growth reflects not only our success but also our commitment to quality and excellence in dental care.",
      "Initially serving only the Ahmednagar city, our reach now extends to over 30 cities across Maharashtra, including Pune, New Mumbai, Nashik, Sambhajinagar, Solapur, Dharashiv, Dhule, and Amravati.",
      "Our expertise has expanded significantly as well. While we once limited ourselves to basic dental prosthetics, we are now highly specialized in advanced procedures such as All-on-4, All-on-6 implants, basal implants, and full mouth rehabilitation, with exciting plans for patient-specific implants on the horizon.",
      "As we reflect on our remarkable journey, we are deeply grateful to our esteemed clients - dentists who have trusted us and collaborated with us throughout this evolution. Your support has been instrumental in making Guru-Om Dental Lab the largest emerging digital dental lab in Central Maharashtra. Together, we look forward to shaping the future of dentistry, driven by innovation, quality, and an unwavering commitment to our patients' smiles. Thank you for being a vital part of our story.",
    ],
    signoff: {
      salutation: "Regards,",
      founders: [
        {
          name: "Dr. Akshata Handal",
          degree: "B.D.S.",
          role: "Co-Founder & Dental Surgeon",
        },
        {
          name: "Dr. Guruprasad Handal",
          degree: "M.D.S. (Prosthodontics)",
          role: "Founder & Prosthodontist",
        },
      ],
    },
  },

  highlights: {
    title: "Capabilities & Geographic Reach",
    tech: [
      "Intraoral 3D Scanners",
      "Advanced Dental CAD Software",
      "Precision 3D Printers",
      "Automated Milling Machines",
      "Direct Metal Laser Sintering (DMLS 3D Metal Printer)",
    ],
    procedures: [
      "All-on-4 Dental Implants",
      "All-on-6 Dental Implants",
      "Basal Implants",
      "Full Mouth Rehabilitation",
      "Patient-Specific Custom Implants",
    ],
    cities: [
      "Ahilyanagar (Ahmednagar)",
      "Pune",
      "New Mumbai",
      "Nashik",
      "Sambhajinagar",
      "Solapur",
      "Dharashiv",
      "Dhule",
      "Amravati",
      "& 20+ more cities",
    ],
  },

  missionVision: {
    eyebrow: "Our Core Purpose",
    title: "Principles That Guide Every Diagnosis & Touch",
    cards: [
      {
        id: "mission",
        title: "Our Mission",
        description:
          "To provide painless, hospital-grade dental healthcare utilizing state-of-the-art digital workflows, ensuring natural tooth preservation and lasting comfort.",
        icon: "Target",
        tagline: "Precision & Compassion",
      },
      {
        id: "vision",
        title: "Our Vision",
        description:
          "To stand as the most trusted restorative and aesthetic dental sanctuary in Central Maharashtra, benchmarked against international standards of clinical excellence.",
        icon: "Eye",
        tagline: "Excellence Without Compromise",
      },
      {
        id: "values",
        title: "Our Clinical Ethics",
        description:
          "We operate with strict medical transparency: recommending only necessary treatments, providing written cost breakdowns, and ensuring unhurried patient consults.",
        icon: "ShieldCheck",
        tagline: "Honesty in Healthcare",
      },
    ],
    valuesHeading: "The Six Pillars of GuruOm Dental",
    values: [
      {
        id: "comfort",
        title: "Patient Comfort First",
        description:
          "Acoustic damping, gentle local anesthesia, and empathetic communication alleviate treatment apprehension completely.",
        icon: "Heart",
      },
      {
        id: "honesty",
        title: "Honest Diagnostics",
        description:
          "Full transparency with digital x-ray previews, upfront treatment cost breakdowns, and zero pressured upsells.",
        icon: "FileCheck",
      },
      {
        id: "precision",
        title: "Microscopic Precision",
        description:
          "Surgical magnification optics and CAD/CAM robotic milling guarantee sub-millimeter restorative accuracy.",
        icon: "Sparkles",
      },
      {
        id: "hygiene",
        title: "Hospital-Grade Hygiene",
        description:
          "Strict Class-B vacuum autoclaves, biological spore testing, and sterile disposable barriers for each operatory.",
        icon: "ShieldAlert",
      },
      {
        id: "education",
        title: "Empowered Education",
        description:
          "We take time to explain treatment rationales with 3D models, empowering you to make confident clinical choices.",
        icon: "BookOpen",
      },
      {
        id: "continuity",
        title: "Continuity of Care",
        description:
          "Personalized preventive maintenance timelines, dedicated follow-up reviews, and lifelong oral wellness support.",
        icon: "Clock",
      },
    ],
  },

  approach: {
    eyebrow: "Our Clinical Methodology",
    title: "How We Care For You, Step by Step",
    description:
      "Our four-stage consultation protocol ensures clarity, patient collaboration, and predictable clinical results without stress.",
    steps: [
      {
        step: "01",
        title: "Listen & Understand",
        description:
          "We begin every visit in a calm consultation setting, listening carefully to your oral health history, aesthetic goals, and any concerns or anxieties you have.",
        highlight: "Unhurried, attentive doctor-patient consultation",
      },
      {
        step: "02",
        title: "Comprehensive 3D Diagnostics",
        description:
          "Using sub-millimeter 3D CBCT scans and optical intraoral cameras, we assess tooth structure, bone density, and facial symmetry without messy impression putties.",
        highlight: "Radiation-optimized digital imaging with immediate chairside review",
      },
      {
        step: "03",
        title: "Co-Design Your Treatment Plan",
        description:
          "We present clear treatment pathways with digital smile simulations and transparent pricing. You choose the timeline and approach that suits you best.",
        highlight: "Interactive digital previews with zero hidden surprises",
      },
      {
        step: "04",
        title: "Gentle Care & Lifelong Follow-Up",
        description:
          "Our specialists deliver gentle, minimally invasive treatment followed by structured recovery checks and long-term preventive recall scheduling.",
        highlight: "Comfortable procedures followed by dedicated post-care support",
      },
    ],
  },

  clinicTech: {
    eyebrow: "Technology & Facilities",
    title: "Advanced In-House Clinical Infrastructure",
    description:
      "Combining surgical-grade diagnostics with digital laboratory craftsmanship under one roof in Ahilyanagar.",
    bento: [
      {
        slot: "aboutClinic1",
        caption: "Low-Dose 3D CBCT Computed Tomography",
        ratio: "4/3",
      },
      {
        slot: "aboutClinic2",
        caption: "Ergonomic Operatory Treatment Suites",
        ratio: "1/1",
      },
      {
        slot: "aboutClinic3",
        caption: "Multi-Barrier Class-B Sterilization Facility",
        ratio: "3/4",
      },
      {
        slot: "aboutClinic4",
        caption: "In-House Digital Dental Laboratory & Milling",
        ratio: "16/9",
      },
    ],
    features: [
      {
        title: "Carl Zeiss Surgical Loupes & Microscopes",
        description:
          "High-power optical magnification enables ultra-fine nerve canal debridement and precision ceramic margin adaptation.",
        badge: "Micro-Precision",
      },
      {
        title: "Intraoral 3D Optical Scanner",
        description:
          "Creates high-accuracy digital impressions in seconds with zero nausea or discomfort from traditional elastomeric trays.",
        badge: "Digital Comfort",
      },
      {
        title: "Computerized Local Anesthetic Delivery",
        description:
          "Microprocessor-metered anesthesia ensures virtually imperceptible tissue penetration and targeted pain relief.",
        badge: "Pain-Free",
      },
      {
        title: "Dedicated Sterile Operatory Cleanrooms",
        description:
          "Continuous medical-grade HEPA air filtration and multi-barrier sterilization protocols protect your peace of mind.",
        badge: "Hospital Safety",
      },
    ],
  },

  cta: {
    title: "Experience Calm, Precision Digital Dental Care",
    description:
      "Whether you need advanced full-mouth restoration, dental implants, or routine gentle care, our team in Ahilyanagar is here to welcome you.",
    primaryButton: {
      label: "Book an Appointment",
      href: "/appointment",
    },
    secondaryButton: {
      label: "Call Clinic",
      href: "tel:+919876543210",
    },
  },
};

export default aboutPageContent;
