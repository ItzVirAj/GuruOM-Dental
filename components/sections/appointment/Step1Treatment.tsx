"use client";

import React from "react";
import {
  Stethoscope,
  Sparkles,
  Smile,
  ShieldCheck,
  Activity,
  HeartPulse,
  UserCheck,
  X,
  AlertCircle,
  LucideIcon,
} from "lucide-react";
import { servicesData, ServiceItem } from "@/data/services";
import { doctorsData, Doctor } from "@/data/doctors";
import { carePlans } from "@/data/pricing";
import { SmartImage } from "@/components/ui/SmartImage";

// Icon resolver for services
const ICON_MAP: Record<string, LucideIcon> = {
  Stethoscope,
  Sparkles,
  Smile,
  ShieldCheck,
  Activity,
  HeartPulse,
};

export interface Step1TreatmentProps {
  serviceSlug: string;
  doctorSlug: string;
  visitType: "first-visit" | "follow-up" | "emergency";
  planId?: string;
  errors?: {
    serviceSlug?: string;
    doctorSlug?: string;
    visitType?: string;
  };
  onServiceChange: (slug: string) => void;
  onDoctorChange: (slug: string) => void;
  onVisitTypeChange: (type: "first-visit" | "follow-up" | "emergency") => void;
  onClearPlan?: () => void;
}

