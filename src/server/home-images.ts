import "server-only";
import { cacheTag } from "next/cache";
import { eq, isNull } from "drizzle-orm";
import { getDb } from "@/src/db/client";
import { media, homeImageSlots } from "@/src/db/schema";
import type { HomeImages } from "@/data/home-images";

export const HOME_IMAGES_TAG = "homepage-fixed-images";

export async function loadHomeImages(): Promise<HomeImages> {
  "use cache";
  cacheTag(HOME_IMAGES_TAG);
  const db = getDb();
  if (!db) return {};
  const rows = await db.select({
    slot: homeImageSlots.slot, mediaId: media.id, publicId: media.publicId,
    alt: media.alt, decorative: media.decorative,
  }).from(homeImageSlots).innerJoin(media, eq(homeImageSlots.mediaId, media.id))
    .where(isNull(media.deletedAt));
  return Object.fromEntries(rows.map(row => [row.slot, {
    mediaId: row.mediaId, publicId: row.publicId, alt: row.decorative ? "" : row.alt || null,
  }]));
}
