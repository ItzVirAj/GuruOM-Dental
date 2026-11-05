import { Suspense } from "react";
import { requireOwner } from "@/src/server/auth/guard";
import { getDb } from "@/src/db/client";
import { categories, posts } from "@/src/db/schema";
import { sql, eq } from "drizzle-orm";
import { OwnerHeader } from "../owner-header";
import { CategoriesView } from "./categories-view";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Categories Management | Owner Portal",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

async function CategoriesContent() {
  const { user: owner } = await requireOwner();

  const db = getDb();
  if (!db) {
    throw new Error("Database offline.");
  }

  // Fetch categories with post count
  const categoryRows = await db
    .select({
      slug: categories.slug,
      label: categories.label,
      sortOrder: categories.sortOrder,
      postCount: sql<number>`count(${posts.id})::int`,
    })
    .from(categories)
    .leftJoin(posts, eq(posts.categorySlug, categories.slug))
    .groupBy(categories.slug, categories.label, categories.sortOrder)
    .orderBy(categories.sortOrder);

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <OwnerHeader ownerEmail={owner.email} />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <CategoriesView initialCategories={categoryRows} />
      </main>
    </div>
  );
}

export default function OwnerCategoriesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-brand animate-spin" />
        </div>
      }
    >
      <CategoriesContent />
    </Suspense>
  );
}