export const Step1Treatment: React.FC<Step1TreatmentProps> = ({
  serviceSlug,
  doctorSlug,
  visitType,
  planId,
  errors,
  onServiceChange,
  onDoctorChange,
  onVisitTypeChange,
  onClearPlan,
}) => {
  const activePlan = carePlans.find((p) => p.id === planId);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Step Heading */}
      <div>
        <h2
          id="step1-heading"
          tabIndex={-1}
          className="text-display-sm sm:text-display-md font-display text-ink tracking-tight focus:outline-none"
        >
          Select Treatment & Doctor
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Choose the clinical care you need, your preferred doctor, and the nature of your visit.
        </p>

        {/* Removable URL Plan Chip */}
        {activePlan && (
          <div className="mt-3 inline-flex items-center gap-2 bg-accent/15 border border-accent/40 rounded-full px-3.5 py-1 text-xs font-medium text-ink">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" aria-hidden="true" />
            <span>
              Applied Care Plan: <strong>{activePlan.name}</strong>
            </span>
            {onClearPlan && (
              <button
                type="button"
                onClick={onClearPlan}
                className="ml-1 p-0.5 text-ink-muted hover:text-ink rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                aria-label={`Remove ${activePlan.name} care plan`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* 1. Visit Type Selector */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold text-ink">
          Nature of Visit <span className="text-accent-deep">*</span>
        </legend>
        <div
          role="radiogroup"
          aria-labelledby="visit-type-legend"
          className="grid grid-cols-1 sm:grid-cols-3 gap-2.5"
        >
          {[
            { id: "first-visit", label: "First Visit", sub: "New Patient Consult" },
            { id: "follow-up", label: "Follow-Up", sub: "Ongoing Treatment" },
            { id: "emergency", label: "Urgent Care", sub: "Pain / Acute Issue" },
          ].map((item) => {
            const isSelected = visitType === item.id;
            return (
              <label
                key={item.id}
                className={`relative flex flex-col p-3 rounded-2xl border transition-all duration-200 cursor-pointer text-left select-none focus-within:ring-2 focus-within:ring-brand focus-within:ring-offset-2 ${
                  isSelected
                    ? "border-brand bg-brand/5 shadow-soft"
                    : "border-line bg-surface hover:border-brand/40 hover:bg-surface-alt"
                }`}
              >
                <input
                  type="radio"
                  name="visitType"
                  value={item.id}
                  checked={isSelected}
                  onChange={() =>
                    onVisitTypeChange(item.id as "first-visit" | "follow-up" | "emergency")
                  }
                  className="sr-only"
                />
                <span className="flex items-center justify-between">
                  <span
                    className={`text-sm font-semibold ${
                      isSelected ? "text-brand" : "text-ink"
                    }`}
                  >
                    {item.label}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                      isSelected ? "border-brand bg-brand" : "border-line bg-white"
                    }`}
                  >
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>
                </span>
                <span className="text-[11px] text-ink-muted mt-0.5">{item.sub}</span>
              </label>
            );
          })}
        </div>
        {errors?.visitType && (
          <p
            id="visit-type-error"
            role="alert"
            className="flex items-center gap-1.5 text-xs text-danger mt-1"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errors.visitType}</span>
          </p>
        )}
      </fieldset>

      {/* 2. Service Selection Grid */}
      <fieldset className="space-y-2.5">
        <div className="flex items-center justify-between">
          <legend className="text-sm font-semibold text-ink">
            Dental Service <span className="text-accent-deep">*</span>
          </legend>
          <span className="text-xs text-ink-muted">Select 1 service</span>
        </div>

        <div
          role="radiogroup"
          aria-label="Select dental service"
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {servicesData.map((service: ServiceItem) => {
            const isSelected = serviceSlug === service.slug;
            const IconComponent = ICON_MAP[service.icon] || Sparkles;

            return (
              <label
                key={service.slug}
                className={`group relative flex items-start gap-3.5 p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer select-none focus-within:ring-2 focus-within:ring-brand focus-within:ring-offset-2 ${
                  isSelected
                    ? "border-brand bg-brand/5 shadow-soft ring-1 ring-brand"
                    : "border-line bg-white hover:border-brand/40 hover:bg-surface-alt"
                }`}
              >
                <input
                  type="radio"
                  name="serviceSlug"
                  value={service.slug}
                  checked={isSelected}
                  onChange={() => onServiceChange(service.slug)}
                  className="sr-only"
                />

                {/* Service Icon */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? "bg-brand text-white"
                      : "bg-surface-alt text-brand group-hover:bg-brand/10"
                  }`}
                  aria-hidden="true"
                >
                  <IconComponent className="w-4 h-4" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-sm font-semibold truncate ${
                        isSelected ? "text-brand" : "text-ink"
                      }`}
                    >
                      {service.title}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`w-3.5 h-3.5 rounded-full border shrink-0 flex items-center justify-center ${
                        isSelected ? "border-brand bg-brand" : "border-line bg-white"
                      }`}
                    >
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted line-clamp-1 mt-0.5">
                    {service.shortDescription}
                  </p>
                  <span className="inline-block text-[11px] font-medium text-brand-dark/80 mt-1">
                    Est. {service.duration}
                  </span>
                </div>
              </label>
            );
          })}
        </div>

        {errors?.serviceSlug && (
          <p
            id="service-slug-error"
            role="alert"
            className="flex items-center gap-1.5 text-xs text-danger mt-1"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errors.serviceSlug}</span>
          </p>
        )}
      </fieldset>

      {/* 3. Doctor Selection */}
      <fieldset className="space-y-2.5">
        <div className="flex items-center justify-between">
          <legend className="text-sm font-semibold text-ink">
            Preferred Specialist <span className="text-accent-deep">*</span>
          </legend>
          <span className="text-xs text-ink-muted">Any available doctor or select specific</span>
        </div>

        <div
          role="radiogroup"
          aria-label="Select doctor"
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {/* Option: Any Available Doctor */}
          <label
            className={`group relative flex items-center gap-3.5 p-3 rounded-2xl border transition-all duration-200 cursor-pointer select-none focus-within:ring-2 focus-within:ring-brand focus-within:ring-offset-2 ${
              doctorSlug === "any"
                ? "border-brand bg-brand/5 shadow-soft ring-1 ring-brand"
                : "border-line bg-white hover:border-brand/40 hover:bg-surface-alt"
            }`}
          >
            <input
              type="radio"
              name="doctorSlug"
              value="any"
              checked={doctorSlug === "any"}
              onChange={() => onDoctorChange("any")}
              className="sr-only"
            />
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                doctorSlug === "any" ? "bg-brand text-white" : "bg-surface-alt text-brand"
              }`}
              aria-hidden="true"
            >
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-semibold truncate ${
                    doctorSlug === "any" ? "text-brand" : "text-ink"
                  }`}
                >
                  Any Available Specialist
                </span>
                <span
                  aria-hidden="true"
                  className={`w-3.5 h-3.5 rounded-full border shrink-0 flex items-center justify-center ${
                    doctorSlug === "any" ? "border-brand bg-brand" : "border-line bg-white"
                  }`}
                >
                  {doctorSlug === "any" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </span>
              </div>
              <p className="text-xs text-ink-muted mt-0.5">
                Fastest appointment with our on-duty dental specialists
              </p>
            </div>
          </label>

          {/* Specific Doctors from Data Source */}
          {doctorsData.map((doc: Doctor) => {
            const isSelected = doctorSlug === doc.slug;
            return (
              <label
                key={doc.slug}
                className={`group relative flex items-center gap-3.5 p-3 rounded-2xl border transition-all duration-200 cursor-pointer select-none focus-within:ring-2 focus-within:ring-brand focus-within:ring-offset-2 ${
                  isSelected
                    ? "border-brand bg-brand/5 shadow-soft ring-1 ring-brand"
                    : "border-line bg-white hover:border-brand/40 hover:bg-surface-alt"
                }`}
              >
                <input
                  type="radio"
                  name="doctorSlug"
                  value={doc.slug}
                  checked={isSelected}
                  onChange={() => onDoctorChange(doc.slug)}
                  className="sr-only"
                />

                {/* Doctor Portrait Thumbnail */}
                <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border border-line bg-surface">
                  <SmartImage
                    slot={doc.imageSlot}
                    alt={doc.name}
                    ratio="1/1"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-sm font-semibold truncate ${
                        isSelected ? "text-brand" : "text-ink"
                      }`}
                    >
                      {doc.name}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`w-3.5 h-3.5 rounded-full border shrink-0 flex items-center justify-center ${
                        isSelected ? "border-brand bg-brand" : "border-line bg-white"
                      }`}
                    >
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted truncate mt-0.5">{doc.role}</p>
                </div>
              </label>
            );
          })}
        </div>

        {errors?.doctorSlug && (
          <p
            id="doctor-slug-error"
            role="alert"
            className="flex items-center gap-1.5 text-xs text-danger mt-1"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errors.doctorSlug}</span>
          </p>
        )}
      </fieldset>
    </div>
  );
};
