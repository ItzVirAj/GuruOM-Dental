import React from "react";

export type CardVariant = "white" | "alt" | "dark";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  variant?: CardVariant;
  hoverLift?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  white: "bg-white text-ink border border-line",
  alt: "bg-surface-alt text-ink border border-line",
  dark: "bg-brand-dark text-ink-inverse border border-brand/50",
};

export const Card: React.FC<CardProps> = ({
  as: Component = "div",
  variant = "white",
  hoverLift = true,
  className = "",
  children,
  ...props
}) => {
  return (
    <Component
      className={`rounded-xl p-6 sm:p-8 shadow-soft ${variantStyles[variant]} ${
        hoverLift ? "hover:-translate-y-1 hover:shadow-card transition-all duration-300" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Card;
