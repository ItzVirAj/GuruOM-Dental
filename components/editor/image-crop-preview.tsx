"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  RotateCw,
  RotateCcw,
  Crop,
  Maximize2,
  Check,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import {
  FULL_CROP,
  clamp,
  computeCenteredCrop,
  computeOutputDimensions,
  renderRotatedPreviewUrl,
  type CropRect,
  type RotationDegrees,
} from "@/src/lib/media/client-resize";

export type AspectPreset =
  | "free"
  | "4/5"
  | "4/3"
  | "1/1"
  | "16/10"
  | "16/9"
  | "1.91/1";

interface AspectOption {
  id: AspectPreset;
  label: string;
  hint: string;
  ratio: number | null;
}

const ASPECT_OPTIONS: AspectOption[] = [
  { id: "free", label: "Free", hint: "Custom crop", ratio: null },
  { id: "4/5", label: "4:5", hint: "Gallery Card", ratio: 4 / 5 },
  { id: "4/3", label: "4:3", hint: "Standard Card", ratio: 4 / 3 },
  { id: "1/1", label: "1:1", hint: "Square", ratio: 1 },
  { id: "16/10", label: "16:10", hint: "Article Cover", ratio: 16 / 10 },
  { id: "16/9", label: "16:9", hint: "Widescreen", ratio: 16 / 9 },
  { id: "1.91/1", label: "1.91:1", hint: "Social Share", ratio: 1200 / 630 },
];

type DragHandle = "move" | "nw" | "ne" | "sw" | "se" | "n" | "s" | "w" | "e";

export interface PreviewConfirmPayload {
  hasEdits: boolean;
  crop: CropRect;
  rotation: RotationDegrees;
  maxWidth: number;
  maxHeight: number;
  quality: number;
  alt: string;
  decorative: boolean;
}

export interface ImageCropPreviewProps {
  sourceUrl: string;
  initialWidth: number;
  initialHeight: number;
  fileName: string;
  initialAlt: string;
  initialDecorative: boolean;
  mode: "upload" | "library";
  defaultAspect?: AspectPreset;
  confirmedRights: boolean;
  onConfirmedRightsChange: (val: boolean) => void;
  isSubmitting: boolean;
  submitProgress: number;
  submitError: string | null;
  onBack: () => void;
  onCancel: () => void;
  onConfirm: (payload: PreviewConfirmPayload) => void;
  onInsertOriginal?: () => void;
}

function getRatioForPreset(preset: AspectPreset): number | null {
  return ASPECT_OPTIONS.find((a) => a.id === preset)?.ratio ?? null;
}

