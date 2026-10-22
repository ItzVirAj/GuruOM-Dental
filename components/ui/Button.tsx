import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "light";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  showIcon?: boolean;
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export type ButtonAsButton = ButtonBaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> & {
    href?: undefined;
  };

export type ButtonAsLink = ButtonBaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonBaseProps> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantStyles: Record<ButtonVariant, { base: string; iconCircle: string }> = {
  primary: {
    base: "bg-brand text-ink-inverse hover:bg-brand-light active:bg-brand-dark shadow-soft hover:shadow-card",
    iconCircle: "bg-white/20 text-ink-inverse group-hover:bg-white/30",
  },
  secondary: {
    base: "bg-accent text-ink hover:brightness-105 active:brightness-95 shadow-soft hover:shadow-card",
    iconCircle: "bg-ink/10 text-ink group-hover:bg-ink/15",
  },
  ghost: {
    base: "bg-transparent text-brand border border-line hover:border-brand hover:bg-surface-alt active:bg-line",
    iconCircle: "bg-line/60 text-brand group-hover:bg-brand group-hover:text-ink-inverse",
  },
  light: {
    base: "bg-white text-brand hover:bg-surface-alt active:bg-line shadow-soft hover:shadow-card",
    iconCircle: "bg-brand/10 text-brand group-hover:bg-brand/20",
  },
};

const sizeStyles: Record<
  ButtonSize,
  {
    button: string;
    iconCircle: string;
    iconSize: string;
    font: string;
  }
> = {
  sm: {
    button: "px-4 py-2 gap-2 text-xs",
    iconCircle: "w-5 h-5",
    iconSize: "w-3 h-3",
    font: "text-xs font-medium tracking-wide",
  },
  md: {
    button: "px-5 py-2.5 gap-3 text-sm",
    iconCircle: "w-6 h-6",
    iconSize: "w-3.5 h-3.5",
    font: "text-sm font-medium tracking-normal",
  },
  lg: {
    button: "px-7 py-3.5 gap-3.5 text-base",
    iconCircle: "w-7 h-7",
    iconSize: "w-4 h-4",
    font: "text-base font-semibold tracking-tight",
  },
};

export const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      showIcon = true,
      icon,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const v = variantStyles[variant];
    const s = sizeStyles[size];

    const commonClasses = `group inline-flex items-center justify-center rounded-pill transition-all duration-300 font-body select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${s.button} ${s.font} ${v.base} ${className}`;

    const iconContent = showIcon && (
      <span
        aria-hidden="true"
        className={`inline-flex items-center justify-center rounded-full transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${s.iconCircle} ${v.iconCircle}`}
      >
        {icon ? icon : <ArrowUpRight className={s.iconSize} />}
      </span>
    );

    if ("href" in props && typeof props.href === "string") {
      const { href, ...anchorProps } = props;
      return (
        <Link
          href={href}
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={commonClasses}
          {...anchorProps}
        >
          <span>{children}</span>
          {iconContent}
        </Link>
      );
    }

    const buttonProps = props as React.ButtonHTMLAttributes<HTMLButtonElement>;
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={buttonProps.type || "button"}
        className={commonClasses}
        {...buttonProps}
      >
        <span>{children}</span>
        {iconContent}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
