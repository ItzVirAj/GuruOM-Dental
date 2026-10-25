import React from "react";

export type EyebrowMarker = "dot" | "line";
export type EyebrowColor = "brand" | "accent" | "muted" | "inverse";

export interface EyebrowProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: EyebrowMarker;
  color?: EyebrowColor;
  className?: string;
  children: React.ReactNode;
}

const colorStyles: Record<EyebrowColor, { text: string; marker: string }> = {
  brand: {
    text: "text-brand",
    marker: "bg-brand",
  },
  accent: {
    text: "text-accent-deep",
    marker: "bg-accent",
  },
  muted: {
    text: "text-ink-muted",
    marker: "bg-ink-muted",
  },
  inverse: {
    text: "text-white/90",
    marker: "bg-accent",
  },
};

export const Eyebrow: React.FC<EyebrowProps> = ({
  variant = "dot",
  color = "brand",
  className = "",
  children,
  ...props
}) => {
  const c = colorStyles[color];

  return (
    <span
      className={`inline-flex items-center gap-2 text-eyebrow ${c.text} ${className}`}
      {...props}
    >
      {variant === "dot" ? (
        <span
          aria-hidden="true"
          className={`h-1.5 w-1.5 rounded-full ${c.marker}`}
        />
      ) : (
        <span
          aria-hidden="true"
          className={`h-[1px] w-6 ${c.marker}`}
        />
      )}
      <span>{children}</span>
    </span>
  );
};

export default Eyebrow;