export function ImageCropPreview({
  sourceUrl,
  initialWidth,
  initialHeight,
  fileName,
  initialAlt,
  initialDecorative,
  mode,
  defaultAspect = "free",
  confirmedRights,
  onConfirmedRightsChange,
  isSubmitting,
  submitProgress,
  submitError,
  onBack,
  onCancel,
  onConfirm,
  onInsertOriginal,
}: ImageCropPreviewProps) {
  const [rotation, setRotation] = useState<RotationDegrees>(0);
  const [rotatedPreview, setRotatedPreview] = useState<{
    url: string;
    width: number;
    height: number;
  } | null>(null);
  const [rotateError, setRotateError] = useState<string | null>(null);
  const rotatedUrlRef = useRef<string | null>(null);

  const safeInitW = Math.max(1, initialWidth);
  const safeInitH = Math.max(1, initialHeight);

  const naturalRotW =
    rotatedPreview?.width ??
    (rotation === 90 || rotation === 270 ? safeInitH : safeInitW);
  const naturalRotH =
    rotatedPreview?.height ??
    (rotation === 90 || rotation === 270 ? safeInitW : safeInitH);

  const [aspectPreset, setAspectPreset] = useState<AspectPreset>(defaultAspect);
  const [crop, setCrop] = useState<CropRect>(() =>
    computeCenteredCrop(safeInitW, safeInitH, getRatioForPreset(defaultAspect))
  );
  const [maxDimension, setMaxDimension] = useState<number>(2400);
  const [quality, setQuality] = useState<number>(0.85);
  const [altText, setAltText] = useState<string>(initialAlt);
  const [decorative, setDecorative] = useState<boolean>(initialDecorative);

  const stageRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<{
    handle: DragHandle;
    startClientX: number;
    startClientY: number;
    startCrop: CropRect;
    stageRect: DOMRect;
  } | null>(null);

  const revokeRotatedUrl = () => {
    if (rotatedUrlRef.current) {
      URL.revokeObjectURL(rotatedUrlRef.current);
      rotatedUrlRef.current = null;
    }
  };

  const activeAspectRatio = getRatioForPreset(aspectPreset);

  // Derived pixel dimensions
  const cropPxW = Math.max(1, Math.round(crop.width * naturalRotW));
  const cropPxH = Math.max(1, Math.round(crop.height * naturalRotH));
  const outputDims = computeOutputDimensions(
    cropPxW,
    cropPxH,
    maxDimension,
    maxDimension
  );

  const maxSliderCap = Math.min(2400, Math.max(cropPxW, cropPxH));
  const minSliderCap = Math.min(240, maxSliderCap);
  const currentMaxEdge = Math.max(outputDims.width, outputDims.height);

  const isCropped =
    crop.x > 0.004 ||
    crop.y > 0.004 ||
    crop.width < 0.996 ||
    crop.height < 0.996;
  const isResized =
    maxDimension < Math.min(2400, Math.max(cropPxW, cropPxH));
  const hasEdits = rotation !== 0 || isCropped || isResized;

  const handleAspectChange = (preset: AspectPreset) => {
    setAspectPreset(preset);
    const ratio = getRatioForPreset(preset);
    setCrop(computeCenteredCrop(naturalRotW, naturalRotH, ratio));
  };

  const handleRotate = async () => {
    const nextRotation = ((rotation + 90) % 360) as RotationDegrees;
    setRotateError(null);

    if (nextRotation === 0) {
      revokeRotatedUrl();
      setRotation(0);
      setRotatedPreview(null);
      setCrop(
        computeCenteredCrop(
          safeInitW,
          safeInitH,
          getRatioForPreset(aspectPreset)
        )
      );
      return;
    }

    try {
      const next = await renderRotatedPreviewUrl(sourceUrl, nextRotation);
      revokeRotatedUrl();
      rotatedUrlRef.current = next.url;
      setRotation(nextRotation);
      setRotatedPreview(next);
      setCrop(
        computeCenteredCrop(
          next.width,
          next.height,
          getRatioForPreset(aspectPreset)
        )
      );
    } catch (err) {
      setRotateError(
        err instanceof Error
          ? err.message
          : "Rotation preview could not be generated."
      );
    }
  };

  const handleReset = () => {
    revokeRotatedUrl();
    setRotation(0);
    setRotatedPreview(null);
    setRotateError(null);
    setAspectPreset("free");
    setCrop({ ...FULL_CROP });
    setMaxDimension(2400);
    setQuality(0.85);
  };

  const updateCropFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const drag = dragStateRef.current;
      if (!drag) return;

      const { handle, startClientX, startClientY, startCrop, stageRect } = drag;
      if (stageRect.width <= 0 || stageRect.height <= 0) return;

      const rotW = naturalRotW;
      const rotH = naturalRotH;
      const dxPx = ((clientX - startClientX) / stageRect.width) * rotW;
      const dyPx = ((clientY - startClientY) / stageRect.height) * rotH;

      const px = startCrop.x * rotW;
      const py = startCrop.y * rotH;
      const pw = startCrop.width * rotW;
      const ph = startCrop.height * rotH;

      const minPx = Math.min(48, Math.min(rotW, rotH) * 0.15);

      let nx = px;
      let ny = py;
      let nw = pw;
      let nh = ph;

      if (handle === "move") {
        nx = clamp(px + dxPx, 0, rotW - pw);
        ny = clamp(py + dyPx, 0, rotH - ph);
      } else if (activeAspectRatio !== null) {
        // Aspect-locked corner resize anchored to opposite corner
        const ratio = activeAspectRatio;
        if (handle === "se") {
          const ax = px;
          const ay = py;
          const maxW = rotW - ax;
          const maxH = rotH - ay;
          nw = clamp(pw + dxPx, minPx, maxW);
          nh = nw / ratio;
          if (nh > maxH) {
            nh = maxH;
            nw = nh * ratio;
          }
          if (nh < minPx) {
            nh = Math.min(minPx, maxH);
            nw = nh * ratio;
          }
          nx = ax;
          ny = ay;
        } else if (handle === "nw") {
          const ax = px + pw;
          const ay = py + ph;
          const maxW = ax;
          const maxH = ay;
          nw = clamp(pw - dxPx, minPx, maxW);
          nh = nw / ratio;
          if (nh > maxH) {
            nh = maxH;
            nw = nh * ratio;
          }
          if (nh < minPx) {
            nh = Math.min(minPx, maxH);
            nw = nh * ratio;
          }
          nx = ax - nw;
          ny = ay - nh;
        } else if (handle === "ne") {
          const ax = px;
          const ay = py + ph;
          const maxW = rotW - ax;
          const maxH = ay;
          nw = clamp(pw + dxPx, minPx, maxW);
          nh = nw / ratio;
          if (nh > maxH) {
            nh = maxH;
            nw = nh * ratio;
          }
          if (nh < minPx) {
            nh = Math.min(minPx, maxH);
            nw = nh * ratio;
          }
          nx = ax;
          ny = ay - nh;
        } else if (handle === "sw") {
          const ax = px + pw;
          const ay = py;
          const maxW = ax;
          const maxH = rotH - ay;
          nw = clamp(pw - dxPx, minPx, maxW);
          nh = nw / ratio;
          if (nh > maxH) {
            nh = maxH;
            nw = nh * ratio;
          }
          if (nh < minPx) {
            nh = Math.min(minPx, maxH);
            nw = nh * ratio;
          }
          nx = ax - nw;
          ny = ay;
        }
      } else {
        // Free aspect resize
        let left = px;
        let top = py;
        let right = px + pw;
        let bottom = py + ph;

        if (handle.includes("w")) {
          left = clamp(px + dxPx, 0, right - minPx);
        }
        if (handle.includes("e")) {
          right = clamp(px + pw + dxPx, left + minPx, rotW);
        }
        if (handle.includes("n")) {
          top = clamp(py + dyPx, 0, bottom - minPx);
        }
        if (handle.includes("s")) {
          bottom = clamp(py + ph + dyPx, top + minPx, rotH);
        }

        nx = left;
        ny = top;
        nw = right - left;
        nh = bottom - top;
      }

      setCrop({
        x: clamp(nx / rotW, 0, 1),
        y: clamp(ny / rotH, 0, 1),
        width: clamp(nw / rotW, 0.01, 1),
        height: clamp(nh / rotH, 0.01, 1),
      });
    },
    [activeAspectRatio, naturalRotW, naturalRotH]
  );

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!dragStateRef.current) return;
      e.preventDefault();
      updateCropFromPointer(e.clientX, e.clientY);
    };

    const handlePointerUp = () => {
      dragStateRef.current = null;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [updateCropFromPointer]);

  const startDrag = (e: React.PointerEvent, handle: DragHandle) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragStateRef.current = {
      handle,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startCrop: crop,
      stageRect: rect,
    };
  };

  const displayUrl = rotatedPreview?.url ?? sourceUrl;
  const requiresUpload = mode === "upload" || hasEdits;

  const submitLabel =
    mode === "upload"
      ? "Upload & Insert Image"
      : hasEdits
      ? "Apply Crop & Insert"
      : "Insert Image";

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Studio Workspace */}
      <div className="flex-1 min-h-0 overflow-y-auto grid grid-cols-1 lg:grid-cols-12">
        {/* Left: Interactive Crop Stage */}
        <div className="lg:col-span-8 bg-neutral-950/95 p-4 sm:p-6 flex flex-col items-center justify-between gap-4 min-h-[340px]">
          <div className="w-full flex items-center justify-between text-xs text-white/75">
            <span className="truncate max-w-[60%] font-medium" title={fileName}>
              {fileName}
            </span>
            <span className="font-mono text-[11px] text-white/60">
              Original: {initialWidth} × {initialHeight} px
            </span>
          </div>

          <div className="flex-1 w-full flex items-center justify-center overflow-hidden">
            <div
              ref={stageRef}
              className="relative inline-block overflow-hidden rounded-lg select-none touch-none shadow-2xl"
            >
              {/* Native img handles arbitrary blob: URLs & interactive 1:1 natural scaling */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayUrl}
                alt="Crop workspace"
                draggable={false}
                className="block max-w-full max-h-[52vh] w-auto h-auto object-contain pointer-events-none"
              />

              {/* Interactive Crop Frame */}
              <div
                onPointerDown={(e) => startDrag(e, "move")}
                className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] cursor-move"
                style={{
                  left: `${crop.x * 100}%`,
                  top: `${crop.y * 100}%`,
                  width: `${crop.width * 100}%`,
                  height: `${crop.height * 100}%`,
                }}
              >
                {/* Rule of thirds grid */}
                <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
                  <div className="border-r border-b border-white/25" />
                  <div className="border-r border-b border-white/25" />
                  <div className="border-b border-white/25" />
                  <div className="border-r border-b border-white/25" />
                  <div className="border-r border-b border-white/25" />
                  <div className="border-b border-white/25" />
                  <div className="border-r border-white/25" />
                  <div className="border-r border-white/25" />
                  <div />
                </div>

                {/* Corner Handles */}
                {(["nw", "ne", "sw", "se"] as const).map((corner) => {
                  const posClass =
                    corner === "nw"
                      ? "-top-1.5 -left-1.5 cursor-nwse-resize"
                      : corner === "ne"
                      ? "-top-1.5 -right-1.5 cursor-nesw-resize"
                      : corner === "sw"
                      ? "-bottom-1.5 -left-1.5 cursor-nesw-resize"
                      : "-bottom-1.5 -right-1.5 cursor-nwse-resize";
                  return (
                    <button
                      key={corner}
                      type="button"
                      aria-label={`Resize crop ${corner}`}
                      onPointerDown={(e) => startDrag(e, corner)}
                      className={`absolute w-3.5 h-3.5 rounded-full bg-white border-2 border-brand shadow-md ${posClass}`}
                    />
                  );
                })}

                {/* Edge Handles when Free aspect ratio */}
                {activeAspectRatio === null && (
                  <>
                    <button
                      type="button"
                      aria-label="Resize top edge"
                      onPointerDown={(e) => startDrag(e, "n")}
                      className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-2 rounded-full bg-white/90 border border-brand cursor-ns-resize"
                    />
                    <button
                      type="button"
                      aria-label="Resize bottom edge"
                      onPointerDown={(e) => startDrag(e, "s")}
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-2 rounded-full bg-white/90 border border-brand cursor-ns-resize"
                    />
                    <button
                      type="button"
                      aria-label="Resize left edge"
                      onPointerDown={(e) => startDrag(e, "w")}
                      className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-6 rounded-full bg-white/90 border border-brand cursor-ew-resize"
                    />
                    <button
                      type="button"
                      aria-label="Resize right edge"
                      onPointerDown={(e) => startDrag(e, "e")}
                      className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-6 rounded-full bg-white/90 border border-brand cursor-ew-resize"
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Stage Toolbar */}
          <div className="w-full flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRotate}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors disabled:opacity-50"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Rotate 90°</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            <div className="text-[11px] font-mono text-white/75 bg-white/10 px-2.5 py-1 rounded-lg">
              Crop: {cropPxW} × {cropPxH} px
            </div>
          </div>

          {rotateError && (
            <div className="w-full p-2.5 rounded-xl bg-red-500/15 border border-red-400/30 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{rotateError}</span>
            </div>
          )}
        </div>

        {/* Right: Live Preview, Aspect, Size & Metadata */}
        <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-line bg-surface-alt/40 p-4 sm:p-5 space-y-5 overflow-y-auto">
          {/* Live Result Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                Live Preview
              </span>
              <span className="text-[11px] font-mono font-semibold text-brand">
                {outputDims.width} × {outputDims.height} px
              </span>
            </div>
            <div className="rounded-2xl border border-line bg-surface p-3 flex items-center justify-center">
              <div
                className="relative overflow-hidden rounded-xl border border-line bg-white shadow-xs"
                style={{
                  aspectRatio: `${cropPxW} / ${cropPxH}`,
                  width:
                    cropPxW >= cropPxH
                      ? "100%"
                      : `${Math.max(36, Math.round((cropPxW / cropPxH) * 140))}px`,
                  maxHeight: "150px",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={displayUrl}
                  alt="Final crop preview"
                  className="absolute max-w-none max-h-none pointer-events-none"
                  style={{
                    width: `${(1 / crop.width) * 100}%`,
                    height: `${(1 / crop.height) * 100}%`,
                    left: `${-(crop.x / crop.width) * 100}%`,
                    top: `${-(crop.y / crop.height) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Aspect Ratio Presets */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-ink">
              <Crop className="w-3.5 h-3.5 text-brand" />
              <span>Crop Aspect Ratio</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {ASPECT_OPTIONS.map((opt) => {
                const isActive = aspectPreset === opt.id;
                const isRecommended = defaultAspect !== "free" && opt.id === defaultAspect;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleAspectChange(opt.id)}
                    title={opt.hint}
                    className={`px-2 py-1.5 rounded-xl text-[11px] font-semibold border transition-all ${
                      isActive
                        ? "border-brand bg-brand text-white shadow-xs"
                        : isRecommended
                        ? "border-brand/40 bg-brand/5 text-brand hover:bg-brand/10"
                        : "border-line bg-white text-ink-muted hover:text-ink hover:border-brand/40"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            {defaultAspect !== "free" && (
              <p className="text-[11px] text-ink-muted flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-brand shrink-0" />
                <span>
                  Recommended for this placement:{" "}
                  <strong className="text-ink">{defaultAspect}</strong>
                </span>
              </p>
            )}
          </div>

          {/* Output Size Controls */}
          <div className="space-y-2.5 p-3.5 rounded-2xl bg-white border border-line">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                <Maximize2 className="w-3.5 h-3.5 text-brand" />
                <span>Adjust Image Size</span>
              </span>
              <span className="text-[11px] font-mono text-ink-muted">
                Max {currentMaxEdge}px
              </span>
            </div>

            <input
              type="range"
              min={minSliderCap}
              max={maxSliderCap}
              step={10}
              value={Math.min(maxDimension, maxSliderCap)}
              onChange={(e) => setMaxDimension(Number(e.target.value))}
              aria-label="Maximum output edge size in pixels"
              className="w-full accent-brand cursor-pointer"
            />

            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "Full", value: 2400 },
                { label: "1920px", value: 1920 },
                { label: "1200px", value: 1200 },
                { label: "800px", value: 800 },
              ].map((preset) => {
                const clampedVal = Math.min(preset.value, maxSliderCap);
                const selected =
                  preset.value === 2400
                    ? maxDimension >= maxSliderCap
                    : Math.abs(maxDimension - clampedVal) < 10 &&
                      maxDimension < maxSliderCap;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setMaxDimension(preset.value)}
                    disabled={preset.value !== 2400 && maxSliderCap < preset.value}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors disabled:opacity-40 ${
                      selected
                        ? "border-brand bg-brand/10 text-brand"
                        : "border-line bg-surface text-ink-muted hover:text-ink"
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Quality selector */}
            <div className="pt-2 border-t border-line/70 flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium text-ink-muted">
                WebP Quality
              </span>
              <div className="flex items-center gap-1">
                {[
                  { label: "75%", value: 0.75 },
                  { label: "85%", value: 0.85 },
                  { label: "92%", value: 0.92 },
                ].map((q) => (
                  <button
                    key={q.label}
                    type="button"
                    onClick={() => setQuality(q.value)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-colors ${
                      quality === q.value
                        ? "bg-brand text-white"
                        : "bg-surface text-ink-muted hover:text-ink"
                    }`}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Alt Text & Rights (shown when uploading or creating cropped copy) */}
          {requiresUpload && (
            <div className="space-y-2.5 p-3.5 rounded-2xl bg-white border border-line">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-ink">
                  Alt Text
                </label>
                <label className="flex items-center gap-1.5 text-[11px] text-ink-muted cursor-pointer">
                  <input
                    type="checkbox"
                    checked={decorative}
                    onChange={(e) => setDecorative(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-brand accent-brand cursor-pointer"
                  />
                  <span>Decorative</span>
                </label>
              </div>
              {!decorative && (
                <input
                  type="text"
                  maxLength={200}
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Describe this image..."
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-line bg-surface/50 text-ink focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand"
                />
              )}

              <label className="flex items-start gap-2 pt-1 text-[11px] text-ink/80 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={confirmedRights}
                  onChange={(e) => onConfirmedRightsChange(e.target.checked)}
                  className="mt-0.5 w-3.5 h-3.5 rounded text-brand accent-brand cursor-pointer"
                />
                <span>I confirm I have the right to publish this image.</span>
              </label>
            </div>
          )}

          {submitError && (
            <div className="p-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {isSubmitting && (
            <div className="space-y-1.5">
              <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden border border-line">
                <div
                  className="h-full bg-brand transition-all duration-300"
                  style={{ width: `${submitProgress}%` }}
                />
              </div>
              <p className="text-xs text-ink-muted">
                Processing & uploading ({submitProgress}%)...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Preview Footer */}
      <div className="p-4 border-t border-line flex flex-wrap items-center justify-between gap-3 bg-white">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-line bg-white hover:bg-surface text-ink transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{mode === "upload" ? "Choose Different File" : "Back to Library"}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-line bg-white hover:bg-surface text-ink transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          {mode === "library" && hasEdits && onInsertOriginal && (
            <button
              type="button"
              onClick={onInsertOriginal}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-line bg-surface hover:bg-surface-alt text-ink transition-colors disabled:opacity-50"
            >
              Insert Original
            </button>
          )}

          <button
            type="button"
            onClick={() =>
              onConfirm({
                hasEdits,
                crop,
                rotation,
                maxWidth: maxDimension,
                maxHeight: maxDimension,
                quality,
                alt: altText,
                decorative,
              })
            }
            disabled={isSubmitting || (requiresUpload && !confirmedRights)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-brand text-white shadow-xs hover:bg-brand-dark transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            <span>{submitLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
