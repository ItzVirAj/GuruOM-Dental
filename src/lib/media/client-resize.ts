/**
 * Client-side image pre-processing, cropping, rotation, and resizing before server upload.
 * Decodes the image, applies optional crop/rotation/resize, and encodes to WebP.
 */

export interface CropRect {
  /** Normalized 0..1 coordinates relative to the rotated image dimensions */
  x: number;
  y: number;
  width: number;
  height: number;
}

export type RotationDegrees = 0 | 90 | 180 | 270;

export interface ResizeResult {
  blob: Blob;
  width: number;
  height: number;
}

export interface ClientResizeOptions {
  maxDimension?: number;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  onProgress?: (percent: number) => void;
}

export interface CropResizeOptions {
  crop?: CropRect;
  rotation?: RotationDegrees;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  onProgress?: (percent: number) => void;
}

export const FULL_CROP: CropRect = { x: 0, y: 0, width: 1, height: 1 };

const SUPPORTED_INPUT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

/**
 * Computes the largest centered normalized crop rect matching targetRatio (width / height)
 * within rotated pixel dimensions (rotW, rotH).
 */
export function computeCenteredCrop(
  rotW: number,
  rotH: number,
  targetRatio: number | null
): CropRect {
  if (!targetRatio || rotW <= 0 || rotH <= 0) {
    return { ...FULL_CROP };
  }

  const imageRatio = rotW / rotH;
  if (Math.abs(imageRatio - targetRatio) < 0.002) {
    return { ...FULL_CROP };
  }

  if (imageRatio > targetRatio) {
    // Image is wider than target ratio -> crop horizontally
    const normWidth = clamp((targetRatio * rotH) / rotW, 0.05, 1);
    return {
      x: (1 - normWidth) / 2,
      y: 0,
      width: normWidth,
      height: 1,
    };
  }

  // Image is taller than target ratio -> crop vertically
  const normHeight = clamp(rotW / (targetRatio * rotH), 0.05, 1);
  return {
    x: 0,
    y: (1 - normHeight) / 2,
    width: 1,
    height: normHeight,
  };
}

/**
 * Computes final WebP pixel dimensions from cropped source pixels without upscaling
 * and capped at 2400px (matching server Sharp bounds).
 */
export function computeOutputDimensions(
  cropPxW: number,
  cropPxH: number,
  maxWidth = 2400,
  maxHeight = 2400
): { width: number; height: number } {
  const safeW = Math.max(1, cropPxW);
  const safeH = Math.max(1, cropPxH);
  const limitW = clamp(maxWidth, 32, 2400);
  const limitH = clamp(maxHeight, 32, 2400);

  const scale = Math.min(1, limitW / safeW, limitH / safeH);
  return {
    width: Math.max(1, Math.round(safeW * scale)),
    height: Math.max(1, Math.round(safeH * scale)),
  };
}

async function loadImageElement(
  source: File | Blob | string
): Promise<{
  element: HTMLImageElement;
  cleanup: () => void;
}> {
  const element = new Image();
  let objectUrl: string | null = null;

  if (typeof source === "string") {
    element.crossOrigin = "anonymous";
    element.src = source;
  } else {
    objectUrl = URL.createObjectURL(source);
    element.src = objectUrl;
  }

  await new Promise<void>((resolve, reject) => {
    element.onload = () => resolve();
    element.onerror = () =>
      reject(new Error("Could not load image for processing."));
  });

  return {
    element,
    cleanup: () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    },
  };
}

async function exportCanvasToWebP(
  canvas: HTMLCanvasElement,
  quality: number
): Promise<ResizeResult> {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error("Canvas WebP export failed"));
      },
      "image/webp",
      clamp(quality, 0.1, 1)
    );
  });

  return {
    blob,
    width: canvas.width,
    height: canvas.height,
  };
}

/**
 * Generates an object URL for a rotated preview image so crop overlays match 1:1.
 */
export async function renderRotatedPreviewUrl(
  source: File | Blob | string,
  rotation: RotationDegrees
): Promise<{ url: string; width: number; height: number }> {
  const { element, cleanup } = await loadImageElement(source);
  try {
    const natW = element.naturalWidth;
    const natH = element.naturalHeight;
    const isQuarterTurn = rotation === 90 || rotation === 270;
    const rotW = isQuarterTurn ? natH : natW;
    const rotH = isQuarterTurn ? natW : natH;

    // Limit interactive preview canvas to 2400px longest edge for responsiveness
    const scale = Math.min(1, 2400 / Math.max(rotW, rotH));
    const canvasW = Math.max(1, Math.round(rotW * scale));
    const canvasH = Math.max(1, Math.round(rotH * scale));

    const canvas = document.createElement("canvas");
    canvas.width = canvasW;
    canvas.height = canvasH;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Unable to initialize canvas rendering context.");
    }

    ctx.translate(canvasW / 2, canvasH / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(
      element,
      (-natW * scale) / 2,
      (-natH * scale) / 2,
      natW * scale,
      natH * scale
    );

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Preview export failed"))),
        "image/webp",
        0.9
      );
    });

    return {
      url: URL.createObjectURL(blob),
      width: rotW,
      height: rotH,
    };
  } finally {
    cleanup();
  }
}

