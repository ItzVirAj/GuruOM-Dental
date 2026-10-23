import React from "react";

export type SectionVariant = "surface" | "alt" | "brand" | "white";

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  variant?: SectionVariant;
  id?: string;
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<SectionVariant, string> = {
  surface: "bg-surface text-ink",
  alt: "bg-surface-alt text-ink",
  brand: "bg-brand text-ink-inverse",
  white: "bg-white text-ink",
};

export const Section = React.forwardRef<HTMLElement, SectionProps>(
  (
    {
      as: Component = "section",
      variant = "surface",
      id,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <Component
        ref={ref}
        id={id}
        className={`py-16 md:py-24 lg:py-32 transition-colors duration-300 ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Section.displayName = "Section";

export default Section;
