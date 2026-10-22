import React from "react";
import Image from "next/image";
import { Image as ImageIcon } from "lucide-react";
import { AspectRatio, plannedImages } from "@/data/images";

export interface SmartImageProps {
  slot?: string;
  src?: string;
  alt?: string;
  ratio?: AspectRatio;
  aspect?: AspectRatio; // Alias for ratio
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
  slot,
  src,
  alt,
  ratio,
  aspect,
  label,
  priority = false,
  className = "",
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
}) => {
  const slotData = slot ? plannedImages[slot] : undefined;

  const finalSrc = src ?? slotData?.src;
  const finalAlt = alt ?? slotData?.alt ?? label ?? "GuruOm Dental image";
  const finalRatio = ratio ?? aspect ?? slotData?.ratio ?? "16/9";
  const finalLabel = label ?? slotData?.label ?? (slot ? `Slot: ${slot}` : finalAlt);

  const ratioClass = ratioStyles[finalRatio] || "aspect-[16/9]";

  // Placeholder mode when src is absent or empty
  if (!finalSrc || finalSrc.trim() === "") {
    return (
      <div
        role="img"
        aria-label={finalAlt || finalLabel || "Image placeholder"}
        className={`relative w-full overflow-hidden rounded-lg border border-line bg-gradient-to-br from-surface-alt via-surface to-accent-soft p-6 flex flex-col items-center justify-center text-center select-none shadow-soft ${ratioClass} ${className}`}
      >
        <div className="flex flex-col items-center justify-center gap-3 max-w-[85%]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-brand shadow-soft backdrop-blur-sm border border-line/50 transition-transform duration-300 hover:scale-105">
            <ImageIcon className="h-5 w-5 text-brand" />
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">
              {finalLabel}
            </p>
            <p className="text-[11px] font-medium text-ink-muted">
              Ratio: {finalRatio}
            </p>
          </div>
        </div>

        {/* Subtle grid accent pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(var(--brand) 1px, transparent 1px)`,
            backgroundSize: "16px 16px",
          }}
          aria-hidden="true"
        />
      </div>
    );
  }

  // Real production image when src is configured
  return (
    <div className={`relative w-full overflow-hidden ${ratioClass} ${className}`}>
      <Image
        src={finalSrc}
        alt={finalAlt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover transition-transform duration-500 hover:scale-105"
      />
    </div>
  );
};

export default SmartImage;
