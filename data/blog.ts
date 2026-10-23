/**
 * ALL POSTS ARE PLACEHOLDER SAMPLES. Replace with real, clinically reviewed articles.
 * Never publish medical claims that a qualified dentist has not verified.
 * 'Reviewed by' must only name a real doctor who actually reviewed the post.
 */

export interface BlogCategory {
  slug: string;
  label: string;
}

export const blogCategories: BlogCategory[] = [
  { slug: "oral-hygiene", label: "Oral Hygiene" },
  { slug: "treatments", label: "Treatments" },
  { slug: "kids-dental-care", label: "Kids' Dental Care" },
  { slug: "cosmetic-dentistry", label: "Cosmetic Dentistry" },
  { slug: "clinic-news", label: "Clinic News" },
];

export type ContentBlock =
  | { type: "heading"; level: 2 | 3; text: string; id?: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "quote"; text: string; cite?: string }
  | { type: "callout"; tone: "tip" | "note" | "warning"; title: string; text: string }
  | { type: "image"; slot: string; caption?: string };

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string; // ISO date YYYY-MM-DD
  updatedAt?: string; // ISO date YYYY-MM-DD
  authorName: string;
  authorRole: string;
  reviewedBySlug?: string; // Doctor slug from data/doctors.ts
  tags: string[];
  coverSlot: string; // blog1 to blog8
  featured: boolean; // Exactly one true
  relatedServiceSlug?: string; // from data/services.ts
  content: ContentBlock[];
}

