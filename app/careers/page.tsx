import { PageHeader } from "@/components/ui";

export const metadata = {
  title: "Careers",
  description: "Join our team of dental surgeons, hygienists, and patient care specialists at GuruOm Dental.",
};

export default function CareersPage() {
  return (
    <PageHeader
      eyebrow="Join Our Team"
      title="Careers at GuruOm Dental"
      description="Work alongside world-class clinicians with state-of-the-art dental technology and compassionate patient care."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Careers" },
      ]}
    />
  );
}
