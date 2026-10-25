"use client";

import React, { useRef, useState, useCallback, useMemo, useEffect } from "react";
import Link from "next/link";
import { gsap, useGSAP } from "@/lib/gsap";
import { Container, Eyebrow } from "@/components/ui";
import { useReducedMotion } from "@/components/animations";
import { MAHARASHTRA_MAP_DATA, IsometricDistrict } from "@/data/maharashtra-map.generated";
import { labs, LabLocation, LocationType } from "@/data/labs";

export function LabsMap() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const mapGroupRef = useRef<SVGGElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const prefersReducedMotion = useReducedMotion();

  // Active interaction & filter states
  const [activeLabId, setActiveLabId] = useState<string | null>(null);
  const [selectedLab, setSelectedLab] = useState<LabLocation | null>(null);
  const [filterType, setFilterType] = useState<"all" | LocationType>("all");

  // Map lab objects to district data
  const labDistrictMap = useMemo(() => {
    const map = new Map<string, IsometricDistrict>();
    for (const d of MAHARASHTRA_MAP_DATA.districts) {
      if (d.isLab) {
        map.set(d.id, d);
      }
    }
    return map;
  }, []);

  const labByDistrictId = useMemo(() => {
    const map = new Map<string, LabLocation>();
    for (const l of labs) {
      map.set(l.districtId, l);
    }
    return map;
  }, []);

  // Center of the map for coordinate positioning
  const mapCenter = useMemo(() => {
    const b = MAHARASHTRA_MAP_DATA.viewBoxBounds;
    return {
      x: b.minX + b.width / 2,
      y: b.minY + b.height / 2,
    };
  }, []);

  // Compute 360-degree radial label placements for each location
  const labelPositions = useMemo(() => {
    const computed: Record<
      string,
      {
        chipX: number;
        chipY: number;
        chipW: number;
        chipH: number;
        leaderX: number;
        leaderY: number;
        isLeft: boolean;
      }
    > = {};

    labs.forEach((lab) => {
      const d = labDistrictMap.get(lab.districtId);
      if (!d) return;

      const isFullLab = lab.type === "lab";
      const CHIP_W = isFullLab ? 74 : 62;
      const CHIP_H = isFullLab ? 30 : 26;

      const [tx, ty] = d.pin.top;
      const offX = lab.offset?.x ?? (tx < mapCenter.x ? -110 : 110);
      const offY = lab.offset?.y ?? -30;

      // Radial chip center (positioned outward outside the 3D map plate)
      const cx = tx + offX;
      const cy = ty + offY;

      const chipX = cx - CHIP_W / 2;
      const chipY = cy - CHIP_H / 2;

      // Inward-facing anchor point on chip boundary for clean leader line connection
      let leaderX = cx;
      let leaderY = cy;

      if (Math.abs(offX) >= Math.abs(offY)) {
        // Horizontal dominance: connect to the edge facing the pin
        leaderX = offX > 0 ? chipX : chipX + CHIP_W;
        leaderY = cy;
      } else {
        // Vertical dominance: connect to top or bottom edge facing the pin
        leaderX = cx;
        leaderY = offY > 0 ? chipY : chipY + CHIP_H;
      }

      computed[lab.id] = {
        chipX,
        chipY,
        chipW: CHIP_W,
        chipH: CHIP_H,
        leaderX,
        leaderY,
        isLeft: offX < 0,
      };
    });

    return computed;
  }, [labDistrictMap, mapCenter.x]);

  // Handle keyboard accessibility (Escape to dismiss card)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedLab(null);
        setActiveLabId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // -------------------------------------------------------------
  // Streamlined GSAP Entrance Animation (Zero Scroll Jitter)
  // -------------------------------------------------------------
  useGSAP(
    () => {
      const section = sectionRef.current;
      const svg = svgRef.current;
      const mapGroup = mapGroupRef.current;
      if (!section || !svg || !mapGroup) return;

      if (prefersReducedMotion) {
        gsap.set(section, { opacity: 1, visibility: "visible" });
        return;
      }

      // Master Entrance Timeline triggered on scroll
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 75%",
          once: true,
        },
        defaults: { ease: "power2.out" },
      });

      // 1. Diorama base & map slab smoothly rise in as single composite unit
      tl.fromTo(
        mapGroup,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.85, ease: "power2.out" }
      );

      // 2. The 3 main lab districts rise higher with warm glow
      const labDistricts = svg.querySelectorAll(".district-lab-primary");
      const serviceDistricts = svg.querySelectorAll(".district-lab-service");
      const labGlow = svg.querySelector("#lab-unified-glow");

      if (labDistricts.length > 0) {
        tl.fromTo(
          labDistricts,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, stagger: 0.06, duration: 0.5, ease: "back.out(1.5)" },
          0.3
        );
      }

      if (serviceDistricts.length > 0) {
        tl.fromTo(
          serviceDistricts,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, stagger: 0.03, duration: 0.45, ease: "power2.out" },
          0.4
        );
      }

      if (labGlow) {
        tl.fromTo(
          labGlow,
          { opacity: 0 },
          { opacity: 0.75, duration: 0.8, ease: "power2.out" },
          0.45
        );
      }

      // 3. Pins drop from above with small bounce
      const pins = svg.querySelectorAll(".lab-pin-marker");
      if (pins.length > 0) {
        tl.fromTo(
          pins,
          { opacity: 0, y: -24 },
          { opacity: 1, y: 0, stagger: 0.04, duration: 0.55, ease: "bounce.out" },
          0.5
        );
      }

      // 4. Leader lines draw with strokeDashoffset, then label chips pop in
      const leaderLines = svg.querySelectorAll(".lab-leader-line");
      const labelChips = svg.querySelectorAll(".lab-label-chip");

      if (leaderLines.length > 0) {
        tl.fromTo(
          leaderLines,
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, stagger: 0.03, duration: 0.35, ease: "power2.out" },
          0.7
        );
      }

      if (labelChips.length > 0) {
        tl.fromTo(
          labelChips,
          { opacity: 0, scale: 0.8, transformOrigin: "50% 50%" },
          { opacity: 1, scale: 1, stagger: 0.03, duration: 0.35, ease: "back.out(1.8)" },
          0.75
        );
      }
    },
    { scope: sectionRef, dependencies: [prefersReducedMotion] }
  );

  // Interaction handlers
  const handleLabHover = useCallback((labId: string | null) => {
    setActiveLabId(labId);
  }, []);

  const handleLabSelect = useCallback((lab: LabLocation) => {
    setSelectedLab((prev) => (prev?.id === lab.id ? null : lab));
    setActiveLabId(lab.id);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="our-labs"
      aria-labelledby="labs-heading"
      className="relative w-full overflow-hidden py-20 sm:py-28 lg:py-36 text-white"
      style={{ backgroundColor: "var(--brand-dark)" }}
    >
      {/* Background Subtle Isometric Grid Pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage: `radial-gradient(ellipse at 50% 50%, rgba(247, 146, 47, 0.15), transparent 70%), linear-gradient(30deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(-30deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
          backgroundSize: "100% 100%, 48px 28px, 48px 28px",
        }}
        aria-hidden="true"
      />

      <Container>
        {/* ==============================================================
            SECTION HEADER
        ============================================================== */}
        <div className="relative mx-auto max-w-3xl text-center mb-8 sm:mb-12">
          <div className="mb-4 flex justify-center">
            <Eyebrow variant="dot" color="inverse">
              OUR MAHARASHTRA NETWORK
            </Eyebrow>
          </div>

          <div className="mb-6">
            <h2
              id="labs-heading"
              className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.15]"
            >
              Our labs &amp; service network across Maharashtra
            </h2>
          </div>

          {/* ==============================================================
              SIMPLIFIED LEGEND: 3 DIGITAL DENTAL LABS & 7 SERVICES HUBS
          ============================================================== */}
          <div className="flex items-center justify-center">
            <div className="inline-flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 px-5 py-2.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md shadow-xl text-xs sm:text-sm font-body">
              <button
                type="button"
                onClick={() => setFilterType((prev) => (prev === "lab" ? "all" : "lab"))}
                className={`inline-flex items-center gap-2 py-1 px-3 rounded-full transition-colors cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-accent ${filterType === "lab" ? "bg-accent/25 text-white font-bold" : "text-white/90 hover:text-white"
                  }`}
                title="Filter: 3 Digital Dental Labs (Chh. Sambhajinagar, Ahilyanagar, Pune)"
              >
                <span className="relative flex h-2.5 w-2.5 items-center justify-center">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ backgroundColor: "var(--accent)" }}
                  />
                  <span
                    className="relative inline-flex rounded-full h-2 w-2"
                    style={{ backgroundColor: "var(--accent)" }}
                  />
                </span>
                <span className="font-semibold text-white">3 Working Centres</span>
              </button>

              <span className="text-white/40 font-light" aria-hidden="true">&amp;</span>

              <button
                type="button"
                onClick={() => setFilterType((prev) => (prev === "service" ? "all" : "service"))}
                className={`inline-flex items-center gap-2 py-1 px-3 rounded-full transition-colors cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-accent ${filterType === "service" ? "bg-amber-400/25 text-white font-bold" : "text-white/90 hover:text-white"
                  }`}
                title="Filter: 7 Services Hubs (Nashik, Nagpur, Jalgaon, Jalna, Nanded, Solapur, Kolhapur)"
              >
                <span className="w-2 h-2 rounded-full border border-amber-400 bg-amber-400/50 shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                <span className="font-medium text-white/90">7 Services Hubs</span>
              </button>
            </div>
          </div>
        </div>

        {/* ==============================================================
            THE ISOMETRIC MAP CANVAS
        ============================================================== */}
        <div className="relative mx-auto w-full max-w-[1100px] mb-0">
          {/* Aspect-ratio container prevents any layout shift */}
          <div
            className="relative w-full select-none"
            style={{
              aspectRatio: `${MAHARASHTRA_MAP_DATA.viewBoxBounds.width} / ${MAHARASHTRA_MAP_DATA.viewBoxBounds.height}`,
            }}
          >
            <svg
              ref={svgRef}
              viewBox={MAHARASHTRA_MAP_DATA.viewBox}
              role="img"
              aria-label="Map of Maharashtra showing 3 digital labs and 7 regional service delivery areas"
              className="w-full h-full overflow-visible"
            >
              <defs>
                {/* Standard non-lab districts */}
                <linearGradient id="iso-non-lab-grad" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="var(--surface-alt)" />
                  <stop offset="100%" stopColor="var(--white)" />
                </linearGradient>

                {/* 3 Full Labs: Vibrant Primary Orange Gradient */}
                <linearGradient id="iso-lab-primary-grad" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="var(--accent)" />
                  <stop offset="100%" stopColor="#FFA851" />
                </linearGradient>

                {/* 7 Service Areas: Warm Amber/Gold Network Gradient */}
                <linearGradient id="iso-service-area-grad" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#D97706" />
                  <stop offset="100%" stopColor="#FBBF24" />
                </linearGradient>

                {/* Diorama base plate slab */}
                <linearGradient id="iso-base-grad" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#221F20" />
                  <stop offset="100%" stopColor="#2E2A2B" />
                </linearGradient>

                {/* Hardware-accelerated radial gradient ground shadow (Zero blur filter cost) */}
                <radialGradient id="iso-ground-shadow-grad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#000000" stopOpacity="0.55" />
                  <stop offset="60%" stopColor="#000000" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                </radialGradient>

                {/* Lightweight blur glow filter */}
                <filter id="labs-glow-filter" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                </filter>
              </defs>

              {/* Master Diorama Group */}
              <g ref={mapGroupRef} id="iso-map-content">
                {/* 1. Ambient ground shadow (Radial gradient, 100% GPU accelerated) */}
                <ellipse
                  id="ground-shadow"
                  className="pointer-events-none"
                  cx={mapCenter.x}
                  cy={MAHARASHTRA_MAP_DATA.viewBoxBounds.minY + MAHARASHTRA_MAP_DATA.viewBoxBounds.height - 40}
                  rx={MAHARASHTRA_MAP_DATA.viewBoxBounds.width * 0.44}
                  ry={MAHARASHTRA_MAP_DATA.viewBoxBounds.height * 0.22}
                  fill="url(#iso-ground-shadow-grad)"
                />

                {/* 2. Extruded Base Plate Diorama Slab (Direct SVG elements, pointer-events-none) */}
                <g id="base-plate" className="pointer-events-none">
                  {MAHARASHTRA_MAP_DATA.basePlate.walls.map((w, idx) => (
                    <path
                      key={`base-wall-${idx}`}
                      d={w.d}
                      fill={w.orientation === "left" ? "#282425" : "#171415"}
                      stroke="var(--brand-dark)"
                      strokeWidth="0.5"
                    />
                  ))}
                  <path
                    d={MAHARASHTRA_MAP_DATA.basePlate.topPath}
                    fill="url(#iso-base-grad)"
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="1"
                  />
                </g>

                {/* 3. Unified Lab Glow Layer (Pointer-events-none) */}
                <g id="lab-unified-glow" className="pointer-events-none" filter="url(#labs-glow-filter)" opacity="0.75">
                  {MAHARASHTRA_MAP_DATA.districts
                    .filter((d) => d.isLab)
                    .map((d) => {
                      const lab = labByDistrictId.get(d.id);
                      const isFullLab = lab?.type === "lab";
                      return (
                        <path
                          key={`glow-${d.id}`}
                          d={d.topPath}
                          fill={isFullLab ? "var(--accent)" : "#F59E0B"}
                          opacity={isFullLab ? 0.9 : 0.6}
                        />
                      );
                    })}
                </g>

                {/* 4. Districts & Prisms in correct 3D depth order */}
                <g id="districts-container">
                  {MAHARASHTRA_MAP_DATA.districts.map((d) => {
                    const isMarked = d.isLab;
                    const matchingLab = isMarked ? labByDistrictId.get(d.id) : null;
                    const isFullLab = matchingLab?.type === "lab";
                    const isService = matchingLab?.type === "service";

                    // Check if dimmed by filter
                    const isDimmed =
                      filterType === "lab" ? !isFullLab : filterType === "service" ? !isService : false;

                    const isHighlighted = matchingLab ? activeLabId === matchingLab.id : false;

                    return (
                      <g
                        key={d.id}
                        id={`district-${d.id}`}
                        data-cx={d.centroid[0]}
                        data-cy={d.centroid[1]}
                        className={`${isMarked
                            ? isFullLab
                              ? "district-lab district-lab-primary cursor-pointer transition-transform duration-200 ease-out"
                              : "district-lab district-lab-service cursor-pointer transition-transform duration-200 ease-out"
                            : "district-non-lab pointer-events-none"
                          }`}
                        style={{
                          transform: isHighlighted ? "translateY(-6px)" : "translateY(0)",
                          opacity: isDimmed ? 0.35 : 1,
                          transition: "opacity 0.25s ease, transform 0.2s ease-out",
                        }}
                        onClick={() => matchingLab && handleLabSelect(matchingLab)}
                        onMouseEnter={() => matchingLab && handleLabHover(matchingLab.id)}
                        onMouseLeave={() => matchingLab && handleLabHover(null)}
                      >
                        {/* Extrusion side walls */}
                        {d.walls.map((w, wIdx) => {
                          let wallFill = "";
                          if (isFullLab) {
                            wallFill =
                              w.orientation === "left"
                                ? isHighlighted
                                  ? "#E87A18"
                                  : "var(--accent-deep)"
                                : isHighlighted
                                  ? "#B8560B"
                                  : "#8F3E04";
                          } else if (isService) {
                            wallFill =
                              w.orientation === "left"
                                ? isHighlighted
                                  ? "#F59E0B"
                                  : "#B45309"
                                : isHighlighted
                                  ? "#D97706"
                                  : "#78350F";
                          } else {
                            wallFill =
                              w.orientation === "left"
                                ? "rgba(224, 221, 218, 0.75)"
                                : "rgba(107, 102, 103, 0.6)";
                          }

                          return (
                            <path
                              key={`w-${d.id}-${wIdx}`}
                              d={w.d}
                              fill={wallFill}
                              stroke="rgba(0, 0, 0, 0.12)"
                              strokeWidth="0.5"
                            />
                          );
                        })}

                        {/* Top Face */}
                        <path
                          d={d.topPath}
                          fill={
                            isFullLab
                              ? isHighlighted
                                ? "#FFA851"
                                : "url(#iso-lab-primary-grad)"
                              : isService
                                ? isHighlighted
                                  ? "#FDE68A"
                                  : "url(#iso-service-area-grad)"
                                : "url(#iso-non-lab-grad)"
                          }
                          stroke={
                            isFullLab
                              ? "rgba(255, 255, 255, 0.95)"
                              : isService
                                ? "rgba(255, 255, 255, 0.75)"
                                : "rgba(255, 255, 255, 0.45)"
                          }
                          strokeWidth={isFullLab ? "1.25" : isService ? "1" : "0.75"}
                        />

                        {/* Distinct sheen highlight for the 3 labs */}
                        {isFullLab && (
                          <path
                            d={d.topPath}
                            fill="none"
                            stroke="rgba(255, 255, 255, 0.85)"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            opacity={isHighlighted ? "1" : "0.75"}
                          />
                        )}
                      </g>
                    );
                  })}
                </g>

                {/* 5. Pins, Ripple Rings, Leader Lines & Label Badges */}
                <g id="pins-and-labels-container">
                  {labs.map((lab) => {
                    const d = labDistrictMap.get(lab.districtId);
                    if (!d) return null;

                    const isFullLab = lab.type === "lab";
                    const isService = lab.type === "service";
                    const isDimmed = filterType === "lab" ? !isFullLab : filterType === "service" ? !isService : false;
                    const isHighlighted = activeLabId === lab.id;

                    const [tx, ty] = d.pin.top;
                    const [bx, by] = d.pin.base;
                    const pos = labelPositions[lab.id] || {
                      chipX: tx + 65,
                      chipY: ty - 28,
                      chipW: isFullLab ? 68 : 58,
                      chipH: isFullLab ? 28 : 24,
                      leaderX: tx + 65,
                      leaderY: ty - 15,
                      isLeft: false,
                    };

                    const markerColor = isFullLab ? "var(--accent)" : "#F59E0B";

                    return (
                      <g
                        key={`pin-${lab.id}`}
                        id={`lab-pin-${lab.id}`}
                        className="cursor-pointer"
                        style={{
                          opacity: isDimmed ? 0.35 : 1,
                          transition: "opacity 0.25s ease",
                        }}
                        onMouseEnter={() => handleLabHover(lab.id)}
                        onMouseLeave={() => handleLabHover(null)}
                      >
                        {/* Ground Contact Shadow & Pulsing Ripple Ring */}
                        <ellipse
                          cx={bx}
                          cy={by}
                          rx={isHighlighted ? 18 : isFullLab ? 14 : 10}
                          ry={isHighlighted ? 10.4 : isFullLab ? 8.1 : 5.8}
                          fill="none"
                          stroke={markerColor}
                          strokeWidth={isFullLab ? "1.75" : "1.25"}
                          opacity={isHighlighted ? 0.95 : isFullLab ? 0.75 : 0.45}
                          className="transition-all duration-300"
                        />
                        <ellipse cx={bx} cy={by} rx="4" ry="2.3" fill="rgba(0, 0, 0, 0.5)" />

                        {/* Pin Stem */}
                        <line
                          x1={bx}
                          y1={by}
                          x2={tx}
                          y2={ty}
                          stroke="rgba(255, 255, 255, 0.75)"
                          strokeWidth={isFullLab ? "1.5" : "1"}
                          strokeDasharray={isFullLab ? "2 2" : "1.5 2"}
                        />

                        {/* 360-Degree Radial Leader line to Label Chip */}
                        <line
                          className="lab-leader-line transition-all duration-200"
                          x1={tx}
                          y1={ty - 12}
                          x2={pos.leaderX}
                          y2={pos.leaderY}
                          stroke={isHighlighted ? markerColor : "rgba(255, 255, 255, 0.65)"}
                          strokeWidth={isHighlighted ? 1.5 : 1}
                        />

                        {/* Accessible Focusable Pin Marker Head */}
                        <g
                          className="lab-pin-marker outline-none"
                          tabIndex={0}
                          role="button"
                          aria-label={`${isFullLab ? "Digital Precision Lab" : "Regional Service Area"}: ${lab.name}. Press Enter for details.`}
                          aria-expanded={selectedLab?.id === lab.id}
                          onClick={() => handleLabSelect(lab)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleLabSelect(lab);
                            }
                          }}
                          onFocus={() => handleLabHover(lab.id)}
                          onBlur={() => handleLabHover(null)}
                        >
                          {/* Invisible expanded touch target (>= 44px) */}
                          <circle cx={tx} cy={ty - 12} r="24" fill="transparent" />

                          {/* Fast vector shadow (Zero filter cost) */}
                          <circle
                            cx={tx}
                            cy={ty - 10}
                            r={isHighlighted ? (isFullLab ? 10 : 8) : isFullLab ? 8.5 : 6.5}
                            fill="rgba(0, 0, 0, 0.35)"
                          />

                          {/* 3D Pin Head */}
                          <circle
                            cx={tx}
                            cy={ty - 12}
                            r={isHighlighted ? (isFullLab ? 10 : 8) : isFullLab ? 8.5 : 6.5}
                            fill={markerColor}
                            stroke="var(--white)"
                            strokeWidth={isFullLab ? "2.2" : "1.5"}
                            className="transition-transform duration-200"
                          />
                          <circle
                            cx={tx}
                            cy={ty - 12}
                            r={isHighlighted ? 3.5 : isFullLab ? 3 : 2}
                            fill="var(--white)"
                          />
                        </g>

                        {/* 360-Degree Positioned Label Chip */}
                        <g
                          className="lab-label-chip transition-all duration-200 cursor-pointer"
                          onClick={() => handleLabSelect(lab)}
                        >
                          {/* Fast vector shadow rect */}
                          <rect
                            x={pos.chipX}
                            y={pos.chipY + 2}
                            width={pos.chipW}
                            height={pos.chipH}
                            rx="8"
                            fill="rgba(0, 0, 0, 0.35)"
                          />
                          <rect
                            x={pos.chipX}
                            y={pos.chipY}
                            width={pos.chipW}
                            height={pos.chipH}
                            rx="8"
                            fill={
                              isHighlighted
                                ? markerColor
                                : isFullLab
                                  ? "rgba(30, 27, 28, 0.95)"
                                  : "rgba(24, 22, 23, 0.9)"
                            }
                            stroke={
                              isHighlighted
                                ? "var(--white)"
                                : isFullLab
                                  ? "var(--accent)"
                                  : "rgba(255, 255, 255, 0.25)"
                            }
                            strokeWidth={isFullLab ? "1.25" : "0.75"}
                          />

                          {/* Text label with role badge */}
                          <text
                            x={pos.chipX + pos.chipW / 2}
                            y={pos.chipY + (isFullLab ? 13 : 12)}
                            fontFamily="var(--font-body), sans-serif"
                            fontSize={isFullLab ? "7" : "6.5"}
                            fontWeight="800"
                            fill={isHighlighted ? "var(--on-accent)" : isFullLab ? "var(--accent)" : "#FBBF24"}
                            textAnchor="middle"
                            letterSpacing="0.08em"
                          >
                            {isFullLab ? "LAB" : "SERVICE"}
                          </text>

                          <text
                            x={pos.chipX + pos.chipW / 2}
                            y={pos.chipY + (isFullLab ? 23 : 20)}
                            fontFamily="var(--font-body), sans-serif"
                            fontSize={isFullLab ? "9" : "8"}
                            fontWeight="700"
                            fill={isHighlighted ? "var(--on-accent)" : "var(--white)"}
                            textAnchor="middle"
                            letterSpacing="0.02em"
                          >
                            {lab.name}
                          </text>
                        </g>
                      </g>
                    );
                  })}
                </g>

                {/* 6. Isometric Compass & North Indicator (Pointer-events-none) */}
                <g id="iso-compass" className="pointer-events-none" transform="translate(290, -10)">
                  <ellipse
                    cx="0"
                    cy="0"
                    rx="22"
                    ry="12.7"
                    fill="rgba(30, 27, 28, 0.8)"
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth="1"
                  />
                  <polygon points="0,-16 5,-3 -5,-3" fill="var(--accent)" />
                  <polygon points="0,16 5,3 -5,3" fill="rgba(255, 255, 255, 0.4)" />
                  <text
                    x="0"
                    y="-19"
                    fontFamily="var(--font-body), sans-serif"
                    fontSize="9"
                    fontWeight="700"
                    fill="var(--white)"
                    textAnchor="middle"
                  >
                    N
                  </text>
                </g>
              </g>
            </svg>

            {/* Interactive Detail Card (Appears when a lab or service area is selected) */}
            {selectedLab && (
              <div
                ref={cardRef}
                role="dialog"
                aria-label={`Details for ${selectedLab.name}`}
                className="absolute top-4 right-4 z-20 w-84 max-w-[calc(100vw-2rem)] rounded-2xl p-5 shadow-2xl border border-white/20 transition-all duration-300 animate-in fade-in slide-in-from-top-2"
                style={{ backgroundColor: "rgba(26, 23, 24, 0.96)" }}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span
                      className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1.5 font-body ${selectedLab.type === "lab"
                          ? "bg-accent/20 text-accent border border-accent/40"
                          : "bg-amber-500/20 text-amber-300 border border-amber-400/40"
                        }`}
                    >
                      {selectedLab.type === "lab" ? "Digital Dental Lab" : "Services Hub"}
                    </span>
                    <h3 className="font-display text-xl font-bold text-white">
                      {selectedLab.name}
                    </h3>
                    <p className="text-xs text-white/60 font-body mt-0.5">
                      {selectedLab.tagline}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedLab(null)}
                    aria-label="Close details"
                    className="p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                {/* Capabilities pills */}
                {selectedLab.capabilities && selectedLab.capabilities.length > 0 && (
                  <div className="mb-3.5 flex flex-wrap gap-1.5">
                    {selectedLab.capabilities.map((cap, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-white/10 text-white/80 font-body"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                )}

                <div className="space-y-2 text-xs text-white/80 font-body mb-4 pt-2 border-t border-white/10">
                  <div className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-accent shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>{selectedLab.address}</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                    </svg>
                    <a
                      href={`tel:${selectedLab.phone.replace(/[^+\d]/g, "")}`}
                      className="text-accent hover:underline font-medium"
                    >
                      {selectedLab.phone}
                    </a>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>{selectedLab.hours}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex justify-between items-center text-[11px] text-white/50">
                  <span>Press Esc to close</span>
                  <Link
                    href="/contact"
                    className="text-accent font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    Contact location &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

export default LabsMap;
