import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import { SmartImage } from "@/components/ui/SmartImage";
import { doctorsData } from "@/data/doctors";

export function HomeDoctors() {
  const featured = doctorsData.filter(doctor => doctor.featured).slice(0, 3);
  return (
    <section aria-label="Featured doctors" className="clinical-team">
      <div className="clinical-team-inner">
        <header className="clinical-team-heading">
          <h2>Meet our doctors.</h2>
          <Link href="/about#about-team-heading">Meet the full team <ArrowUpRight size={17} aria-hidden="true" /></Link>
        </header>
        <div className="clinical-team-spread">
          {featured.map(doctor => (
            <article key={doctor.slug} className="clinical-profile">
              <div className="clinical-profile-photo">
                <SmartImage slot={doctor.imageSlot} alt={doctor.name} sizes="(min-width: 1550px) 310px, (min-width: 900px) 20vw, 48vw" className="h-full" />
              </div>
              <div className="clinical-profile-copy">
                <p className="clinical-profile-role">{doctor.role}</p>
                <h3>{doctor.name}</h3>
                <p>{doctor.shortBio}</p>
                <p className="clinical-profile-years">{doctor.experienceYears}+ years of experience</p>
              </div>
              <details className="clinical-profile-details">
                <summary>Qualifications &amp; specialties <Plus size={18} aria-hidden="true" /></summary>
                <ul>{doctor.qualifications.map(item => <li key={item}>{item}</li>)}</ul>
                <p>{doctor.specialties.join(" · ")}</p>
              </details>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
