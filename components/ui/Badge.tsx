import React from "react";

export type BadgeVariant =
  | "default"
  | "brand"
  | "accent"
  | "outline"
  | "success"
  | "warning"
  | "danger";

export type BadgeSize = "sm" | "md";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-surface-alt text-ink border border-line",
  brand: "bg-brand text-ink-inverse",
  accent: "bg-accent-soft text-brand-dark border border-accent/40",
  outline: "bg-transparent text-ink border border-line",
  success: "bg-emerald-50 text-success border border-emerald-200",
  warning: "bg-amber-50 text-warning border border-amber-200",
  danger: "bg-rose-50 text-danger border border-rose-200",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2.5 py-0.5 text-[11px] gap-1.5",
  md: "px-3.5 py-1 text-xs gap-2",
};

export const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  size = "md",
  icon,
  className = "",
  children,
  ...props
}) => {
  return (
    <span
      className={`inline-flex items-center font-body font-medium rounded-pill tracking-tight select-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