export const blogPosts: BlogPost[] = [
  // 1. Featured Post
  {
    slug: "modern-dental-implants-guide",
    title: "The Complete Patient Guide to Modern Dental Implants",
    excerpt:
      "Explore how 3D surgical guides and biologically compatible titanium restorations provide durable, natural tooth replacements with predictable healing.",
    category: "treatments",
    publishedAt: "2026-09-15",
    updatedAt: "2026-10-10",
    authorName: "Clinical Editorial Team",
    authorRole: "Dental Health Communications",
    reviewedBySlug: "dr-om-patel",
    tags: ["Implants", "Restorative Care", "Oral Surgery", "Guided Surgery"],
    coverSlot: "blog1",
    featured: true,
    relatedServiceSlug: "dental-implants",
    content: [
      {
        type: "paragraph",
        text: "Tooth loss can affect everything from chewing confidence to natural facial proportions and jawbone density. Over the last decade, dental implantology has shifted dramatically toward computer-guided precision, making procedures significantly less invasive while offering predictable lifelong outcomes.",
      },
      {
        type: "callout",
        tone: "note",
        title: "Clinical Note",
        text: "Dental implants are titanium or zirconia fixtures placed into the jawbone to act as artificial roots. A thorough 3D CBCT bone assessment is always required to evaluate eligibility.",
      },
      {
        type: "heading",
        level: 2,
        text: "Understanding the Biological Foundation",
        id: "biological-foundation",
      },
      {
        type: "paragraph",
        text: "When a natural tooth is missing, the underlying alveolar bone gradually resorbs due to the lack of mechanical stimulation. Dental implants are unique among tooth replacement options because they actively preserve this bone architecture through osseointegration—a direct biological fusion between bone tissue and the implant surface.",
      },
      {
        type: "paragraph",
        text: "This integration provides a firm, immovable foundation that mimics the function of a natural tooth root, preventing neighboring teeth from tilting and maintaining balanced bite pressure across your entire dental arch.",
      },
      {
        type: "heading",
        level: 2,
        text: "The Role of 3D Computer-Guided Planning",
        id: "3d-guided-planning",
      },
      {
        type: "paragraph",
        text: "In traditional dentistry, implant placement relied heavily on two-dimensional X-rays. Today, digital 3D CBCT scans allow surgeons to examine bone width, nerve pathways, and sinus cavities in sub-millimeter detail before making any surgical incision.",
      },
      {
        type: "list",
        ordered: false,
        items: [
          "Pre-surgical digital mapping of the ideal prosthetic angle",
          "Custom surgical templates fabricated for pinpoint accuracy",
          "Minimally invasive keyhole placement reducing post-op swelling",
          "Accelerated recovery times and enhanced soft tissue preservation",
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "What to Expect Across Treatment Stages",
        id: "treatment-stages",
      },
      {
        type: "paragraph",
        text: "The implant journey generally proceeds in clearly defined phases tailored to your bone density. Following the initial consultation and surgical placement, a healing interval of several weeks allows osseointegration to mature before the final custom ceramic crown is securely seated.",
      },
      {
        type: "callout",
        tone: "tip",
        title: "Patient Recovery Tip",
        text: "Following soft-food recommendations and avoiding smoking during the initial 72 hours greatly supports blood clot stabilization and tissue healing.",
      },
      {
        type: "quote",
        text: "Modern implantology is no longer just about filling a gap; it is about restoring the natural harmony, bite dynamics, and lifelong confidence of your smile.",
        cite: "GuruOm Dental Surgical Department",
      },
      {
        type: "heading",
        level: 2,
        text: "Maintaining Your Implant for the Long Term",
        id: "long-term-maintenance",
      },
      {
        type: "paragraph",
        text: "While titanium dental implants cannot develop dental caries, the surrounding gum tissue requires diligent hygiene to prevent peri-implant inflammation. Consistent brushing, daily water flossing, and semi-annual clinical maintenance visits keep the supporting tissue healthy for decades.",
      },
      {
        type: "heading",
        level: 2,
        text: "Determining If You Are a Good Candidate",
        id: "candidate-criteria",
      },
      {
        type: "paragraph",
        text: "Most healthy adults with fully developed jaws are excellent candidates for implant restorations. Even patients who have experienced bone loss often qualify following gentle bone grafting or sinus elevation protocols.",
      },
    ],
  },

  // 2. Oral Hygiene
  {
    slug: "habits-that-protect-tooth-enamel",
    title: "Everyday Habits That Protect Your Tooth Enamel Naturally",
    excerpt:
      "Tooth enamel is the hardest substance in the human body, but once worn away, it cannot regenerate. Learn gentle, science-backed habits to safeguard it.",
    category: "oral-hygiene",
    publishedAt: "2026-09-28",
    authorName: "Dr. Ananya Deshmukh",
    authorRole: "Consultant Orthodontist & Dental Educator",
    reviewedBySlug: "dr-ananya-deshmukh",
    tags: ["Enamel Health", "Prevention", "Oral Hygiene", "Fluoride"],
    coverSlot: "blog2",
    featured: false,
    relatedServiceSlug: "cleaning-whitening",
    content: [
      {
        type: "paragraph",
        text: "Tooth enamel forms the crystalline outer shield of your teeth. While exceptionally resilient against everyday chewing forces, it remains susceptible to progressive acid demineralization and mechanical friction.",
      },
      {
        type: "heading",
        level: 2,
        text: "The Chemistry Behind Acid Demineralization",
        id: "acid-demineralization",
      },
      {
        type: "paragraph",
        text: "Whenever we consume citrus fruits, sodas, or fermentable carbohydrates, oral bacteria produce organic acids that lower the mouth's pH below the critical threshold of 5.5. At this acidity, calcium and phosphate ions begin dissolving from the enamel matrix.",
      },
      {
        type: "callout",
        tone: "note",
        title: "Salivary Defense",
        text: "Saliva serves as your natural mineral buffer. Drinking plain water after acidic meals helps neutralize acidity and re-deposit vital minerals onto weakened enamel prisms.",
      },
      {
        type: "heading",
        level: 2,
        text: "Smart Brushing Techniques and Timing",
        id: "brushing-timing",
      },
      {
        type: "paragraph",
        text: "A widespread mistake is brushing immediately after consuming citrus foods or coffee. Acid softens the surface layer, meaning immediate vigorous brushing can inadvertently scrub microscopic enamel crystals away.",
      },
      {
        type: "list",
        ordered: false,
        items: [
          "Wait at least 30 minutes after meals before brushing",
          "Use a soft-bristled toothbrush to prevent cervical enamel abrasion",
          "Incorporate remineralizing fluoride or hydroxyapatite toothpaste",
          "Maintain gentle circular motions instead of harsh horizontal scrubbing",
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "Addressing Nighttime Tooth Grinding",
        id: "tooth-grinding-bruxism",
      },
      {
        type: "paragraph",
        text: "Nocturnal bruxism (clenching or grinding during sleep) can exert hundreds of pounds of pressure on opposing teeth, causing micro-fractures, flattening of chewing cusps, and enamel chipping.",
      },
      {
        type: "paragraph",
        text: "A custom-fitted occlusal night guard cushions the dental arches, dissipating clenching forces and preserving the natural contours of your teeth.",
      },
      {
        type: "heading",
        level: 2,
        text: "Dietary Choices That Strengthen Minerals",
        id: "dietary-choices",
      },
      {
        type: "paragraph",
        text: "Enamel relies on a balanced intake of calcium, phosphorus, and vitamin D. Crunchy fibrous vegetables such as celery and carrots stimulate salivary flow, mechanically cleansing plaque bio-films while supporting mineral remineralization.",
      },
      {
        type: "heading",
        level: 2,
        text: "The Value of Preventive Clinical Cleanings",
        id: "preventive-cleanings",
      },
      {
        type: "paragraph",
        text: "Even diligent home brushing cannot remove hardened calculus deposits along the gumline. Professional ultrasonic prophylaxis every six months removes tartar build-up before it triggers gum recession or root exposure.",
      },
    ],
  },

  // 3. Kids' Dental Care
  {
    slug: "gentle-pediatric-dentistry-guide",
    title: "Gentle Pediatric Dentistry: Building Lifelong Smile Confidence",
    excerpt:
      "A child's early dental experiences shape their oral health attitudes for life. Discover how pediatric protocols turn dental visits into positive adventures.",
    category: "kids-dental-care",
    publishedAt: "2026-10-02",
    authorName: "Dr. Meera Joshi",
    authorRole: "Pediatric Dental Specialist",
    reviewedBySlug: "dr-meera-joshi",
    tags: ["Kids Dentistry", "Early Habits", "Cavity Prevention", "Pediatric Care"],
    coverSlot: "blog3",
    featured: false,
    relatedServiceSlug: "pediatric-dentistry",
    content: [
      {
        type: "paragraph",
        text: "Childhood dental visits do not have to be stressful. Modern pediatric dentistry combines child psychology, interactive education, and painless preventive therapies to ensure children view oral health as an empowering part of growing up.",
      },
      {
        type: "heading",
        level: 2,
        text: "Why Primary Milk Teeth Matter So Much",
        id: "primary-teeth-importance",
      },
      {
        type: "paragraph",
        text: "Many parents assume baby teeth are expendable because they eventually fall out. However, primary teeth perform several irreplaceable biological functions: they hold space in the jaw for incoming adult teeth, guide correct jaw growth, and facilitate clear speech development.",
      },
      {
        type: "callout",
        tone: "warning",
        title: "Early Loss Risk",
        text: "Premature loss of a primary molar can cause adjacent teeth to drift into the empty space, blocking the permanent tooth and leading to severe orthodontic crowding later in adolescence.",
      },
      {
        type: "heading",
        level: 2,
        text: "The 'Tell-Show-Do' Communication Method",
        id: "tell-show-do",
      },
      {
        type: "paragraph",
        text: "In our pediatric treatment rooms, clinicians use age-appropriate language to demystify dental instruments. We first explain what we are going to do using friendly metaphors, show the child how the gentle tool works on a finger or toy, and only then proceed with the procedure.",
      },
      {
        type: "list",
        ordered: false,
        items: [
          "Desensitizing children to the dental chair before any active treatment",
          "Rewarding curiosity and calm cooperation with positive reinforcement",
          "Empowering young patients by giving them control and 'pause' signals",
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "Dental Sealants: An Invisible Protective Shield",
        id: "dental-sealants",
      },
      {
        type: "paragraph",
        text: "The chewing surfaces of newly erupted adult molars have deep microscopic grooves and fissures where food particles easily lodge. Pit and fissure sealants flow into these grooves, creating a smooth, cleanable barrier that reduces cavity risk by up to 80%.",
      },
      {
        type: "heading",
        level: 2,
        text: "Making Daily Brushing Fun at Home",
        id: "brushing-fun-at-home",
      },
      {
        type: "paragraph",
        text: "Transforming two minutes of twice-daily brushing into an engaging routine with musical timers, colorful brushes, and parental co-brushing helps solidify healthy habits that carry into adulthood.",
      },
      {
        type: "heading",
        level: 2,
        text: "First Visit Milestones",
        id: "first-visit-milestones",
      },
      {
        type: "paragraph",
        text: "We recommend scheduling your child's first routine checkup around their first birthday or within six months of the first baby tooth erupting. Early familiarization builds trust and prevents dental anxiety before it ever starts.",
      },
    ],
  },

  // 4. Cosmetic Dentistry
  {
    slug: "clear-aligners-vs-traditional-braces",
    title: "Clear Aligners vs. Traditional Braces: Making the Right Aesthetic Choice",
    excerpt:
      "Compare modern transparent aligner systems with conventional brackets to understand treatment timelines, daily lifestyle impact, and clinical suitability.",
    category: "cosmetic-dentistry",
    publishedAt: "2026-10-05",
    authorName: "Clinical Editorial Team",
    authorRole: "Orthodontic & Aesthetic Review",
    reviewedBySlug: "dr-ananya-deshmukh",
    tags: ["Aligners", "Orthodontics", "Aesthetics", "Smile Design"],
    coverSlot: "blog4",
    featured: false,
    relatedServiceSlug: "orthodontics-aligners",
    content: [
      {
        type: "paragraph",
        text: "Straightening your teeth is no longer synonymous with years of conspicuous metal brackets and dietary restrictions. Advances in polymer engineering and 3D orthodontic planning have made clear aligners a first-choice solution for adults and teens alike.",
      },
      {
        type: "heading",
        level: 2,
        text: "How Clear Aligner Therapy Works",
        id: "how-aligners-work",
      },
      {
        type: "paragraph",
        text: "Clear aligners are custom-molded medical-grade thermoplastic trays designed from an optical digital scan of your mouth. Each successive tray in the series applies microscopic, calibrated biomechanical forces to nudge specific teeth into position.",
      },
      {
        type: "callout",
        tone: "tip",
        title: "Compliance Key",
        text: "Aligners must be worn for 20 to 22 hours each day, removed only for meals, hot drinks, and oral hygiene, to achieve planned tooth movements within the estimated timeframe.",
      },
      {
        type: "heading",
        level: 2,
        text: "Comparing Daily Lifestyle Impact",
        id: "lifestyle-comparison",
      },
      {
        type: "paragraph",
        text: "While traditional braces remain powerful tools for complex skeletal discrepancies, clear aligners offer distinct everyday advantages for working professionals and active adults.",
      },
      {
        type: "list",
        ordered: false,
        items: [
          "Virtually invisible aesthetic profile during business and social interactions",
          "Removable trays allow you to eat your favorite foods without restrictions",
          "Effortless flossing and brushing without specialized orthodontic threaders",
          "Smooth plastic design eliminates mouth irritation and broken archwires",
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "When Traditional Braces Are Preferable",
        id: "when-braces-preferred",
      },
      {
        type: "paragraph",
        text: "Certain severe orthodontic challenges, such as deep skeletal bite misalignments or severely rotated premolars, may respond more efficiently to fixed brackets where constant three-dimensional torque can be applied without relying on patient compliance.",
      },
      {
        type: "heading",
        level: 2,
        text: "Digital Simulation: Seeing Results in Advance",
        id: "digital-simulation",
      },
      {
        type: "paragraph",
        text: "One of the most exciting aspects of modern aligner treatment is the interactive 3D digital preview. Before starting, you can view a virtual week-by-week simulation of how your teeth will shift and what your finished smile will look like.",
      },
      {
        type: "heading",
        level: 2,
        text: "The Importance of Post-Treatment Retention",
        id: "retention-phase",
      },
      {
        type: "paragraph",
        text: "Regardless of whether you choose aligners or braces, teeth have a natural tendency to relapse toward their original positions. Wearing a clear nighttime retainer keeps your newly aligned smile stable for life.",
      },
    ],
  },

  // 5. Treatments
  {
    slug: "understanding-painless-root-canal-therapy",
    title: "Understanding Painless Root Canal Therapy in 2026",
    excerpt:
      "Root canal therapy has an outdated reputation for discomfort. Discover how modern rotary instruments and local anesthesia have transformed the procedure.",
    category: "treatments",
    publishedAt: "2026-10-09",
    authorName: "Dr. Guru Sharma",
    authorRole: "Endodontic Specialist",
    reviewedBySlug: "dr-guru-sharma",
    tags: ["Root Canal", "Endodontics", "Painless Care", "Tooth Preservation"],
    coverSlot: "blog5",
    featured: false,
    relatedServiceSlug: "root-canal-treatment",
    content: [
      {
        type: "paragraph",
        text: "For generations, the phrase 'root canal' inspired unwarranted hesitation. In modern endodontic practice, root canal therapy does not cause pain—it relieves the intense throbbing pain caused by an infected tooth pulp.",
      },
      {
        type: "heading",
        level: 2,
        text: "Why Dental Pulp Becomes Infected",
        id: "pulp-infection-causes",
      },
      {
        type: "paragraph",
        text: "Beneath the outer enamel and dentin lies the dental pulp—a living chamber containing sensitive nerves and blood vessels. When deep untreated decay, a crack, or trauma breaches this chamber, oral bacteria trigger acute inflammation known as pulpitis.",
      },
      {
        type: "callout",
        tone: "warning",
        title: "Do Not Delay",
        text: "An untreated pulp infection does not heal on its own. Eventually, the bacteria can spread through the root apex into the surrounding jawbone, causing a painful abscess.",
      },
      {
        type: "heading",
        level: 2,
        text: "Advanced Technologies That Eliminate Discomfort",
        id: "painless-technologies",
      },
      {
        type: "paragraph",
        text: "Several modern clinical breakthroughs have turned root canals into comfortable, routine procedures that feel comparable to receiving a routine filling.",
      },
      {
        type: "list",
        ordered: false,
        items: [
          "Computer-buffered local anesthesia for swift, complete numbness",
          "High-magnification surgical loupes and dental operating microscopes",
          "Flexible nickel-titanium rotary files that clean curved canals gently",
          "Ultrasonic acoustic irrigation that disinfects microscopic lateral canals",
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "Step-by-Step Clinical Procedure",
        id: "step-by-step-procedure",
      },
      {
        type: "paragraph",
        text: "After verifying complete numbness, the specialist creates a conservative micro-opening, cleans away infected tissue, thoroughly sterilizes the inner canal walls, and seals the space with a biocompatible material called gutta-percha.",
      },
      {
        type: "heading",
        level: 2,
        text: "Why a Protective Dental Crown Is Essential",
        id: "protective-crown-necessity",
      },
      {
        type: "paragraph",
        text: "Because a tooth that has undergone endodontic therapy no longer has an internal blood supply, its remaining tooth structure becomes more brittle. Placing a custom ceramic or zirconia crown reinforces the tooth against chewing fractures.",
      },
      {
        type: "heading",
        level: 2,
        text: "Saving Your Natural Tooth vs. Extraction",
        id: "natural-tooth-preservation",
      },
      {
        type: "paragraph",
        text: "Whenever clinically feasible, saving your natural tooth with endodontic treatment is preferable to extraction. A preserved natural root maintains your innate sensory feedback, bone structure, and chewing dynamics.",
      },
    ],
  },

  // 6. Cosmetic Dentistry
  {
    slug: "porcelain-veneers-artistry-longevity",
    title: "Porcelain Veneers: Artistry, Longevity, and Natural Smile Harmony",
    excerpt:
      "Learn how custom ceramic veneers correct discoloration, minor gaps, and worn edges while preserving healthy enamel with conservative prep protocols.",
    category: "cosmetic-dentistry",
    publishedAt: "2026-10-12",
    authorName: "Dr. Om Patel",
    authorRole: "Chief Dental Surgeon & Aesthetic Consultant",
    reviewedBySlug: "dr-om-patel",
    tags: ["Veneers", "Cosmetic Dentistry", "Smile Aesthetics", "Ceramics"],
    coverSlot: "blog6",
    featured: false,
    relatedServiceSlug: "cosmetic-veneers",
    content: [
      {
        type: "paragraph",
        text: "A confident smile is not merely about having blindingly white teeth; it is about achieving natural harmony with your facial symmetry, lip dynamics, and complexion. Porcelain veneers offer one of the most transformative yet conservative tools in aesthetic dentistry.",
      },
      {
        type: "heading",
        level: 2,
        text: "What Are Dental Veneers?",
        id: "what-are-veneers",
      },
      {
        type: "paragraph",
        text: "Porcelain veneers are ultra-thin shells of high-strength feldspathic or lithium disilicate ceramic that are bonded to the front surfaces of your teeth. They conceal deep intrinsic stains, chips, gaps, and minor misalignments.",
      },
      {
        type: "callout",
        tone: "tip",
        title: "Conservative Enamel Preservation",
        text: "Modern minimally invasive protocols require only 0.3 to 0.5 mm of superficial enamel reduction—often no more than the thickness of a contact lens.",
      },
      {
        type: "heading",
        level: 2,
        text: "The Art of Digital Smile Design",
        id: "digital-smile-design",
      },
      {
        type: "paragraph",
        text: "Before any tooth preparation begins, high-resolution facial photographs and intraoral 3D scans are used to map the golden proportions of your smile. A temporary diagnostic mock-up allows you to preview the look, shape, and length of your new smile directly in your mouth.",
      },
      {
        type: "list",
        ordered: false,
        items: [
          "Custom color-matching mimicking natural enamel translucency and light refraction",
          "Hand-layered ceramics with subtle micro-textures to avoid artificial looks",
          "Biocompatible bonding adhesives that resist staining and marginal discoloration",
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "Porcelain vs. Composite Resin Veneers",
        id: "porcelain-vs-composite",
      },
      {
        type: "paragraph",
        text: "While composite resin veneers can be placed chair-side in a single appointment, laboratory-fabricated porcelain veneers offer superior resistance to coffee and tea stains, greater mechanical strength, and realistic light diffusion that lasts 15 years or more.",
      },
      {
        type: "heading",
        level: 2,
        text: "Caring for Your Veneers",
        id: "caring-for-veneers",
      },
      {
        type: "paragraph",
        text: "Maintaining veneers is straightforward: practice daily brushing with non-abrasive toothpaste, floss around margins, wear a protective guard if you grind your teeth at night, and avoid using your teeth to tear open packaging.",
      },
      {
        type: "heading",
        level: 2,
        text: "Personalized Aesthetic Consultations",
        id: "aesthetic-consultations",
      },
      {
        type: "paragraph",
        text: "Every smile makeover is uniquely customized. During your consultation, we evaluate your facial contours, speech patterns, and personal aesthetic goals to craft a balanced smile that looks genuinely yours.",
      },
    ],
  },

  // 7. Clinic News
  {
    slug: "guruom-welcomes-advanced-3d-cbct-imaging",
    title: "GuruOm Dental Welcomes Advanced Low-Radiation 3D CBCT Imaging Suite",
    excerpt:
      "Our Ahilyanagar clinic expands diagnostic capabilities with sub-millimeter Cone Beam Computed Tomography for safer, more precise surgical planning.",
    category: "clinic-news",
    publishedAt: "2026-10-16",
    authorName: "Clinical Editorial Team",
    authorRole: "Technology & Infrastructure Desk",
    tags: ["Clinic News", "3D Imaging", "Diagnostics", "Patient Safety"],
    coverSlot: "blog7",
    featured: false,
    relatedServiceSlug: "general-dentistry",
    content: [
      {
        type: "paragraph",
        text: "We are thrilled to announce the successful installation and clinical commissioning of our next-generation 3D Cone Beam Computed Tomography (CBCT) diagnostic suite at GuruOm Dental in Ahilyanagar.",
      },
      {
        type: "heading",
        level: 2,
        text: "Why 3D Imaging Outperforms 2D Radiographs",
        id: "3d-imaging-advantages",
      },
      {
        type: "paragraph",
        text: "Traditional two-dimensional dental X-rays flatten complex three-dimensional anatomical structures into a single overlapping view. A 3D CBCT scan generates comprehensive volumetric slices, allowing our specialists to rotate, zoom, and inspect anatomy from any angle.",
      },
      {
        type: "callout",
        tone: "note",
        title: "Ultra-Low Dose Technology",
        text: "Our new imaging system uses advanced pulsed collimation algorithms, providing exceptional diagnostic clarity with up to 75% lower radiation exposure compared to conventional medical CT scanners.",
      },
      {
        type: "heading",
        level: 2,
        text: "Transforming Surgical Precision in Ahilyanagar",
        id: "transforming-precision",
      },
      {
        type: "paragraph",
        text: "The integration of in-house 3D diagnostics directly benefits patients across multiple surgical disciplines:",
      },
      {
        type: "list",
        ordered: false,
        items: [
          "Flapless dental implant surgery with 3D-printed guided templates",
          "Accurate localization of impacted wisdom teeth relative to inferior alveolar nerves",
          "Detection of hidden fourth canals in complex root canal anatomy",
          "Comprehensive evaluation of temporomandibular joint (TMJ) disorders",
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "Immediate In-House Diagnostics Without Travel",
        id: "immediate-in-house-diagnostics",
      },
      {
        type: "paragraph",
        text: "Previously, patients requiring volumetric scans often had to visit external diagnostic imaging centers. With in-house scanning, scans take less than 20 seconds, and 3D reconstructions are rendered instantly on chair-side monitors during your consultation.",
      },
      {
        type: "heading",
        level: 2,
        text: "Our Ongoing Commitment to Clinical Innovation",
        id: "commitment-to-innovation",
      },
      {
        type: "paragraph",
        text: "Investing in advanced diagnostic hardware is part of our unwavering mission to bring world-class, biologically conservative dentistry to our community in Ahilyanagar and surrounding districts.",
      },
      {
        type: "heading",
        level: 2,
        text: "Schedule a Diagnostic Consultation",
        id: "schedule-diagnostic-visit",
      },
      {
        type: "paragraph",
        text: "Whether planning an implant restoration or investigating persistent dental discomfort, our specialists are ready to provide clear, visual answers through precision imaging.",
      },
    ],
  },

  // 8. Oral Hygiene
  {
    slug: "the-link-between-gum-health-and-systemic-wellness",
    title: "The Mouth-Body Connection: How Gum Health Influences Systemic Wellness",
    excerpt:
      "Emerging medical research highlights the direct biological link between periodontal gum inflammation, cardiovascular health, and blood sugar control.",
    category: "oral-hygiene",
    publishedAt: "2026-10-20",
    authorName: "Dr. Vikram Kulkarni",
    authorRole: "Periodontist & Oral Medicine Specialist",
    reviewedBySlug: "dr-vikram-kulkarni",
    tags: ["Periodontics", "Gum Disease", "Systemic Health", "Prevention"],
    coverSlot: "blog8",
    featured: false,
    relatedServiceSlug: "general-dentistry",
    content: [
      {
        type: "paragraph",
        text: "For decades, medicine treated oral health in isolation from general bodily wellness. Today, extensive clinical research confirms that the mouth is an integral gateway to systemic physiology, with chronic gum disease playing a recognized role in overall health.",
      },
      {
        type: "heading",
        level: 2,
        text: "What Is Periodontal Disease?",
        id: "what-is-periodontal-disease",
      },
      {
        type: "paragraph",
        text: "Periodontal disease begins as gingivitis—inflammation of the gums caused by bacterial plaque accumulation along the cervical margins. Left untreated, bacteria infiltrate deeper below the gumline, destroying the periodontal ligament and alveolar bone supporting the teeth.",
      },
      {
        type: "callout",
        tone: "warning",
        title: "Silent Progression",
        text: "Gum disease is often painless in its early and intermediate stages. Bleeding during brushing or flossing is the earliest warning sign that periodontal inflammation is present.",
      },
      {
        type: "heading",
        level: 2,
        text: "The Inflammatory Pathway to Systemic Health",
        id: "inflammatory-pathway",
      },
      {
        type: "paragraph",
        text: "When gums are chronically ulcerated and inflamed, periodontal bacteria and inflammatory cytokines can enter the bloodstream, triggering low-grade systemic inflammation throughout the vascular system.",
      },
      {
        type: "list",
        ordered: false,
        items: [
          "Cardiovascular health: Chronic bacteremia can contribute to arterial plaque instability",
          "Diabetes management: Severe periodontitis increases systemic insulin resistance",
          "Respiratory wellness: Inhaling oral bacteria can exacerbate chronic pulmonary conditions",
          "Pregnancy outcomes: Periodontal inflammation has been associated with pre-term birth risks",
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "How Periodontal Therapy Restores Balance",
        id: "restoring-balance",
      },
      {
        type: "paragraph",
        text: "Deep periodontal cleanings—known as scaling and root planing—dislodge subgingival bacterial bio-films and smooth root surfaces to allow gum tissue to heal and reattach firmly to the teeth.",
      },
      {
        type: "heading",
        level: 2,
        text: "Daily Actions to Guard Your Periodontal Health",
        id: "daily-periodontal-actions",
      },
      {
        type: "paragraph",
        text: "Thorough interdental cleaning using dental floss or interdental brushes once daily is essential because standard toothbrushes miss the vulnerable 35% of tooth surface area between adjacent teeth.",
      },
      {
        type: "heading",
        level: 2,
        text: "Proactive Screenings for Whole-Body Health",
        id: "proactive-screenings",
      },
      {
        type: "paragraph",
        text: "Routine periodontal probing during bi-annual cleanings allows our clinical team to measure pocket depths and arrest early gum disease before permanent bone loss occurs.",
      },
    ],
  },
];

// ============================================================================
// BLOG UTILITY & QUERY HELPERS
// ============================================================================

/**
 * Retrieves a single post by unique slug.
 */
export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

/**
 * Finds up to `limit` related posts: prioritizing same category, then shared tags.
 */
export function getRelatedPosts(currentSlug: string, limit = 3): BlogPost[] {
  const current = getPostBySlug(currentSlug);
  if (!current) return [];

  const others = blogPosts.filter((p) => p.slug !== currentSlug);

  return others
    .map((post) => {
      let score = 0;
      if (post.category === current.category) score += 3;
      const sharedTags = post.tags.filter((tag) => current.tags.includes(tag)).length;
      score += sharedTags;
      return { post, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.post);
}

/**
 * Returns previous and next posts for bottom navigation.
 */
export function getAdjacentPosts(currentSlug: string): {
  prev: BlogPost | null;
  next: BlogPost | null;
} {
  const index = blogPosts.findIndex((p) => p.slug === currentSlug);
  if (index === -1) return { prev: null, next: null };

  const prev = index > 0 ? blogPosts[index - 1] : null;
  const next = index < blogPosts.length - 1 ? blogPosts[index + 1] : null;

  return { prev, next };
}

/**
 * Computes reading time in minutes (200 words per minute, minimum 1).
 */
export function readingTimeMinutes(post: BlogPost): number {
  let wordCount = 0;

  for (const block of post.content) {
    if (block.type === "paragraph" || block.type === "heading" || block.type === "quote") {
      wordCount += block.text.split(/\s+/).filter(Boolean).length;
    } else if (block.type === "list") {
      for (const item of block.items) {
        wordCount += item.split(/\s+/).filter(Boolean).length;
      }
    } else if (block.type === "callout") {
      wordCount += (block.title + " " + block.text).split(/\s+/).filter(Boolean).length;
    }
  }

  const minutes = Math.ceil(wordCount / 200);
  return Math.max(1, minutes);
}

/**
 * Formats ISO date to a standardized string (e.g. "15 Oct 2026")
 * Uses fixed locale and timezone to prevent server/client hydration mismatches.
 */
export function formatDate(isoDate: string): string {
  try {
    const date = new Date(isoDate + "T00:00:00");
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return isoDate;
  }
}
