"use client";

import React from "react";
import Image, { type ImageProps } from "next/image";
import cloudinaryLoader from "@/src/lib/media/cloudinary-loader";

export type CloudinaryImageProps = Omit<ImageProps, "loader">;

/**
 * Client component wrapper for Cloudinary images.
 * Can be safely rendered inside React Server Components without violating
 * Next.js RSC function serialization constraints.
 */
export function CloudinaryImage({ alt, ...props }: CloudinaryImageProps) {
  return <Image loader={cloudinaryLoader} alt={alt} {...props} />;
}

export default CloudinaryImage;
