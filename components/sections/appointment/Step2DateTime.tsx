"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Sun,
  Sunset,
  Moon,
  Clock,
  Calendar as CalendarIcon,
  AlertCircle,
} from "lucide-react";
import {
  generateTimeSlotsForDate,
  isClosedDate,
  isDateInPast,
  isBeyondMaxBookingWindow,
  TimeSlot,
} from "@/lib/booking";

export interface Step2DateTimeProps {
  selectedDate: string; // YYYY-MM-DD
  selectedSlot: string; // e.g. "10:30"
  flexible: boolean;
  errors?: {
    date?: string;
    timeSlot?: string;
  };
  onDateChange: (dateStr: string) => void;
  onSlotChange: (slotId: string) => void;
  onFlexibleChange: (val: boolean) => void;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const DAY_FULL_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const Step2DateTime: React.FC<Step2DateTimeProps> = ({
  selectedDate,
  selectedSlot,
  flexible,
  errors,
  onDateChange,
  onSlotChange,
  onFlexibleChange,
}) => {
  // Calendar View Month/Year State
  const initialDate = useMemo(() => {
    if (selectedDate) {
      const d = new Date(selectedDate + "T00:00:00");
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  }, [selectedDate]);

  const [viewYear, setViewYear] = useState<number>(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(initialDate.getMonth()); // 0-11
  const [focusedDateStr, setFocusedDateStr] = useState<string>(selectedDate || "");

  const gridRef = useRef<HTMLDivElement | null>(null);

  // Time Slots for the selected date
  const timeSlots = useMemo(() => {
    if (!selectedDate) return [];
    return generateTimeSlotsForDate(selectedDate);
  }, [selectedDate]);

  // Group slots into Morning, Afternoon, Evening
  const groupedSlots = useMemo(() => {
    const morning = timeSlots.filter((s) => s.period === "Morning");
    const afternoon = timeSlots.filter((s) => s.period === "Afternoon");
    const evening = timeSlots.filter((s) => s.period === "Evening");
    return { morning, afternoon, evening };
  }, [timeSlots]);

  // Compute Days for the current month view
  const daysInMonth = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    const totalDays = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 is Sunday

    const days: Array<{
      dateStr: string;
      dayNumber: number;
      dayOfWeek: number;
      isCurrentMonth: boolean;
      isDisabled: boolean;
      isClosed: boolean;
      isToday: boolean;
      isSelected: boolean;
    }> = [];

    // Prefix empty/prev days
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({
        dateStr: "",
        dayNumber: 0,
        dayOfWeek: i,
        isCurrentMonth: false,
        isDisabled: true,
        isClosed: false,
        isToday: false,
        isSelected: false,
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= totalDays; day++) {
      const d = new Date(viewYear, viewMonth, day);
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;

      const isPast = isDateInPast(dateStr);
      const isClosed = isClosedDate(dateStr);
      const isBeyond = isBeyondMaxBookingWindow(dateStr, 60);
      const isDisabled = isPast || isClosed || isBeyond;
      const isToday =
        today.getFullYear() === viewYear &&
        today.getMonth() === viewMonth &&
        today.getDate() === day;
      const isSelected = selectedDate === dateStr;

      days.push({
        dateStr,
        dayNumber: day,
        dayOfWeek: d.getDay(),
        isCurrentMonth: true,
        isDisabled,
        isClosed,
        isToday,
        isSelected,
      });
    }

    return days;
  }, [viewYear, viewMonth, selectedDate]);

  // Restrict navigation: cannot go back prior to today's month, cannot go > 3 months ahead
  const today = new Date();
  const canGoPrev =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  const maxMonthLimit = new Date();
  maxMonthLimit.setDate(maxMonthLimit.getDate() + 65);
  const canGoNext =
    viewYear < maxMonthLimit.getFullYear() ||
    (viewYear === maxMonthLimit.getFullYear() && viewMonth < maxMonthLimit.getMonth());

  const handlePrevMonth = () => {
    if (!canGoPrev) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (!canGoNext) return;
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Keyboard navigation for the date grid
  const handleKeyDown = (e: React.KeyboardEvent, currentDateStr: string) => {
    if (!currentDateStr) return;
    const current = new Date(currentDateStr + "T00:00:00");
    if (isNaN(current.getTime())) return;

    let targetDate: Date | null = null;

    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        targetDate = new Date(current);
        targetDate.setDate(current.getDate() - 1);
        break;
      case "ArrowRight":
        e.preventDefault();
        targetDate = new Date(current);
        targetDate.setDate(current.getDate() + 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        targetDate = new Date(current);
        targetDate.setDate(current.getDate() - 7);
        break;
      case "ArrowDown":
        e.preventDefault();
        targetDate = new Date(current);
        targetDate.setDate(current.getDate() + 7);
        break;
      case "Home":
        e.preventDefault();
        targetDate = new Date(viewYear, viewMonth, 1);
        break;
      case "End":
        e.preventDefault();
        targetDate = new Date(viewYear, viewMonth + 1, 0);
        break;
      default:
        return;
    }

    if (targetDate) {
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth();
      const day = targetDate.getDate();
      const formatted = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(
        2,
        "0"
      )}`;

      // Switch month if target is outside current month view
      if (year !== viewYear || month !== viewMonth) {
        setViewYear(year);
        setViewMonth(month);
      }

      setFocusedDateStr(formatted);

      // Focus corresponding element
      setTimeout(() => {
        const btn = gridRef.current?.querySelector<HTMLButtonElement>(
          `button[data-date="${formatted}"]`
        );
        btn?.focus();
      }, 20);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Step Heading */}
      <div>
        <h2
          id="step2-heading"
          tabIndex={-1}
          className="text-display-sm sm:text-display-md font-display text-ink tracking-tight focus:outline-none"
        >
          Choose Date & Time
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Select an available day on the clinic schedule, then choose your preferred time slot.
        </p>
      </div>

      {/* Date Picker Card */}
      <div className="p-4 sm:p-5 rounded-2xl border border-line bg-surface/40">
        {/* Calendar Header with Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-brand" aria-hidden="true" />
            <span
              id="calendar-month-label"
              className="font-display font-semibold text-ink text-base sm:text-lg"
            >
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              disabled={!canGoPrev}
              aria-label="Previous month"
              className="p-1.5 rounded-full border border-line text-ink hover:bg-white hover:text-brand disabled:opacity-30 disabled:pointer-events-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              disabled={!canGoNext}
              aria-label="Next month"
              className="p-1.5 rounded-full border border-line text-ink hover:bg-white hover:text-brand disabled:opacity-30 disabled:pointer-events-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div
          role="row"
          className="grid grid-cols-7 gap-1 text-center mb-1 select-none text-xs font-semibold text-ink-muted"
        >
          {DAY_NAMES.map((name, i) => (
            <div key={name} className="py-1">
              <span className="sr-only">{DAY_FULL_NAMES[i]}</span>
              <span aria-hidden="true">{name}</span>
            </div>
          ))}
        </div>

        {/* Calendar Days Grid */}
        <div
          ref={gridRef}
          role="grid"
          aria-labelledby="calendar-month-label"
          className="grid grid-cols-7 gap-1"
        >
          {daysInMonth.map((dayItem, index) => {
            if (!dayItem.isCurrentMonth) {
              return <div key={`empty-${index}`} className="w-full aspect-square" />;
            }

            const isFocused =
              focusedDateStr === dayItem.dateStr ||
              (!focusedDateStr && dayItem.isSelected) ||
              (!focusedDateStr && !selectedDate && dayItem.isToday);

            const readableDate = new Date(dayItem.dateStr + "T00:00:00").toLocaleDateString(
              "en-IN",
              {
                weekday: "long",
                month: "short",
                day: "numeric",
              }
            );

            return (
              <button
                key={dayItem.dateStr}
                type="button"
                data-date={dayItem.dateStr}
                disabled={dayItem.isDisabled}
                tabIndex={isFocused ? 0 : -1}
                onClick={() => {
                  if (!dayItem.isDisabled) {
                    onDateChange(dayItem.dateStr);
                    setFocusedDateStr(dayItem.dateStr);
                  }
                }}
                onKeyDown={(e) => handleKeyDown(e, dayItem.dateStr)}
                aria-label={`${readableDate}${dayItem.isSelected ? " (Selected)" : ""}${
                  dayItem.isClosed ? " - Clinic closed" : ""
                }`}
                aria-pressed={dayItem.isSelected}
                className={`w-full aspect-square flex flex-col items-center justify-center rounded-xl text-xs sm:text-sm font-medium transition-all relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:z-10 ${
                  dayItem.isSelected
                    ? "bg-brand text-white font-semibold shadow-soft scale-[1.02]"
                    : dayItem.isToday && !dayItem.isDisabled
                    ? "bg-brand/10 text-brand font-semibold hover:bg-brand/20"
                    : dayItem.isDisabled
                    ? "text-ink-muted/30 cursor-not-allowed bg-transparent"
                    : "text-ink hover:bg-white hover:text-brand hover:shadow-sm"
                }`}
              >
                <span>{dayItem.dayNumber}</span>
                {dayItem.isToday && !dayItem.isSelected && (
                  <span
                    aria-hidden="true"
                    className="w-1 h-1 rounded-full bg-accent absolute bottom-1"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend / Disclaimers */}
        <div className="mt-3 pt-3 border-t border-line flex flex-wrap items-center justify-between gap-2 text-[11px] text-ink-muted">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-brand" aria-hidden="true" />
              <span>Selected</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-brand/15" aria-hidden="true" />
              <span>Today</span>
            </span>
          </div>
          <span>Sundays are closed (Emergency only)</span>
        </div>
      </div>

      {errors?.date && (
        <p
          id="date-error"
          role="alert"
          className="flex items-center gap-1.5 text-xs text-red-600"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errors.date}</span>
        </p>
      )}

      {/* Time Slots Section (shown once date is picked) */}
      {selectedDate ? (
        <div className="space-y-6 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand" aria-hidden="true" />
              <span>
                Available Time Slots for{" "}
                <span className="text-brand">
                  {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </span>
            </h3>
            <span className="text-xs text-ink-muted">30-min intervals</span>
          </div>

          {timeSlots.length === 0 ? (
            <div className="p-4 rounded-xl bg-surface-alt border border-line text-center text-xs text-ink-muted">
              No slots available for this date. Please pick another working day.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Morning Slots */}
              {groupedSlots.morning.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted mb-2">
                    <Sun className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
                    <span>Morning (9:00 AM – 11:30 AM)</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {groupedSlots.morning.map((slot: TimeSlot) => renderSlotButton(slot))}
                  </div>
                </div>
              )}

              {/* Afternoon Slots */}
              {groupedSlots.afternoon.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted mb-2">
                    <Sunset className="w-3.5 h-3.5 text-orange-500" aria-hidden="true" />
                    <span>Afternoon (12:00 PM – 4:30 PM)</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {groupedSlots.afternoon.map((slot: TimeSlot) => renderSlotButton(slot))}
                  </div>
                </div>
              )}

              {/* Evening Slots */}
              {groupedSlots.evening.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted mb-2">
                    <Moon className="w-3.5 h-3.5 text-indigo-400" aria-hidden="true" />
                    <span>Evening (5:00 PM – 8:00 PM)</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {groupedSlots.evening.map((slot: TimeSlot) => renderSlotButton(slot))}
                  </div>
                </div>
              )}
            </div>
          )}

          {errors?.timeSlot && (
            <p
              id="time-slot-error"
              role="alert"
              className="flex items-center gap-1.5 text-xs text-red-600 mt-2"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.timeSlot}</span>
            </p>
          )}

          {/* "I'm Flexible" Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={flexible}
                onChange={(e) => onFlexibleChange(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-line text-brand focus:ring-brand focus:ring-offset-2"
              />
              <div className="text-xs">
                <span className="font-semibold text-ink">
                  I&apos;m flexible with timing
                </span>
                <p className="text-ink-muted mt-0.5">
                  If this exact slot is taken, our desk may offer you an adjacent slot on the same
                  day.
                </p>
              </div>
            </label>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-surface-alt border border-line text-center text-xs text-ink-muted">
          Please select a calendar date above to display available time slots.
        </div>
      )}
    </div>
  );

  function renderSlotButton(slot: TimeSlot) {
    const isSelected = selectedSlot === slot.id;
    return (
      <button
        key={slot.id}
        type="button"
        disabled={!slot.available}
        onClick={() => onSlotChange(slot.id)}
        aria-pressed={isSelected}
        aria-label={`${slot.time} ${!slot.available ? "- Unavailable" : ""}`}
        className={`px-2.5 py-2 rounded-xl text-xs font-medium border text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
          isSelected
            ? "border-brand bg-brand text-white shadow-soft font-semibold"
            : slot.available
            ? "border-line bg-white text-ink hover:border-brand/40 hover:bg-brand/5"
            : "border-line/40 bg-surface-alt/40 text-ink-muted/40 cursor-not-allowed line-through"
        }`}
      >
        {slot.time}
      </button>
    );
  }
};
