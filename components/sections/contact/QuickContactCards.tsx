"use client";

import React from "react";
import { Phone, MessageCircle, Mail, MapPin, ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/data/site";
import { IconCircle } from "@/components/ui/IconCircle";
import { Container } from "@/components/ui/Container";

export const QuickContactCards: React.FC = () => {
  const cards = [
    {
      id: "call",
      title: "Call Us",
      label: "Phone Consultation",
      value: siteConfig.phone,
      action: "Call now",
      href: `tel:${siteConfig.phone.replace(/[\s\-\(\)]/g, "")}`,
      icon: Phone,
      external: false,
      srDescription: `Call our clinic directly at ${siteConfig.phone}`,
    },
    {
      id: "whatsapp",
      title: "WhatsApp",
      label: "Instant Messaging",
      value: siteConfig.whatsapp,
      action: "Chat on WhatsApp",
      href: siteConfig.socials.whatsapp,
      icon: MessageCircle,
      external: true,
      srDescription: `Chat with our front desk on WhatsApp at ${siteConfig.whatsapp}`,
    },
    {
      id: "email",
      title: "Email",
      label: "General Enquiries",
      value: siteConfig.email,
      action: "Send email",
      href: `mailto:${siteConfig.email}`,
      icon: Mail,
      external: false,
      srDescription: `Send an email to ${siteConfig.email}`,
    },
    {
      id: "visit",
      title: "Clinic Visit",
      label: "Ahilyanagar Clinic",
      value: "Sawli Housing Society, Ahilyanagar",
      action: "Get directions",
      href: siteConfig.mapsUrl,
      icon: MapPin,
      external: true,
      srDescription: `Get Google Maps directions to GuruOm Dental in Ahilyanagar`,
    },
  ];

  return (
    <section aria-label="Quick contact channels" className="py-10 sm:py-12 bg-surface border-b border-line">
      <Container>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {cards.map((card) => {
            const IconComponent = card.icon;
            return (
              <a
                key={card.id}
                href={card.href}
                target={card.external ? "_blank" : undefined}
                rel={card.external ? "noopener noreferrer" : undefined}
                className="group relative flex flex-col justify-between p-5 sm:p-6 rounded-3xl bg-white border border-line shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card hover:border-brand/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                aria-label={card.srDescription}
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <IconCircle
                      size="md"
                      variant="alt"
                      className="transition-colors duration-300 group-hover:bg-brand group-hover:text-white"
                      aria-hidden="true"
                    >
                      <IconComponent className="w-5 h-5" />
                    </IconCircle>

                    <span
                      aria-hidden="true"
                      className="w-7 h-7 rounded-full bg-surface flex items-center justify-center text-ink-muted transition-all duration-300 group-hover:bg-brand/10 group-hover:text-brand group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>

                  <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted block">
                    {card.label}
                  </span>
                  <h3 className="font-display font-semibold text-ink text-base mt-1 truncate">
                    {card.title}
                  </h3>
                  <p className="text-xs text-ink-muted font-medium mt-1 truncate">
                    {card.value}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-line/60 flex items-center justify-between text-xs font-semibold text-brand">
                  <span>{card.action}</span>
                </div>
              </a>
            );
          })}
        </div>
      </Container>
    </section>
  );
};
