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
  brand: "bg-brand text-white",
  accent: "bg-accent-soft text-accent-deep border border-accent/40 font-semibold",
  outline: "bg-transparent text-ink border border-line",
  success: "bg-success/10 text-success border border-success/30",
  warning: "bg-warning/10 text-warning border border-warning/30 font-semibold",
  danger: "bg-danger/10 text-danger border border-danger/30 font-semibold",
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
