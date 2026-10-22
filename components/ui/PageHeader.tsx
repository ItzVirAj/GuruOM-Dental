import React from "react";
import Link from "next/link";
import { Container } from "./Container";
import { Badge } from "./Badge";
import { Button } from "./Button";

export interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description = "This page is currently being assembled with custom clinic photography, bespoke 3D assets, and interactive dental care schedules.",
  badge = "Page Under Construction",
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-surface-alt via-surface to-surface pt-32 pb-20 md:pt-40 md:pb-28 border-b border-line">
      {/* Decorative ambient backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -z-10 w-[600px] h-[300px] bg-accent/20 rounded-full blur-3xl opacity-70"
      />

      <Container>
        <div className="max-w-3xl space-y-5">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-semibold text-ink-muted hover:text-brand transition-colors"
            >
              Home
            </Link>
            <span className="text-xs text-line">/</span>
            <span className="text-xs font-semibold text-brand">{title}</span>
          </div>

          <div className="inline-block">
            <Badge variant="accent" size="sm">
              {badge}
            </Badge>
          </div>

          <h1 className="text-display-xl font-display text-ink leading-tight">
            {title}
          </h1>

          <p className="text-body-lg text-ink-muted max-w-2xl leading-relaxed">
            {description}
          </p>

          <div className="pt-4 flex flex-wrap gap-4">
            <Button href="/appointment" variant="primary">
              Book Consultation
            </Button>
            <Button href="/contact" variant="ghost">
              Contact Clinic
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default PageHeader;
