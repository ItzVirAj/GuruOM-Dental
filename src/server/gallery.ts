import "server-only";
import { createHash } from "node:crypto";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/src/db/client";
import { galleryCards, media } from "@/src/db/schema";
import { galleryContent, type GalleryItem } from "@/data/home";

export function galleryRevision(items: GalleryItem[]) {
  const values = items.map(({ id, title, label, mediaId, imageSlot }) =>
    [id, title, label, mediaId ?? null, imageSlot ?? null]);
  return createHash("sha256").update(JSON.stringify(values)).digest("hex");
}

export async function loadGallery() {
  const db = getDb();
  let items = galleryContent.items;
  if (db) {
    const rows = await db.select({
      id: galleryCards.id, title: galleryCards.title, label: galleryCards.label,
      imageSlot: galleryCards.imageSlot, mediaId: galleryCards.mediaId,
      publicId: media.publicId, alt: media.alt, decorative: media.decorative,
    }).from(galleryCards).leftJoin(media, eq(media.id, galleryCards.mediaId))
      .orderBy(asc(galleryCards.position));
    items = rows.map(row => ({
      id: row.id, title: row.title, label: row.label,
      imageSlot: row.imageSlot ?? undefined, mediaId: row.mediaId ?? undefined,
      publicId: row.publicId ?? undefined, alt: row.decorative ? "" : row.alt ?? undefined,
    }));
  }
  return { items, revision: galleryRevision(items) };
}
