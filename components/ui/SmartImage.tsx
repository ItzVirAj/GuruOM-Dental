import React from "react";
import Image from "next/image";
import { Image as ImageIcon } from "lucide-react";
import { AspectRatio } from "@/data/images";

export interface SmartImageProps {
  src?: string;
  alt: string;
  ratio?: AspectRatio;
  label?: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
}

const ratioStyles: Record<AspectRatio, string> = {
  "1/1": "aspect-square",
  "4/3": "aspect-[4/3]",
  "3/4": "aspect-[3/4]",
  "16/9": "aspect-[16/9]",
  "21/9": "aspect-[21/9]",
  "4/5": "aspect-[4/5]",
};

export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  ratio = "16/9",
  label,
  priority = false,
  className = "",
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
}) => {
  const ratioClass = ratioStyles[ratio];

  // Placeholder mode when src is absent or empty
  if (!src || src.trim() === "") {
    return (
      <div
        role="img"
        aria-label={alt || label || "Image placeholder"}
        className={`relative w-full overflow-hidden rounded-lg border border-line bg-gradient-to-br from-surface-alt via-surface to-accent-soft p-6 flex flex-col items-center justify-center text-center select-none shadow-soft ${ratioClass} ${className}`}
      >
        <div className="flex flex-col items-center justify-center gap-3 max-w-[85%]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-brand shadow-soft backdrop-blur-sm border border-line/50 transition-transform duration-300 hover:scale-105">
            <ImageIcon className="h-5 w-5 text-brand" />
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">
              {label || "Slot: " + (alt || "Planned Image")}
            </p>
            <p className="text-[11px] font-medium text-ink-muted">
              Ratio: {ratio}
            </p>
          </div>
        </div>

        {/* Subtle grid accent pattern */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[radial-gradient(#10262A_1px,transparent_1px)] [background-size:12px_12px]"
        />
      </div>
    );
  }

  // Real Image mode
  return (
    <div
      className={`relative w-full overflow-hidden rounded-lg bg-surface-alt shadow-soft ${ratioClass} ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover transition-opacity duration-500 ease-out"
      />
    </div>
  );
};

export default SmartImage;
