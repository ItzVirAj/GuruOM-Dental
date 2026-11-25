"use client";

import { stagger, useAnimate } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, CalendarDays, MapPin, Map, Phone } from "lucide-react";
import { useHomeImage } from "@/components/ui/HomeImageContext";
import { SmartImage } from "@/components/ui/SmartImage";
import { heroLogoSrc } from "@/data/home-images";
import { heroContent } from "@/data/home";
import { labs } from "@/data/labs";
import cloudinaryLoader from "@/src/lib/media/cloudinary-loader";

export interface HeroProps {
  showPortrait?: boolean;
}

export function Hero({ showPortrait = true }: HeroProps) {
  const [spreadRef, animate] = useAnimate();
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const transition = { duration: 1.35, ease: [0.22, 1, 0.36, 1] as const };
    const copy = animate(".clinic-hero-copy > *", { opacity: [0, 1], y: [14, 0] },
      { ...transition, delay: stagger(0.22) });
    const photo = animate(".clinic-hero-plate", { opacity: [0, 1], y: [12, 0] },
      { duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.25 });
    return () => { copy.stop(); photo.stop(); };
  }, [animate]);

  const logo = useHomeImage("heroTitleLogo");
  const [locationId, setLocationId] = useState("");
  const location = labs.find(lab => lab.id === locationId);

  return (
    <section className="clinic-hero" aria-labelledby="hero-heading">
      <div ref={spreadRef} className="clinic-hero-spread">
        <div className="clinic-hero-copy">
          <p className="clinic-hero-place"><MapPin size={16} aria-hidden="true" /> Ahilyanagar, Maharashtra</p>
          <h1 id="hero-heading" className="clinic-hero-headline">{heroContent.headline}</h1>
          <p className="clinic-hero-intro">
            Digital scans and our in-house dental lab help us plan your care, from a single crown to a complete smile restoration.
          </p>
          <div className="clinic-hero-actions">
            <Link href={heroContent.primaryCta.href} className="clinic-hero-primary">
              <CalendarDays size={18} aria-hidden="true" /> Contact the clinic
            </Link>
            <Link href={heroContent.secondaryCta.href} className="clinic-hero-services">Explore treatments</Link>
          </div>
          <div className="clinic-hero-founder">
            {showPortrait && <div className="clinic-hero-portrait">
              <SmartImage slot="heroPatient" alt="Dr. Guruprasad Handal" sizes="72px" className="h-full" />
            </div>}
            <div>
              <p className="clinic-hero-founder-name">Dr. Guruprasad Handal</p>
              <p className="clinic-hero-role">Founder &amp; prosthodontist</p>
            </div>
          </div>
        </div>

        <figure className="clinic-hero-plate">
          <div className="clinic-hero-photograph">
            <SmartImage slot="heroBg" alt="Inside the digital dental lab" priority sizes="(min-width: 800px) 54vw, 100vw" className="h-full" />
          </div>
          <figcaption className="clinic-hero-imprint">
            <span>Inside the digital dental lab</span>
            <Image src={logo?.publicId ?? heroLogoSrc} loader={logo ? cloudinaryLoader : undefined}
              alt="Guru-Om Dental" width={843} height={193} sizes="(max-width: 799px) 160px, 220px" className="clinic-hero-logo" />
          </figcaption>
        </figure>
      </div>

      <div className="clinic-hero-directory">
        <div className="clinic-hero-bar">
          <h2 id="hero-network" className="clinic-hero-network"><Map size={22} aria-hidden="true" /> Our Maharashtra Network :</h2>
          <div className="clinic-hero-slider" role="group" aria-labelledby="hero-network">
            <div className="clinic-hero-window">
              <div className="clinic-hero-track">
                {[false, true].map(copy => (
                  <div key={String(copy)} className="clinic-hero-locations" aria-hidden={copy || undefined}>
                    {labs.map(lab => (
                      <button key={lab.id} type="button" tabIndex={copy ? -1 : 0}
                        className="clinic-hero-location" aria-pressed={locationId === lab.id}
                        aria-controls="hero-location-details"
                        onClick={() => setLocationId(current => current === lab.id ? "" : lab.id)}>
                        {lab.name}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <a href="#our-labs" className="clinic-hero-map-link">Explore the map <ArrowDown size={16} aria-hidden="true" /></a>
        </div>
        <div id="hero-location-details" aria-live="polite">
          {location && <div className="clinic-hero-details">
            <div><strong>{location.name}</strong> · {location.type === "lab" ? "In-house digital lab" : "Regional service hub"}<p>{location.address}</p></div>
            <p>{location.hours}</p>
            {location.phone && <a href={`tel:${location.phone.replace(/\s/g, "")}`}><Phone size={15} aria-hidden="true" /> {location.phone}</a>}
          </div>}
        </div>
      </div>
    </section>
  );
}

export default Hero;
