import { requireOwner } from "@/src/server/auth/guard";
import { getDb } from "@/src/db/client";
import { categories } from "@/src/db/schema";
import { asc } from "drizzle-orm";
import { ownerHref } from "@/src/lib/owner-url";
import { NewVideoClient } from "./new-video-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Video | Owner Portal",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default async function NewVideoPage() {
  await requireOwner();
  const db = getDb();
  const categoryRows = db
    ? await db
        .select({ slug: categories.slug, label: categories.label })
        .from(categories)
        .orderBy(asc(categories.sortOrder))
    : [];

  return (
    <NewVideoClient
      categories={categoryRows}
      baseOwnerPath={ownerHref("")}
    />
  );
}
