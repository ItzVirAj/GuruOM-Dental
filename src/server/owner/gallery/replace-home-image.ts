"use server";

import { and, eq, isNull, sql } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { homeImageGroups } from "@/data/home-images";
import { getTransactionDb } from "@/src/db/client";
import { homeImageSlots, media } from "@/src/db/schema";
import { requireOwner } from "@/src/server/auth/guard";
import { getClientIp } from "@/src/server/auth/ip";
import { checkRateLimit } from "@/src/server/security/rate-limit";
import { HOME_IMAGES_TAG } from "@/src/server/home-images";

export async function replaceHomeImage(slot: string, mediaId: string, previous: string | null) {
  await requireOwner();
  if (!homeImageGroups.some(group => group.slots.some(item => item.id === slot)) ||
      !z.uuid().safeParse(mediaId).success) return { error: "Choose a valid homepage image." };
  const limit = await checkRateLimit("owner_mutation", await getClientIp());
  if (!limit.allowed) return { error: "Please wait before publishing again." };
  const client = getTransactionDb(process.env.DATABASE_URL);
  if (!client) return { error: "The database is unavailable." };
  try {
    const result = await client.db.transaction(async tx => {
      await tx.execute(sql`LOCK TABLE home_image_slots IN SHARE ROW EXCLUSIVE MODE`);
      const [current] = await tx.select().from(homeImageSlots).where(eq(homeImageSlots.slot, slot));
      if ((current?.mediaId ?? null) !== previous && current?.mediaId !== mediaId)
        return { error: "This image changed in another session. Reload to see it." };
      const [asset] = await tx.select({ id: media.id }).from(media)
        .where(and(eq(media.id, mediaId), isNull(media.deletedAt))).for("share");
      if (!asset) return { error: "This photo is no longer available. Choose another." };
      await tx.insert(homeImageSlots).values({ slot, mediaId })
        .onConflictDoUpdate({ target: homeImageSlots.slot, set: { mediaId } });
      return { error: null };
    });
    if (!result.error) {
      updateTag(HOME_IMAGES_TAG);
      revalidatePath("/");
    }
    return result;
  } finally {
    await client.pool.end();
  }
}
