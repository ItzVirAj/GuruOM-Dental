import "server-only";
import { v2 as cloudinary, type UploadApiResponse, type UploadApiOptions } from "cloudinary";
import { getRequiredCloudinaryConfig } from "@/src/lib/env";
import { logger } from "@/src/lib/logger";

let configured = false;

export function initCloudinary() {
  if (configured) return cloudinary;

  try {
    const config = getRequiredCloudinaryConfig();
    cloudinary.config({
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      api_secret: config.apiSecret,
      secure: true,
    });
    configured = true;
  } catch (err) {
    logger.warn("Cloudinary configuration incomplete or not set in environment:", err);
  }

  return cloudinary;
}

/**
 * Uploads a buffer to Cloudinary using upload_stream with timeout.
 */
export async function uploadStreamToCloudinary(
  buffer: Buffer,
  options: UploadApiOptions,
  timeoutMs: number = 20000
): Promise<UploadApiResponse> {
  const cld = initCloudinary();

  return new Promise<UploadApiResponse>((resolve, reject) => {
    let finished = false;

    const timer = setTimeout(() => {
      if (!finished) {
        finished = true;
        reject(new Error("Cloudinary upload timed out after 20 seconds"));
      }
    }, timeoutMs);

    const stream = cld.uploader.upload_stream(options, (error, result) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);

      if (error || !result) {
        reject(error || new Error("Cloudinary upload failed with empty result"));
      } else {
        resolve(result);
      }
    });

    stream.end(buffer);
  });
}

/**
 * Destroys a Cloudinary asset by public ID.
 */
export async function destroyCloudinaryAsset(publicId: string): Promise<boolean> {
  const cld = initCloudinary();
  try {
    const res = await cld.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true,
    });
    return res.result === "ok" || res.result === "not found";
  } catch (err) {
    logger.error("Failed to destroy Cloudinary asset:", {
      publicId,
      error: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}

/**
 * Lists resources in a specific Cloudinary folder with pagination.
 */
export async function listCloudinaryFolderResources(
  folder: string,
  nextCursor?: string
): Promise<{
  resources: Array<{
    public_id: string;
    bytes: number;
    created_at: string;
    format: string;
    secure_url: string;
    width: number;
    height: number;
  }>;
  next_cursor?: string;
}> {
  const cld = initCloudinary();
  const prefix = folder ? (folder.endsWith("/") ? folder : `${folder}/`) : undefined;

  const result = await cld.api.resources({
    type: "upload",
    prefix,
    max_results: 500,
    next_cursor: nextCursor,
  });

  return {
    resources: result.resources || [],
    next_cursor: result.next_cursor,
  };
}

