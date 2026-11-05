/**
 * Shared Services Data Source
 * Powers the homepage Services grid, /services catalogue, and /services/[slug] dynamic routes.
 *
 * NOTE FOR CLINIC ADMINISTRATOR:
 * Replace with real clinical information reviewed by a dentist. Do not publish unverified medical claims.
 * All clinical descriptions, timelines, and fees below are original placeholder data.
 */

export const STANDARD_CLINICAL_DISCLAIMER =
  "Whether a treatment is suitable for you is decided by your dentist after an examination.";

export interface ServiceProcessStep {
  title: string;
  text: string;
}

export interface ServiceFaq {
  question: string;
  answer: string;
}

export interface ServiceItem {
  slug: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  overview: [string, string];
  icon: string;
  imageSlot: string;
  features: string[];
  duration: string;
  startingPrice: string;
  idealFor: string[];
  processSteps: ServiceProcessStep[];
  benefits: string[];
  aftercare: string[];
  faqs: ServiceFaq[];
  doctorSpecialties: string[];
  seoDescription: string;
}

export const servicesData: ServiceItem[] = [
  {
    slug: "general-dentistry",
    title: "General Dentistry",
    shortDescription:
      "Comprehensive oral health examinations, preventive screenings, and restorative tooth-colored fillings.",
    longDescription:
      "Our foundational general dentistry services focus on proactive prevention and conservative tooth preservation. We combine digital diagnostics, low-radiation imaging, and gentle restorative materials to protect your oral biological foundation. Every routine visit is engineered for maximum comfort, transparency, and clinical excellence.",
    overview: [
      "General dental care forms the foundation of lifelong oral wellness. Our routine check-ups assess teeth, gums, and oral soft tissues to identify minor concerns before they require complex restorative procedures. (Replace with the clinic's real information)",
      "Using digital intraoral diagnostics and conservative composite materials, we restore damaged enamel while maintaining natural aesthetics and healthy tooth structure. (Replace with the clinic's real information)",
    ],
    icon: "Stethoscope",
    imageSlot: "service1",
    features: [
      "Digital bite analysis",
      "Composite enamel fillings",
      "Periodontal gum evaluation",
      "Oral cancer screening",
    ],
    duration: "30 to 45 min",
    startingPrice: "From Rs. 500 (Placeholder)",
    idealFor: [
      "Patients due for a regular 6-month checkup",
      "Mild tooth sensitivity or early cavity symptoms",
      "Chipped, cracked, or worn restorative fillings",
      "Individuals wanting proactive oral health tracking",
    ],
    processSteps: [
      {
        title: "1. Diagnostic Examination",
        text: "Digital low-dose imaging and intraoral camera screening to examine every tooth surface and gum margin.",
      },
      {
        title: "2. Findings Review",
        text: "Your clinician reviews findings on high-definition chairside screens and discusses personalized care options.",
      },
      {
        title: "3. Conservative Treatment",
        text: "Gentle removal of decay and placement of biocompatible, tooth-shaded composite restorations if required.",
      },
      {
        title: "4. Prevention Guidance",
        text: "Tailored hygiene advice and scheduled recall recommendations to sustain your long-term smile vitality.",
      },
    ],
    benefits: [
      "Early detection of cavities and enamel erosion",
      "Tooth-colored restorations matching natural shade",
      "Minimally invasive, tissue-preserving techniques",
      "Clear, transparent treatment estimates prior to care",
    ],
    aftercare: [
      "Wait until local anesthesia completely wears off before chewing hot foods",
      "Maintain twice-daily brushing with a soft-bristle toothbrush",
      "Report persistent sensitivity or bite unevenness to our team promptly",
      "Attend scheduled routine hygiene checkups twice a year",
    ],
    faqs: [
      {
        question: "How often should I schedule a routine dental checkup?",
        answer:
          "Most dentists recommend an examination every six months. Patients with specific periodontal needs or existing restorations may benefit from tailored recall intervals.",
      },
      {
        question: "Do modern composite tooth fillings look natural?",
        answer:
          "Yes. Modern composite resins are carefully shaded and layered to match the translucency and tone of your surrounding natural enamel.",
      },
      {
        question: "What should I do if a filling feels slightly elevated when biting?",
        answer:
          "Please call our clinic for a brief visit. A micro-adjustment of the filling takes only minutes and ensures your bite is completely balanced.",
      },
    ],
    doctorSpecialties: ["Preventive Care", "Oral Surgery"],
    seoDescription:
      "Comprehensive general dentistry in Ahilyanagar: routine examinations, digital X-rays, and tooth-colored composite fillings for the whole family.",
  },
  {
    slug: "cleaning-whitening",
    title: "Teeth Cleaning & Whitening",
    shortDescription:
      "Painless ultrasonic bio-film scaling and gentle enamel-safe cosmetic whitening for a luminous smile.",
    longDescription:
      "Restore natural radiance and gum vitality through specialized prophylaxis protocols. We use computer-controlled ultrasonic scaling to dislodge tartar and bio-film without scraping sensitive enamel. Finish with medical-grade cosmetic teeth whitening that safely lifts deep stains while preserving tooth sensitivity.",
    overview: [
      "Professional dental scaling removes hardened calculus, plaque, and bacterial biofilms that cannot be addressed by home brushing alone. Our prophylaxis protocols protect gum health and freshen breath. (Replace with the clinic's real information)",
      "When external staining from tea, coffee, or spices accumulates, controlled clinical whitening treatments lift stains evenly while respecting the integrity of natural enamel. (Replace with the clinic's real information)",
    ],
    icon: "Sparkles",
    imageSlot: "service2",
    features: [
      "Painless ultrasonic scaling",
      "Bio-film air polishing",
      "Laser enamel whitening",
      "Sensitivity relief fluoride",
    ],
    duration: "45 to 60 min",
    startingPrice: "From Rs. 1,200 (Placeholder)",
    idealFor: [
      "Superficial tea, coffee, and dietary enamel stains",
      "Plaque, calculus, or tartar buildup along gum margins",
      "Individuals wanting fresh breath and clean teeth",
      "Patients preparing for special personal or family occasions",
    ],
    processSteps: [
      {
        title: "1. Plaque & Gum Assessment",
        text: "Detailed visual evaluation of calculus distribution and gum margin stability.",
      },
      {
        title: "2. Ultrasonic Bio-film Scaling",
        text: "High-frequency water-cooled scaling tips dislodge tartar gently with minimal vibration.",
      },
      {
        title: "3. Air Micro-Polishing",
        text: "Fine polishing paste removes residual surface stains and smoothens tooth enamel.",
      },
      {
        title: "4. Whitening & Sensitivity Shield",
        text: "Optional clinical whitening gel application followed by a soothing remineralizing fluoride rinse.",
      },
    ],
    benefits: [
      "Interception of early gingival inflammation and bleeding",
      "Noticeably brighter, cleaner teeth in a single clinical visit",
      "Smooth enamel surfaces that resist new plaque adhesion",
      "Safe, clinically monitored cosmetic shade enhancement",
    ],
    aftercare: [
      "Avoid intensely pigmented foods and drinks (tea, coffee, turmeric) for 48 hours",
      "Use sensitivity-soothing toothpaste if transient temperature sensitivity occurs",
      "Rinse gently with lukewarm water after eating during the first 24 hours",
      "Continue daily interdental flossing and soft-bristled tooth brushing",
    ],
    faqs: [
      {
        question: "Does ultrasonic teeth cleaning damage tooth enamel?",
        answer:
          "No. Ultrasonic scaling utilizes gentle vibrations and water flow to detach calculus from the tooth surface without eroding underlying enamel structure.",
      },
      {
        question: "How long do the results of cosmetic teeth whitening last?",
        answer:
          "Results typically last from 6 months to over a year, depending on personal dietary habits, oral hygiene routines, and consumption of staining beverages.",
      },
      {
        question: "Will teeth whitening cause persistent sensitivity?",
        answer:
          "Temporary mild sensitivity may occur for 24 to 48 hours following clinical whitening. We apply desensitizing agents immediately following the procedure to minimize discomfort.",
      },
    ],
    doctorSpecialties: ["Preventive Care", "Cosmetic Dentistry"],
    seoDescription:
      "Gentle ultrasonic dental scaling and enamel-safe teeth whitening in Ahilyanagar. Remove stubborn stains and protect gum health comfortably.",
  },
  {
    slug: "orthodontics-aligners",
    title: "Orthodontics & Aligners",
    shortDescription:
      "Clear invisible aligners and gentle orthodontic corrections that discreetly straighten your smile.",
    longDescription:
      "Realign your teeth with precision 3D-scanned invisible aligners designed for daily comfort and seamless aesthetics. Our digital smile planning maps each micro-movement in advance so you visualize your final alignment before starting. Enjoy freedom without metal brackets, wire pokes, or dietary compromises.",
    overview: [
      "Orthodontic therapy corrects dental crowding, spacing, and irregular bites to improve chewing function and oral hygiene access. Modern clear aligners offer a transparent, removable alternative to conventional braces. (Replace with the clinic's real information)",
      "Through digital intraoral optical scans, treatment pathways are planned in sequence. Custom-milled clear aligner trays apply gentle, continuous pressure to guide teeth into balanced positions. (Replace with the clinic's real information)",
    ],
    icon: "Smile",
    imageSlot: "service3",
    features: [
      "3D digital scan preview",
      "Removable clear trays",
      "Zero wire irritation",
      "Comfortable bi-weekly stages",
    ],
    duration: "6 to 12 Months Avg.",
    startingPrice: "From Rs. 35,000 (Placeholder)",
    idealFor: [
      "Crowded, rotated, or overlapping front teeth",
      "Noticeable gaps or spacing between adjacent teeth",
      "Mild to moderate overbite, underbite, or crossbite",
      "Adults and teens seeking discreet smile correction",
    ],
    processSteps: [
      {
        title: "1. 3D Digital Intraoral Scan",
        text: "Comfortable optical scanning creates a precise 3D model of your dental arches without messy impression molds.",
      },
      {
        title: "2. Digital Simulation & Staging",
        text: "Your specialist maps sequential tooth movements and reviews the anticipated final result with you.",
      },
      {
        title: "3. Tray Delivery & Fitting",
        text: "Receive custom medical-grade aligner sets with detailed instructions on wear duration and daily care.",
      },
      {
        title: "4. Progress Tracking & Retainers",
        text: "Periodic check-in visits verify movement progress, concluding with retention trays to stabilize results.",
      },
    ],
    benefits: [
      "Virtually unnoticeable clear trays for confident everyday wear",
      "Removable for effortless eating, brushing, and flossing",
      "Zero metal wires or sharp bracket edges to cause mouth irritation",
      "Predictable computerized progression visualized before starting",
    ],
    aftercare: [
      "Wear aligner trays for 20 to 22 hours per day as instructed by your orthodontist",
      "Remove aligners before eating or drinking warm, sugary, or colored liquids",
      "Clean aligners with lukewarm water and a dedicated soft brush daily",
      "Wear retainers consistently post-treatment to maintain your aligned smile",
    ],
    faqs: [
      {
        question: "How many hours a day do I need to wear clear aligners?",
        answer:
          "For optimal clinical outcomes, aligners should be worn 20 to 22 hours daily, removing them only for meals, brushing, and flossing.",
      },
      {
        question: "Are clear aligners suitable for teenagers as well as adults?",
        answer:
          "Yes. Clear aligners can treat many adolescent and adult orthodontic conditions provided second permanent molars have erupted and compliance is maintained.",
      },
      {
        question: "Is aligner treatment painful?",
        answer:
          "Patients typically feel mild pressure for 1 to 2 days after switching to a new tray stage, which is a normal indicator that teeth are shifting as planned.",
      },
    ],
    doctorSpecialties: ["Orthodontics", "Clear Aligners"],
    seoDescription:
      "Clear invisible aligners and orthodontic treatment in Ahilyanagar. Discreetly straighten crowded teeth with digital 3D treatment planning.",
  },
  {
    slug: "dental-implants",
    title: "Dental Implants",
    shortDescription:
      "Swiss and German titanium and zirconia implants placed with 3D computer-guided flapless surgery.",
    longDescription:
      "Permanent, bio-integrated tooth replacement that restores natural bite strength and youthful facial contours. Utilizing CBCT guided surgical templates, our implantologists place fixtures with sub-millimeter precision and minimal tissue trauma. Enjoy natural-feeling restorations engineered to last a lifetime.",
    overview: [
      "Dental implants replace missing tooth roots with biocompatible titanium or zirconia fixtures that integrate directly with the jawbone. They offer a stable, standalone solution without altering neighboring teeth. (Replace with the clinic's real information)",
      "Whether replacing a single tooth, multiple missing teeth, or stabilizing a full dental arch, implant-supported crowns and bridges replicate the natural appearance, chewing capacity, and contours of healthy dentition. (Replace with the clinic's real information)",
    ],
    icon: "ShieldCheck",
    imageSlot: "service4",
    features: [
      "3D computer-guided placement",
      "Biocompatible titanium/zirconia",
      "Same-day provisional loading",
      "Lifetime structural stability",
    ],
    duration: "Single Session (45 min)",
    startingPrice: "From Rs. 22,000 (Placeholder)",
    idealFor: [
      "Single or multiple missing teeth from injury or decay",
      "Patients wanting an alternative to removable partial dentures",
      "Loose or unstable full dentures seeking firm retention",
      "Individuals wanting to preserve natural jawbone volume",
    ],
    processSteps: [
      {
        title: "1. 3D CBCT Bone Assessment",
        text: "Volumetric bone density scans and digital planning evaluate bone architecture and nerve canal positions.",
      },
      {
        title: "2. Guided Surgical Placement",
        text: "The sterile biocompatible implant fixture is positioned with computerized precision under local anesthesia.",
      },
      {
        title: "3. Osseointegration Period",
        text: "Natural bone integrates securely with the implant surface over several weeks to form a permanent root base.",
      },
      {
        title: "4. Custom Crown Restoration",
        text: "A precision-milled ceramic crown is securely attached to replicate natural tooth contours and chewing force.",
      },
    ],
    benefits: [
      "Permanent tooth replacement that prevents adjacent teeth from drifting",
      "Restores up to 95% of natural chewing efficiency and speech clarity",
      "Preserves alveolar jawbone density and natural facial profile",
      "Adjacent natural teeth do not need to be shaved down for support",
    ],
    aftercare: [
      "Follow a soft food diet for the first few days following placement",
      "Avoid vigorous rinsing, spitting, or drinking through straws immediately post-op",
      "Take prescribed supportive medications and antimicrobial rinses as advised",
      "Maintain diligent flossing and hygiene around the implant restoration",
    ],
    faqs: [
      {
        question: "Is dental implant surgery painful?",
        answer:
          "The procedure is performed under effective local anesthesia. Most patients report feeling only mild vibration during placement and minor post-op soreness managed with standard analgesics.",
      },
      {
        question: "How long does a dental implant last?",
        answer:
          "With disciplined oral hygiene and regular preventive cleanings, biocompatible dental implants have documented success rates exceeding 95% over multiple decades.",
      },
      {
        question: "What if I have reduced bone density in my jaw?",
        answer:
          "Supplemental procedures such as targeted bone grafting or sinus elevation can often restore sufficient bone volume to support stable implant placement.",
      },
    ],
    doctorSpecialties: ["Implantology", "Oral Surgery"],
    seoDescription:
      "Advanced dental implant surgery in Ahilyanagar. Long-lasting, natural-feeling tooth replacements placed with 3D computer-guided precision.",
  },
  {
    slug: "root-canal-treatment",
    title: "Root Canal Treatment",
    shortDescription:
      "Painless, single-sitting root canal therapy performed under high-magnification surgical operating microscopes.",
    longDescription:
      "Preserve severely compromised teeth and eliminate pain in a tranquil, anxiety-free setting. Microscopic endodontics allows our specialists to navigate complex root anatomies and micro-canals with surgical accuracy. Thermal 3D obturation ensures a sterile, hermetic seal that prevents recurrent infection.",
    overview: [
      "Root canal therapy removes infected or inflamed nerve tissue from inside a tooth, relieving acute discomfort while preserving your natural tooth root. Saving the natural tooth helps sustain natural bite alignment. (Replace with the clinic's real information)",
      "Under high-magnification endodontic illumination and computerized apex locators, micro-canals are cleaned, disinfected, and hermetically sealed against future bacterial infiltration. (Replace with the clinic's real information)",
    ],
    icon: "Activity",
    imageSlot: "service5",
    features: [
      "Carl Zeiss surgical microscope",
      "Painless computerized anesthesia",
      "Single-visit completion",
      "Biocompatible hermetic seal",
    ],
    duration: "45 to 60 min",
    startingPrice: "From Rs. 3,500 (Placeholder)",
    idealFor: [
      "Severe or lingering toothaches, particularly when chewing",
      "Prolonged sensitivity to hot or cold temperatures",
      "Localized swelling or tenderness in adjacent gum tissue",
      "Deep dental decay extending into the inner tooth pulp",
    ],
    processSteps: [
      {
        title: "1. Diagnostic Digital Imaging",
        text: "Digital radiographs map root canal count, curvature, and the extent of periapical inflammation.",
      },
      {
        title: "2. Gentle Canal Access",
        text: "Local anesthesia ensures complete numbness before creating a conservative opening to access the pulp chamber.",
      },
      {
        title: "3. Micro-Debridement & Shaping",
        text: "Flexible rotary nickel-titanium files and irrigants sterilize and shape each microscopic canal.",
      },
      {
        title: "4. 3D Biocompatible Obturation",
        text: "Canals are filled and hermetically sealed, followed by placement of a protective restorative core and crown.",
      },
    ],
    benefits: [
      "Immediate elimination of acute dental infection and throbbing pain",
      "Maintains your natural tooth root in the jawbone structure",
      "Avoids the expense and complexity of tooth extraction and replacement",
      "Typically completed in a single comfortable clinical appointment",
    ],
    aftercare: [
      "Avoid chewing tough or sticky foods on the treated tooth until the final crown is placed",
      "Mild tenderness around the root tip for 2 to 3 days is normal and relieved with analgesics",
      "Continue brushing and flossing gently around the treated tooth",
      "Schedule your final porcelain crown placement to protect against structural fracture",
    ],
    faqs: [
      {
        question: "Is root canal treatment really painful?",
        answer:
          "Modern computerized local anesthesia and endodontic techniques make the procedure as comfortable as receiving a routine dental filling, resolving pain rather than causing it.",
      },
      {
        question: "Can a root canal be completed in a single appointment?",
        answer:
          "In many non-complicated cases, microscopic root canal treatment can be successfully completed in one 45 to 60 minute appointment.",
      },
      {
        question: "Why does a root canal-treated tooth need a dental crown?",
        answer:
          "After pulp removal, a tooth loses its internal blood supply and becomes more brittle. A custom dental crown encases the tooth, shielding it from chewing fracture forces.",
      },
    ],
    doctorSpecialties: ["Endodontics"],
    seoDescription:
      "Painless single-visit root canal treatment in Ahilyanagar. Save infected teeth and relieve pain with microscopic endodontic technology.",
  },
  {
    slug: "cosmetic-smile-design",
    title: "Cosmetic Smile Design",
    shortDescription:
      "Handcrafted ultra-thin porcelain veneers, composite bonding, and digital smile makeovers tailored to your facial harmony.",
    longDescription:
      "Elevate your smile into an expressive work of art through conservative aesthetic dentistry. We custom-sculpt handcrafted ceramic veneers and micro-thin restorations that reflect natural tooth translucency and light refraction. Experience a comprehensive digital aesthetic mock-up to preview your dream smile before any work begins.",
    overview: [
      "Cosmetic smile design harmonizes tooth proportion, alignment, shade, and gingival balance to complement your unique facial features. Our approach prioritizes minimally invasive techniques that conserve natural enamel. (Replace with the clinic's real information)",
      "Through high-resolution macro photography, 3D facial analysis, and temporary intraoral mock-ups, you can see and feel your proposed smile enhancement before permanent ceramic restorations are fabricated. (Replace with the clinic's real information)",
    ],
    icon: "Palette",
    imageSlot: "service6",
    features: [
      "Custom porcelain veneers",
      "Digital facial smile design",
      "Micro-invasive preparation",
      "Hand-shaded color matching",
    ],
    duration: "2 to 3 Visits",
    startingPrice: "From Rs. 8,000 (Placeholder)",
    idealFor: [
      "Chipped, worn, or unevenly shaped front teeth",
      "Intrinsically discolored enamel unresponsive to whitening",
      "Minor gaps, asymmetries, or irregular tooth proportions",
      "Patients seeking balanced smile rejuvenation",
    ],
    processSteps: [
      {
        title: "1. Facial Aesthetic Consultation",
        text: "Digital dental photography and smile analysis to understand your aesthetic aspirations and lip dynamics.",
      },
      {
        title: "2. Trial Smile Mock-Up",
        text: "A temporary resin mock-up placed over your teeth lets you evaluate the shape and length in real time.",
      },
      {
        title: "3. Conservative Enamel Sculpting",
        text: "Micro-thin enamel contouring (often under 0.5mm) followed by high-definition optical digital impressions.",
      },
      {
        title: "4. Precision Bonding",
        text: "Custom ceramic veneers or composite bonding layers are permanently integrated with advanced resin cements.",
      },
    ],
    benefits: [
      "Lifelike tooth translucency, texture, and natural light refraction",
      "Conservative enamel preparation preserving natural tooth structure",
      "High resistance to dietary staining from tea, coffee, and spices",
      "Customized to complement individual facial aesthetics and speech",
    ],
    aftercare: [
      "Avoid opening packaging, biting fingernails, or chewing ice with veneered teeth",
      "Wear a protective nightguard if you have a habit of nighttime teeth clenching",
      "Brush twice daily with non-abrasive toothpaste and a soft toothbrush",
      "Visit for regular polishing and clinical bite checks twice a year",
    ],
    faqs: [
      {
        question: "How much natural tooth structure is shaved for porcelain veneers?",
        answer:
          "Modern ultra-thin ceramic veneers require minimal enamel reduction—frequently between 0.3mm and 0.5mm—and in certain cases, no-prep alternatives can be considered.",
      },
      {
        question: "Do porcelain veneers stain over time?",
        answer:
          "Glazed dental ceramics are non-porous and highly resistant to stains from coffee, tea, and everyday foods, retaining their luster over years of use.",
      },
      {
        question: "How long do custom porcelain veneers last?",
        answer:
          "With proper home hygiene and routine dental examinations, high-quality porcelain veneers commonly maintain their beauty and bond for 10 to 15 years or more.",
      },
    ],
    doctorSpecialties: ["Cosmetic Dentistry"],
    seoDescription:
      "Artisan porcelain veneers and cosmetic smile design in Ahilyanagar. Conservative, natural-looking aesthetic transformations customized to your face.",
  },
  {
    slug: "pediatric-dentistry",
    title: "Pediatric Dentistry",
    shortDescription:
      "Warm, anxiety-free dentistry, protective fluoride treatments, and gentle caries management for children.",
    longDescription:
      "Cultivate lifelong positive oral health habits in a welcoming, fear-free environment built specially for kids. Our compassionate pediatric specialists turn dental appointments into an enjoyable, educational adventure with zero intimidation. We focus on gentle preventive sealants, cavity interception, and gentle habit coaching.",
    overview: [
      "Children's dental visits require patience, behavioral empathy, and specialized clinical protocols tailored to developing primary teeth and jaws. We strive to make dental visits comfortable, educational, and fun. (Replace with the clinic's real information)",
      "From early infant oral health assessments to dental sealants and gentle cavity treatments, our preventive focus helps young patients maintain healthy smiles without developing clinical anxiety. (Replace with the clinic's real information)",
    ],
    icon: "Heart",
    imageSlot: "service7",
    features: [
      "Child-friendly operatory",
      "Protective pit & fissure sealants",
      "Gentle cavity prevention",
      "Positive behavioral guidance",
    ],
    duration: "30 to 40 min",
    startingPrice: "From Rs. 600 (Placeholder)",
    idealFor: [
      "Toddlers having their first introductory dental visit (age 1+)",
      "Children with early signs of tooth decay or feeding cavities",
      "Kids needing preventive pit and fissure tooth sealants",
      "Parents seeking pediatric nutrition and brushing guidance",
    ],
    processSteps: [
      {
        title: "1. Friendly Orientation",
        text: "Gentle 'tell-show-do' introduction to dental instruments in an upbeat, non-threatening atmosphere.",
      },
      {
        title: "2. Gentle Dental Checkup",
        text: "Careful examination of baby and permanent teeth, bite development, and soft tissue health.",
      },
      {
        title: "3. Preventive Protection",
        text: "Application of protective tooth sealants and topical fluoride varnish to strengthen enamel against decay.",
      },
      {
        title: "4. Parent Counseling",
        text: "Empowering parents with age-appropriate brushing techniques, snack guidance, and oral habit coaching.",
      },
    ],
    benefits: [
      "Positive early experiences prevent lifelong adult dental anxiety",
      "Fissure sealants dramatically reduce childhood molar decay rates",
      "Monitoring early jaw development intercepts complex orthodontic issues",
      "Personalized parental guidance for healthy infant and childhood dentition",
    ],
    aftercare: [
      "Allow children to resume normal soft foods immediately following routine checkups",
      "Supervise daily brushing twice a day until around 7 to 8 years of age",
      "Limit sticky sugar snacks and encourage plain water between meals",
      "Schedule follow-up visits every 6 months to maintain preventive protection",
    ],
    faqs: [
      {
        question: "At what age should a child have their first dental visit?",
        answer:
          "Pediatric dental associations recommend scheduling the first visit within six months of the first tooth erupting, or by the child's first birthday.",
      },
      {
        question: "Why treat cavities in baby teeth if they will eventually fall out?",
        answer:
          "Primary teeth are essential for chewing, speech development, and guiding permanent teeth into correct alignment. Untreated decay can cause pain and affect developing adult teeth.",
      },
      {
        question: "What are dental pit and fissure sealants?",
        answer:
          "Sealants are clear, protective coatings painted onto the chewing grooves of back molars, sealing out food particles and bacteria to prevent cavities.",
      },
    ],
    doctorSpecialties: ["Pediatric Dentistry", "Preventive Care"],
    seoDescription:
      "Compassionate, fear-free pediatric dentistry in Ahilyanagar. Gentle cavity protection, fissure sealants, and positive habits for healthy growing smiles.",
  },
  {
    slug: "emergency-dental-care",
    title: "Emergency Dental Care",
    shortDescription:
      "Same-day priority appointments for acute toothaches, fractured teeth, oral trauma, and displaced restorations.",
    longDescription:
      "Rapid clinical relief when unexpected dental pain strikes your family. We maintain dedicated daily emergency slots equipped for immediate triage, trauma stabilization, and pain cessation. Contact our on-call dental front desk for rapid diagnosis and same-day soothing clinical intervention.",
    overview: [
      "Acute dental emergencies—such as severe toothaches, knocked-out teeth, or fractured crowns—require prompt clinical evaluation to stop pain and save natural teeth. (Replace with the clinic's real information)",
      "Our clinic reserves dedicated emergency appointment slots each day for rapid triage, diagnostic imaging, and immediate pain relief protocols. (Replace with the clinic's real information)",
    ],
    icon: "Clock",
    imageSlot: "service8",
    features: [
      "Same-day emergency slots",
      "Instant pain-relief protocols",
      "Tooth repair & re-cementation",
      "Direct doctor tele-triage",
    ],
    duration: "Immediate Attention (30 min)",
    startingPrice: "From Rs. 800 (Placeholder)",
    idealFor: [
      "Sudden, unbearable toothache or facial swelling",
      "A knocked-out, loosened, or displaced tooth from trauma",
      "A broken, cracked, or severely fractured tooth crown",
      "A lost, loose, or displaced filling, inlay, or dental crown",
    ],
    processSteps: [
      {
        title: "1. Rapid Clinical Triage",
        text: "Immediate evaluation of pain intensity, trauma severity, and targeted digital radiographic imaging.",
      },
      {
        title: "2. Immediate Pain Cessation",
        text: "Administration of localized anesthesia or therapeutic dressings to stop acute distress rapidly.",
      },
      {
        title: "3. Protective Stabilization",
        text: "Repairing fractured enamel, repositioning luxated teeth, or placing soothing provisional restorations.",
      },
      {
        title: "4. Follow-Up Treatment Plan",
        text: "Clear recovery guidance and scheduling of any definitive long-term restorative therapy needed.",
      },
    ],
    benefits: [
      "Same-day clinical priority to alleviate distressing dental pain",
      "Early intervention increases the chance of saving traumatized teeth",
      "Prevents localized dental infections from spreading to facial spaces",
      "Transparent emergency diagnostic evaluation with zero hidden fees",
    ],
    aftercare: [
      "Take prescribed antibiotic and anti-inflammatory medications strictly on schedule",
      "Apply cold compresses externally to the cheek for 15 minutes at a time to reduce swelling",
      "Stick to lukewarm, soft liquids and avoid chewing near the affected area",
      "Attend scheduled follow-up visits to complete permanent restorative work",
    ],
    faqs: [
      {
        question: "What should I do if an adult tooth is completely knocked out?",
        answer:
          "Handle the tooth only by the crown (do not touch the root). Gently rinse with milk if soiled, place it back into the socket if possible, or store it in cold milk, and see our emergency dentist within 60 minutes.",
      },
      {
        question: "Do you accept walk-in emergency dental patients?",
        answer:
          "Yes, we accommodate acute emergencies. Calling ahead while en route helps our clinical staff prepare an operatory and imaging sensors in advance for your arrival.",
      },
      {
        question: "What should I do for a severe weekend toothache?",
        answer:
          "Rinse gently with warm salt water, take standard over-the-counter pain relievers as directed, avoid placing aspirin directly on the gums, and contact our clinic line for emergency triage.",
      },
    ],
    doctorSpecialties: ["Oral Surgery", "Endodontics"],
    seoDescription:
      "Same-day emergency dental care in Ahilyanagar for acute toothaches, chipped teeth, and dental trauma. Rapid pain relief and immediate tooth stabilization.",
  },
];

export default servicesData;
