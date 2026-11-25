"use server";

import { and, asc, inArray, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { galleryContent, type GalleryItem } from "@/data/home";
import { getTransactionDb } from "@/src/db/client";
import { galleryCards, homeImageSlots, media, mediaDeletions, postMedia, posts, postRevisions, postWorkingCopies, videos } from "@/src/db/schema";
import { galleryRevision } from "@/src/server/gallery";
import { requireOwner } from "@/src/server/auth/guard";
import { getClientIp } from "@/src/server/auth/ip";
import { checkRateLimit } from "@/src/server/security/rate-limit";

const cardsSchema = z.array(z.object({
  id: z.string().min(1).max(64), title: z.string().trim().min(1).max(120),
  label: z.string().trim().max(50), mediaId: z.uuid().optional(),
  imageSlot: z.string().optional(),
}));

export async function saveGallery(items: GalleryItem[], expectedRevision: string, deleteRemovedPhotos = false) {
  await requireOwner();
  const limit = await checkRateLimit("owner_mutation", await getClientIp());
  if (!limit.allowed) return { error: "Please wait before saving again." };
  const parsed = cardsSchema.safeParse(items);
  if (!parsed.success) return { error: "Check the title and badge on each card." };
  const cards = parsed.data;
  if (new Set(cards.map(card => card.id)).size !== cards.length ||
      cards.some(card => card.mediaId ? card.imageSlot !== undefined :
        !galleryContent.items.some(original => original.id === card.id && original.imageSlot === card.imageSlot))) {
    return { error: "Select an image for each new card." };
  }
  const client = getTransactionDb(process.env.DATABASE_URL);
  if (!client) return { error: "The database is unavailable." };
  try {
    const result = await client.db.transaction(async tx => {
      await tx.execute(sql`LOCK TABLE gallery_cards IN SHARE ROW EXCLUSIVE MODE`);
      const current = await tx.select().from(galleryCards).orderBy(asc(galleryCards.position));
      if (galleryRevision(current.map(c => ({ ...c, mediaId: c.mediaId ?? undefined, imageSlot: c.imageSlot ?? undefined }))) !== expectedRevision) {
        return { error: "The gallery changed in another session. Reload before saving." };
      }
      const ids = [...new Set(cards.flatMap(c => c.mediaId ? [c.mediaId] : []))];
      if (ids.length) {
        const assets = await tx.select({ id: media.id }).from(media)
          .where(and(inArray(media.id, ids), isNull(media.deletedAt))).for("share");
        if (assets.length !== ids.length) return { error: "An image was removed from the library. Choose a replacement." };
      }
      await tx.delete(galleryCards);
      if (cards.length) await tx.insert(galleryCards).values(cards.map((card, position) => ({ ...card, position })));
      let queued = 0;
      let retained = 0;
      if (deleteRemovedPhotos === true) {
        const kept = new Set(ids);
        const removed = [...new Set(current.flatMap(card =>
          card.mediaId && !kept.has(card.mediaId) ? [card.mediaId] : []))];
        if (removed.length) {
          await tx.execute(sql`LOCK TABLE home_image_slots IN SHARE MODE`);
          const unused = await tx.delete(media).where(and(
            inArray(media.id, removed),
            sql`NOT EXISTS (SELECT 1 FROM ${homeImageSlots} WHERE ${homeImageSlots.mediaId} = ${media.id})`,
            sql`NOT EXISTS (SELECT 1 FROM ${postMedia} WHERE ${postMedia.mediaId} = ${media.id})`,
            sql`NOT EXISTS (SELECT 1 FROM ${posts} WHERE ${posts.coverMediaId} = ${media.id}
                OR ${posts.coverImageUrl} = ${media.secureUrl}
                OR strpos(${posts.content}::text, ${media.id}::text) > 0)`,
            sql`NOT EXISTS (SELECT 1 FROM ${videos} WHERE ${videos.thumbnailMediaId} = ${media.id})`,
            sql`NOT EXISTS (SELECT 1 FROM ${postWorkingCopies} WHERE strpos(${postWorkingCopies.data}::text, ${media.id}::text) > 0)`,
            sql`NOT EXISTS (SELECT 1 FROM ${postRevisions} WHERE strpos(${postRevisions.snapshot}::text, ${media.id}::text) > 0)`,
          )).returning({ publicId: media.publicId });
          if (unused.length) await tx.insert(mediaDeletions).values(unused);
          queued = unused.length;
          retained = removed.length - queued;
        }
      }
      return { revision: galleryRevision(cards), queued, retained };
    });
    if (result.revision) revalidatePath("/");
    return result;
  } finally {
    await client.pool.end();
  }
}
