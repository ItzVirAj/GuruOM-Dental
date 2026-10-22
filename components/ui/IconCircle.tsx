import React from "react";

export type IconCircleVariant = "brand" | "accent" | "surface" | "alt" | "white";
export type IconCircleSize = "sm" | "md" | "lg";

export interface IconCircleProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  variant?: IconCircleVariant;
  size?: IconCircleSize;
  className?: string;
  children?: React.ReactNode;
}

const variantStyles: Record<IconCircleVariant, string> = {
  brand: "bg-brand text-ink-inverse",
  accent: "bg-accent-soft text-brand border border-accent/40",
  surface: "bg-surface text-brand border border-line",
  alt: "bg-surface-alt text-brand border border-line",
  white: "bg-white text-brand shadow-soft border border-line",
};

const sizeStyles: Record<IconCircleSize, string> = {
  sm: "w-8 h-8 text-sm",
  md: "w-11 h-11 text-base",
  lg: "w-14 h-14 text-xl",
};

export const IconCircle: React.FC<IconCircleProps> = ({
  icon,
  variant = "accent",
  size = "md",
  className = "",
  children,
  ...props
}) => {
  return (
    <div
      className={`inline-flex items-center justify-center rounded-full shrink-0 select-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {icon || children}
    </div>
  );
};

export default IconCircle;
