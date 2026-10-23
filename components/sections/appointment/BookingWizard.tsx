"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Send,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StepIndicator } from "./StepIndicator";
import { Step1Treatment } from "./Step1Treatment";
import { Step2DateTime } from "./Step2DateTime";
import { Step3Details } from "./Step3Details";
import { BookingConfirmation } from "./BookingConfirmation";
import { BookingSummaryCard } from "./BookingSummaryCard";
import {
  step1TreatmentSchema,
  step2DateTimeSchema,
  step3DetailsSchema,
  combinedBookingSchema,
  BookingFormData,
} from "@/lib/booking";
import { submitAppointment } from "@/app/appointment/actions";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export interface BookingWizardProps {
  initialService?: string;
  initialDoctor?: string;
  initialPlan?: string;
}

const STORAGE_KEY = "guruom_booking_draft_v1";

export const BookingWizard: React.FC<BookingWizardProps> = ({
  initialService = "",
  initialDoctor = "any",
  initialPlan = "",
}) => {
  // Wizard Step: 1, 2, 3 or confirmation
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [confirmedReference, setConfirmedReference] = useState<string>("");
  const [confirmedData, setConfirmedData] = useState<BookingFormData | null>(null);

  // Loading & Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Form State - Step 1: Treatment
  const [serviceSlug, setServiceSlug] = useState<string>(initialService);
  const [doctorSlug, setDoctorSlug] = useState<string>(initialDoctor || "any");
  const [visitType, setVisitType] = useState<"first-visit" | "follow-up" | "emergency">(
    "first-visit"
  );
  const [planId, setPlanId] = useState<string>(initialPlan);

  // Form State - Step 2: Date & Time
  const [date, setDate] = useState<string>("");
  const [timeSlot, setTimeSlot] = useState<string>("");
  const [flexible, setFlexible] = useState<boolean>(false);

  // Form State - Step 3: Details (Never stored in sessionStorage)
  const [fullName, setFullName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [consent, setConsent] = useState<boolean>(false);
  const [website, setWebsite] = useState<string>(""); // Honeypot

  // Validation Error States
  const [step1Errors, setStep1Errors] = useState<Record<string, string>>({});
  const [step2Errors, setStep2Errors] = useState<Record<string, string>>({});
  const [step3Errors, setStep3Errors] = useState<Record<string, string>>({});

  // Refs for animations and accessibility
  const stepContainerRef = useRef<HTMLDivElement | null>(null);
  const stepWrapperRef = useRef<HTMLDivElement | null>(null);

  // --------------------------------------------------------------------------
  // Restore Safe Draft (Non-PII only) from sessionStorage
  // --------------------------------------------------------------------------
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        requestAnimationFrame(() => {
          if (parsed.serviceSlug && !initialService) setServiceSlug(parsed.serviceSlug);
          if (parsed.doctorSlug && !initialDoctor) setDoctorSlug(parsed.doctorSlug);
          if (parsed.visitType) setVisitType(parsed.visitType);
          if (parsed.planId && !initialPlan) setPlanId(parsed.planId);
          if (parsed.date) setDate(parsed.date);
          if (parsed.timeSlot) setTimeSlot(parsed.timeSlot);
          if (typeof parsed.flexible === "boolean") setFlexible(parsed.flexible);
        });
      }
    } catch {
      // Ignore sessionStorage errors (e.g. Incognito mode)
    }
  }, [initialService, initialDoctor, initialPlan]);

  // --------------------------------------------------------------------------
  // Sync Safe Draft to sessionStorage
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (isSubmitted) return;
    try {
      const draft = {
        serviceSlug,
        doctorSlug,
        visitType,
        planId,
        date,
        timeSlot,
        flexible,
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // Storage unavailable or quota exceeded
    }
  }, [serviceSlug, doctorSlug, visitType, planId, date, timeSlot, flexible, isSubmitted]);

  // --------------------------------------------------------------------------
  // Step Transition Animation
  // --------------------------------------------------------------------------
  const transitionToStep = useCallback(
    (targetStep: number, direction: 1 | -1) => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion || !stepContainerRef.current) {
        setCurrentStep(targetStep);
        setTimeout(() => {
          const heading = document.getElementById(`step${targetStep}-heading`);
          heading?.focus();
          ScrollTrigger.refresh();
        }, 50);
        return;
      }

      const container = stepContainerRef.current;
      const currentHeight = container.offsetHeight;

      // Animate outgoing content
      gsap.to(container, {
        opacity: 0,
        x: direction === 1 ? -24 : 24,
        duration: 0.22,
        ease: "power2.in",
        onComplete: () => {
          setCurrentStep(targetStep);

          // Force reflow and measure new natural height
          gsap.set(container, { x: direction === 1 ? 24 : -24, opacity: 0 });

          requestAnimationFrame(() => {
            const newHeight = container.offsetHeight;

            // Animate container height smoothly
            gsap.fromTo(
              stepWrapperRef.current,
              { height: currentHeight },
              {
                height: newHeight,
                duration: 0.35,
                ease: "power3.out",
                onComplete: () => {
                  if (stepWrapperRef.current) {
                    stepWrapperRef.current.style.height = "auto";
                  }
                  ScrollTrigger.refresh();
                },
              }
            );

            // Animate incoming content
            gsap.to(container, {
              opacity: 1,
              x: 0,
              duration: 0.3,
              ease: "power2.out",
              onComplete: () => {
                const heading = document.getElementById(`step${targetStep}-heading`);
                heading?.focus();
              },
            });
          });
        },
      });
    },
    []
  );

  // --------------------------------------------------------------------------
  // Step 1 Validation & Next
  // --------------------------------------------------------------------------
  const handleNextFromStep1 = () => {
    const result = step1TreatmentSchema.safeParse({
      serviceSlug,
      doctorSlug,
      visitType,
      planId: planId || undefined,
    });

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const field = String(err.path[0]);
        if (!errors[field]) errors[field] = err.message;
      });
      setStep1Errors(errors);

      // Focus first error field
      if (errors.visitType) {
        document.getElementById("visit-type-error")?.scrollIntoView({ behavior: "smooth" });
      } else if (errors.serviceSlug) {
        document.getElementById("service-slug-error")?.scrollIntoView({ behavior: "smooth" });
      } else if (errors.doctorSlug) {
        document.getElementById("doctor-slug-error")?.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }

    setStep1Errors({});
    transitionToStep(2, 1);
  };

  // --------------------------------------------------------------------------
  // Step 2 Validation & Next
  // --------------------------------------------------------------------------
  const handleNextFromStep2 = () => {
    const result = step2DateTimeSchema.safeParse({
      date,
      timeSlot,
      flexible,
    });

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const field = String(err.path[0]);
        if (!errors[field]) errors[field] = err.message;
      });
      setStep2Errors(errors);

      if (errors.date) {
        document.getElementById("date-error")?.scrollIntoView({ behavior: "smooth" });
      } else if (errors.timeSlot) {
        document.getElementById("time-slot-error")?.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }

    setStep2Errors({});
    transitionToStep(3, 1);
  };

  // --------------------------------------------------------------------------
  // Step 3 Validation & Server Submit
  // --------------------------------------------------------------------------
  const handleSubmitBooking = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setServerError(null);

    // Validate Step 3 locally
    const step3Result = step3DetailsSchema.safeParse({
      fullName,
      phone,
      email: email || "",
      notes: notes || "",
      consent,
      website: website || "",
    });

    if (!step3Result.success) {
      const errors: Record<string, string> = {};
      step3Result.error.issues.forEach((err) => {
        const field = String(err.path[0]);
        if (!errors[field]) errors[field] = err.message;
      });
      setStep3Errors(errors);

      // Focus first invalid field
      const firstField = step3Result.error.issues[0]?.path[0];
      if (firstField !== undefined) {
        const input = document.getElementById(`field-${String(firstField)}`);
        input?.focus();
      }
      return;
    }

    setStep3Errors({});

    // Full Payload Validation
    const fullPayload: BookingFormData = {
      serviceSlug,
      doctorSlug,
      visitType,
      planId: planId || undefined,
      date,
      timeSlot,
      flexible,
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      notes: notes.trim(),
      consent: true,
      website: website || "",
    };

    const combinedResult = combinedBookingSchema.safeParse(fullPayload);
    if (!combinedResult.success) {
      setServerError("Please review previous steps. Some required details are missing.");
      return;
    }

    // Call Server Action
    setIsSubmitting(true);
    try {
      const response = await submitAppointment(combinedResult.data);

      if (response.ok) {
        // Success
        setConfirmedReference(response.reference);
        setConfirmedData(combinedResult.data);
        setIsSubmitted(true);

        // Clear draft
        try {
          sessionStorage.removeItem(STORAGE_KEY);
        } catch {
          // ignore
        }

        // Scroll smoothly to top of card
        stepWrapperRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        ScrollTrigger.refresh();
      } else {
        // Server validation error
        if (response.fieldErrors) {
          const errors: Record<string, string> = {};
          Object.entries(response.fieldErrors).forEach(([key, msgs]) => {
            if (Array.isArray(msgs) && msgs.length > 0 && msgs[0]) {
              errors[key] = msgs[0];
            }
          });

          // Check if error belongs to step 1 or step 2
          if (errors.serviceSlug || errors.doctorSlug || errors.visitType) {
            setStep1Errors(errors);
            transitionToStep(1, -1);
          } else if (errors.date || errors.timeSlot) {
            setStep2Errors(errors);
            transitionToStep(2, -1);
          } else {
            setStep3Errors(errors);
          }
        }
        setServerError(response.message || "Unable to confirm booking. Please try again.");
      }
    } catch {
      setServerError(
        "A network connection error occurred while contacting our clinic server. Please check your internet or call us directly."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Inline blur validation for Step 3
  const handleBlurField = (fieldName: string) => {
    const fieldsToTest = {
      fullName,
      phone,
      email: email || "",
      notes: notes || "",
      consent,
      website,
    };
    const res = step3DetailsSchema.safeParse(fieldsToTest);
    if (!res.success) {
      const match = res.error.issues.find((i) => i.path[0] === fieldName);
      if (match) {
        setStep3Errors((prev) => ({ ...prev, [fieldName]: match.message }));
      } else {
        setStep3Errors((prev) => {
          const updated = { ...prev };
          delete updated[fieldName];
          return updated;
        });
      }
    } else {
      setStep3Errors((prev) => {
        const updated = { ...prev };
        delete updated[fieldName];
        return updated;
      });
    }
  };

  // Reset form
  const handleResetForm = () => {
    setIsSubmitted(false);
    setConfirmedReference("");
    setConfirmedData(null);
    setCurrentStep(1);
    setDate("");
    setTimeSlot("");
    setFullName("");
    setPhone("");
    setEmail("");
    setNotes("");
    setConsent(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
      {/* Mobile Collapsible Summary (shown at top on small screens) */}
      {!isSubmitted && (
        <div className="lg:hidden col-span-1">
          <BookingSummaryCard
            serviceSlug={serviceSlug}
            doctorSlug={doctorSlug}
            visitType={visitType}
            date={date}
            timeSlot={timeSlot}
            flexible={flexible}
            planId={planId}
          />
        </div>
      )}

      {/* LEFT COLUMN: Booking Wizard Card (~60% on desktop) */}
      <section
        aria-label="Appointment booking wizard"
        className="lg:col-span-7 xl:col-span-8 bg-white border border-line rounded-3xl p-6 sm:p-8 md:p-10 shadow-card relative overflow-hidden"
      >
        {/* Step Indicator Header (Hidden once submitted) */}
        {!isSubmitted && (
          <div className="mb-8 pb-6 border-b border-line">
            <StepIndicator
              currentStep={currentStep}
              isSubmitted={isSubmitted}
              onStepClick={(step) => {
                if (step < currentStep) {
                  transitionToStep(step, -1);
                }
              }}
            />
          </div>
        )}

        {/* Server Error Alert */}
        {serverError && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start justify-between gap-3 animate-fadeIn"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
            <button
              type="button"
              onClick={() => setServerError(null)}
              className="text-red-500 hover:text-red-800 text-xs font-semibold underline underline-offset-2 shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Dynamic Animated Step Container */}
        <div ref={stepWrapperRef} className="overflow-visible transition-none">
          <div ref={stepContainerRef}>
            {isSubmitted && confirmedData ? (
              <BookingConfirmation
                reference={confirmedReference}
                bookingData={confirmedData}
                onReset={handleResetForm}
              />
            ) : (
              <form onSubmit={handleSubmitBooking} noValidate>
                {/* STEP 1: Treatment & Doctor */}
                {currentStep === 1 && (
                  <Step1Treatment
                    serviceSlug={serviceSlug}
                    doctorSlug={doctorSlug}
                    visitType={visitType}
                    planId={planId}
                    errors={step1Errors}
                    onServiceChange={(slug) => {
                      setServiceSlug(slug);
                      if (step1Errors.serviceSlug) {
                        setStep1Errors((prev) => ({ ...prev, serviceSlug: "" }));
                      }
                    }}
                    onDoctorChange={(slug) => {
                      setDoctorSlug(slug);
                      if (step1Errors.doctorSlug) {
                        setStep1Errors((prev) => ({ ...prev, doctorSlug: "" }));
                      }
                    }}
                    onVisitTypeChange={(type) => {
                      setVisitType(type);
                      if (step1Errors.visitType) {
                        setStep1Errors((prev) => ({ ...prev, visitType: "" }));
                      }
                    }}
                    onClearPlan={() => setPlanId("")}
                  />
                )}

                {/* STEP 2: Date & Time Slot */}
                {currentStep === 2 && (
                  <Step2DateTime
                    selectedDate={date}
                    selectedSlot={timeSlot}
                    flexible={flexible}
                    errors={step2Errors}
                    onDateChange={(newDate) => {
                      setDate(newDate);
                      setTimeSlot(""); // Reset slot when date changes
                      if (step2Errors.date) {
                        setStep2Errors((prev) => ({ ...prev, date: "" }));
                      }
                    }}
                    onSlotChange={(newSlot) => {
                      setTimeSlot(newSlot);
                      if (step2Errors.timeSlot) {
                        setStep2Errors((prev) => ({ ...prev, timeSlot: "" }));
                      }
                    }}
                    onFlexibleChange={(val) => setFlexible(val)}
                  />
                )}

                {/* STEP 3: Patient Details */}
                {currentStep === 3 && (
                  <Step3Details
                    fullName={fullName}
                    phone={phone}
                    email={email}
                    notes={notes}
                    consent={consent}
                    website={website}
                    errors={step3Errors}
                    onFullNameChange={(val) => {
                      setFullName(val);
                      if (step3Errors.fullName) {
                        setStep3Errors((prev) => ({ ...prev, fullName: "" }));
                      }
                    }}
                    onPhoneChange={(val) => {
                      setPhone(val);
                      if (step3Errors.phone) {
                        setStep3Errors((prev) => ({ ...prev, phone: "" }));
                      }
                    }}
                    onEmailChange={(val) => {
                      setEmail(val);
                      if (step3Errors.email) {
                        setStep3Errors((prev) => ({ ...prev, email: "" }));
                      }
                    }}
                    onNotesChange={(val) => {
                      setNotes(val);
                      if (step3Errors.notes) {
                        setStep3Errors((prev) => ({ ...prev, notes: "" }));
                      }
                    }}
                    onConsentChange={(val) => {
                      setConsent(val);
                      if (step3Errors.consent) {
                        setStep3Errors((prev) => ({ ...prev, consent: "" }));
                      }
                    }}
                    onWebsiteChange={setWebsite}
                    onBlurField={handleBlurField}
                  />
                )}

                {/* Navigation Buttons Bar */}
                <div className="mt-10 pt-6 border-t border-line flex flex-wrap items-center justify-between gap-3">
                  {currentStep > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="md"
                      showIcon={false}
                      onClick={() => transitionToStep(currentStep - 1, -1)}
                      className="order-2 sm:order-1"
                    >
                      <span className="flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Previous Step</span>
                      </span>
                    </Button>
                  ) : (
                    <div className="hidden sm:block" />
                  )}

                  {currentStep === 1 && (
                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      showIcon={false}
                      onClick={handleNextFromStep1}
                      className="w-full sm:w-auto order-1 sm:order-2 ml-auto"
                    >
                      <span className="flex items-center gap-2">
                        <span>Continue to Schedule</span>
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </Button>
                  )}

                  {currentStep === 2 && (
                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      showIcon={false}
                      onClick={handleNextFromStep2}
                      className="w-full sm:w-auto order-1 sm:order-2 ml-auto"
                    >
                      <span className="flex items-center gap-2">
                        <span>Continue to Details</span>
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </Button>
                  )}

                  {currentStep === 3 && (
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      showIcon={false}
                      disabled={isSubmitting}
                      className="w-full sm:w-auto order-1 sm:order-2 ml-auto"
                    >
                      <span className="flex items-center gap-2">
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Confirming Appointment...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Confirm & Reserve Slot</span>
                          </>
                        )}
                      </span>
                    </Button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* RIGHT COLUMN: Live Sticky Booking Summary Card (~40% on desktop) */}
      {!isSubmitted && (
        <div className="hidden lg:block lg:col-span-5 xl:col-span-4">
          <BookingSummaryCard
            serviceSlug={serviceSlug}
            doctorSlug={doctorSlug}
            visitType={visitType}
            date={date}
            timeSlot={timeSlot}
            flexible={flexible}
            planId={planId}
          />
        </div>
      )}
    </div>
  );
};
