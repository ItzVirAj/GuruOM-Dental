"use client";

import React from "react";
import { Check } from "lucide-react";

export interface StepIndicatorProps {
  currentStep: number; // 1, 2, 3
  isSubmitted: boolean;
  onStepClick?: (step: number) => void;
}

const STEPS = [
  { id: 1, label: "Treatment", description: "Service & Doctor" },
  { id: 2, label: "Date & Time", description: "Schedule Slot" },
  { id: 3, label: "Your Details", description: "Contact & Confirm" },
];

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  isSubmitted,
  onStepClick,
}) => {
  // If submitted, show 100% progress
  const progressPercent = isSubmitted
    ? 100
    : currentStep === 1
    ? 0
    : currentStep === 2
    ? 50
    : 100;

  return (
    <nav aria-label="Appointment booking steps" className="w-full">
      {/* Progress Track and Steps Header */}
      <div className="relative">
        {/* Background track line */}
        <div
          aria-hidden="true"
          className="absolute top-5 left-6 right-6 h-0.5 bg-line -translate-y-1/2 z-0"
        />

        {/* Dynamic GSAP-styled active line */}
        <div
          aria-hidden="true"
          className="absolute top-5 left-6 h-0.5 bg-brand transition-all duration-500 ease-out -translate-y-1/2 z-0"
          style={{
            width: `calc(${progressPercent}% - ${progressPercent === 0 ? 0 : progressPercent === 50 ? 1.5 : 3}rem)`,
          }}
        />

        <ol className="relative z-10 flex justify-between items-center w-full">
          {STEPS.map((step) => {
            const isCompleted = isSubmitted || currentStep > step.id;
            const isCurrent = !isSubmitted && currentStep === step.id;
            const isClickable = !isSubmitted && isCompleted && Boolean(onStepClick);

            return (
              <li
                key={step.id}
                className="flex flex-col items-center flex-1 text-center"
                aria-current={isCurrent ? "step" : undefined}
              >
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => isClickable && onStepClick?.(step.id)}
                  aria-label={`Step ${step.id}: ${step.label} ${
                    isCompleted ? "(Completed)" : isCurrent ? "(Current step)" : "(Upcoming)"
                  }`}
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-display text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
                    isCompleted
                      ? "bg-brand text-white shadow-soft hover:bg-brand-light cursor-pointer"
                      : isCurrent
                      ? "bg-brand text-white ring-4 ring-brand/20 shadow-soft cursor-default"
                      : "bg-surface text-ink-muted border border-line cursor-not-allowed"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </button>

                <div className="mt-2 text-center select-none">
                  <span
                    className={`block text-xs font-semibold tracking-tight ${
                      isCurrent
                        ? "text-brand"
                        : isCompleted
                        ? "text-ink"
                        : "text-ink-muted"
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="hidden sm:block text-[11px] text-ink-muted mt-0.5">
                    {step.description}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Screen reader live announcement */}
      <div className="sr-only" aria-live="polite">
        {isSubmitted
          ? "Booking confirmed successfully"
          : `Step ${currentStep} of 3: ${STEPS[currentStep - 1]?.label}`}
      </div>
    </nav>
  );
};