/**
 * Applies rotation, normalized crop rectangle, max dimensions, and WebP encoding.
 */
export async function clientCropAndResizeImage(
  source: File | Blob | string,
  options: CropResizeOptions = {}
): Promise<ResizeResult> {
  const {
    crop = FULL_CROP,
    rotation = 0,
    maxWidth = 2400,
    maxHeight = 2400,
    quality = 0.85,
    onProgress,
  } = options;

  if (onProgress) onProgress(10);

  if (
    typeof source !== "string" &&
    source.type &&
    !SUPPORTED_INPUT_TYPES.includes(source.type.toLowerCase())
  ) {
    throw new Error(
      "This file type can't be used. Please upload JPG, PNG, WebP or AVIF."
    );
  }

  let cleanupSource = () => {};
  try {
    let drawable: CanvasImageSource;
    let natW: number;
    let natH: number;
    let closeBitmap: (() => void) | null = null;

    if (typeof source !== "string" && typeof createImageBitmap === "function") {
      const bitmap = await createImageBitmap(source);
      drawable = bitmap;
      natW = bitmap.width;
      natH = bitmap.height;
      closeBitmap = () => bitmap.close();
    } else {
      const loaded = await loadImageElement(source);
      drawable = loaded.element;
      natW = loaded.element.naturalWidth;
      natH = loaded.element.naturalHeight;
      cleanupSource = loaded.cleanup;
    }

    if (onProgress) onProgress(40);

    const isQuarterTurn = rotation === 90 || rotation === 270;
    const rotW = isQuarterTurn ? natH : natW;
    const rotH = isQuarterTurn ? natW : natH;

    // Normalize & clamp crop bounds
    const safeX = clamp(crop.x, 0, 0.99);
    const safeY = clamp(crop.y, 0, 0.99);
    const safeW = clamp(crop.width, 0.01, 1 - safeX);
    const safeH = clamp(crop.height, 0.01, 1 - safeY);

    const cropPxX = safeX * rotW;
    const cropPxY = safeY * rotH;
    const cropPxW = Math.max(1, safeW * rotW);
    const cropPxH = Math.max(1, safeH * rotH);

    const { width: outW, height: outH } = computeOutputDimensions(
      cropPxW,
      cropPxH,
      maxWidth,
      maxHeight
    );

    const outCanvas = document.createElement("canvas");
    outCanvas.width = outW;
    outCanvas.height = outH;
    const outCtx = outCanvas.getContext("2d");
    if (!outCtx) {
      throw new Error("Unable to initialize canvas rendering context.");
    }

    if (rotation === 0) {
      outCtx.drawImage(
        drawable,
        cropPxX,
        cropPxY,
        cropPxW,
        cropPxH,
        0,
        0,
        outW,
        outH
      );
    } else {
      const rotCanvas = document.createElement("canvas");
      rotCanvas.width = rotW;
      rotCanvas.height = rotH;
      const rotCtx = rotCanvas.getContext("2d");
      if (!rotCtx) {
        throw new Error("Unable to initialize rotation canvas context.");
      }
      rotCtx.translate(rotW / 2, rotH / 2);
      rotCtx.rotate((rotation * Math.PI) / 180);
      rotCtx.drawImage(drawable, -natW / 2, -natH / 2);

      outCtx.drawImage(
        rotCanvas,
        cropPxX,
        cropPxY,
        cropPxW,
        cropPxH,
        0,
        0,
        outW,
        outH
      );
    }

    if (closeBitmap) closeBitmap();
    cleanupSource();

    if (onProgress) onProgress(70);
    const result = await exportCanvasToWebP(outCanvas, quality);
    if (onProgress) onProgress(100);
    return result;
  } catch (err) {
    cleanupSource();
    if (err instanceof DOMException && err.name === "SecurityError") {
      throw new Error(
        "Cross-origin restriction prevented cropping this remote image. You can still insert the original image or re-upload from your device."
      );
    }
    throw err instanceof Error
      ? err
      : new Error(
          "This file type can't be used. Please upload JPG, PNG, WebP or AVIF."
        );
  }
}

export async function clientResizeImage(
  file: File,
  options: ClientResizeOptions = {}
): Promise<ResizeResult> {
  const maxDimension =
    options.maxDimension ||
    Math.max(options.maxWidth || 2400, options.maxHeight || 2400);

  return clientCropAndResizeImage(file, {
    crop: FULL_CROP,
    rotation: 0,
    maxWidth: maxDimension,
    maxHeight: maxDimension,
    quality: options.quality ?? 0.85,
    onProgress: options.onProgress,
  });
}
