export const homeImageGroups = [
  { name: "Hero", slots: [
    { id: "heroPatient", label: "Founder portrait" },
    { id: "heroBg", label: "Background image" },
    { id: "heroTitleLogo", label: "Title logo" },
  ] },
  { name: "About the clinic", slots: [{ id: "aboutSecondary", label: "Clinical showcase" }] },
  { name: "Featured services", slots: [
    { id: "service1", label: "General Dentistry" },
    { id: "service2", label: "Teeth Cleaning & Whitening" },
    { id: "service3", label: "Orthodontics & Aligners" },
    { id: "service4", label: "Dental Implants" },
  ] },
  { name: "Doctors", slots: [
    { id: "drGuruprasad", label: "Dr. Guruprasad Handal" },
    { id: "drAkshata", label: "Dr. Akshata Handal" },
  ] },
  { name: "Final call to action", slots: [{ id: "homeCta", label: "Right-hand image" }] },
] as const;

export const heroLogoSrc = "/images/NewLogo-Viraj-Guru-OM-PNG.png";
export interface HomeImage {
  mediaId: string;
  publicId: string;
  alt: string | null;
}
export type HomeImages = Record<string, HomeImage | undefined>;
