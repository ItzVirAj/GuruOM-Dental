/**
 * Client-side image pre-processing before server upload.
 * Decodes the image, downscales to a max 2400px longest edge, and encodes to WebP (quality ~0.85).
 */

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

const SUPPORTED_INPUT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

export async function clientResizeImage(
  file: File,
  options: ClientResizeOptions = {}
): Promise<ResizeResult> {
  const maxDimension =
    options.maxDimension ||
    Math.max(options.maxWidth || 2400, options.maxHeight || 2400);
  const { quality = 0.85, onProgress } = options;

  if (onProgress) onProgress(10);

  // Check MIME type prefix first
  if (file.type && !SUPPORTED_INPUT_TYPES.includes(file.type.toLowerCase())) {
    throw new Error(
      "This file type can't be used. Please upload JPG, PNG, WebP or AVIF."
    );
  }

  let sourceWidth = 0;
  let sourceHeight = 0;
  let canvas: HTMLCanvasElement | null = null;
  let ctx: CanvasRenderingContext2D | null = null;

  try {
    if (typeof createImageBitmap === "function") {
      const bitmap = await createImageBitmap(file);
      sourceWidth = bitmap.width;
      sourceHeight = bitmap.height;

      let targetWidth = sourceWidth;
      let targetHeight = sourceHeight;

      if (sourceWidth > maxDimension || sourceHeight > maxDimension) {
        if (sourceWidth >= sourceHeight) {
          targetWidth = maxDimension;
          targetHeight = Math.round((sourceHeight / sourceWidth) * maxDimension);
        } else {
          targetHeight = maxDimension;
          targetWidth = Math.round((sourceWidth / sourceHeight) * maxDimension);
        }
      }

      if (onProgress) onProgress(40);

      canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Unable to initialize canvas rendering context.");
      }

      ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
      bitmap.close();
    } else {
      // Fallback for browsers where createImageBitmap is unavailable
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Image decode failed"));
        img.src = objectUrl;
      });

      URL.revokeObjectURL(objectUrl);

      sourceWidth = img.naturalWidth;
      sourceHeight = img.naturalHeight;

      let targetWidth = sourceWidth;
      let targetHeight = sourceHeight;

      if (sourceWidth > maxDimension || sourceHeight > maxDimension) {
        if (sourceWidth >= sourceHeight) {
          targetWidth = maxDimension;
          targetHeight = Math.round((sourceHeight / sourceWidth) * maxDimension);
        } else {
          targetHeight = maxDimension;
          targetWidth = Math.round((sourceWidth / sourceHeight) * maxDimension);
        }
      }

      if (onProgress) onProgress(40);

      canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Unable to initialize canvas rendering context.");
      }

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
    }

    if (onProgress) onProgress(70);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas!.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error("Canvas WebP export failed"));
        },
        "image/webp",
        quality
      );
    });

    if (onProgress) onProgress(100);

    return {
      blob,
      width: canvas.width,
      height: canvas.height,
    };
  } catch {
    throw new Error(
      "This file type can't be used. Please upload JPG, PNG, WebP or AVIF."
    );
  }
}
