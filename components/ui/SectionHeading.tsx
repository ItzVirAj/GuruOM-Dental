import React from "react";
import Eyebrow from "./Eyebrow";
import SplitHeading, { SplitType } from "@/components/animations/SplitHeading";

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  dark?: boolean;
  animated?: boolean;
  splitType?: SplitType;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  as?: "h1" | "h2" | "h3";
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  description,
  align = "left",
  dark = false,
  animated = false,
  splitType = "lines",
  className = "",
  titleClassName = "",
  descriptionClassName = "",
  as: HeadingTag = "h2",
}) => {
  const isCenter = align === "center";

  return (
    <div
      className={`space-y-4 ${
        isCenter ? "text-center mx-auto max-w-3xl flex flex-col items-center" : "max-w-2xl"
      } ${className}`}
    >
      {eyebrow && (
        <Eyebrow
          color={dark ? "inverse" : "brand"}
          className={isCenter ? "justify-center" : ""}
        >
          {eyebrow}
        </Eyebrow>
      )}

      {animated ? (
        <SplitHeading
          as={HeadingTag}
          type={splitType}
          className={`text-display-md font-display font-normal ${
            dark ? "text-ink-inverse" : "text-ink"
          } ${titleClassName}`}
        >
          {title}
        </SplitHeading>
      ) : (
        <HeadingTag
          data-split="heading"
          className={`text-display-md font-display font-normal ${
            dark ? "text-ink-inverse" : "text-ink"
          } ${titleClassName}`}
        >
          {title}
        </HeadingTag>
      )}

      {description && (
        <p
          className={`text-body-lg ${
            dark ? "text-ink-inverse/80" : "text-ink-muted"
          } ${descriptionClassName}`}
        >
          {description}
        </p>
      )}
    </div>
  );
};

export default SectionHeading;
