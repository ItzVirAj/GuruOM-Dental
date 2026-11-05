import "server-only";

import { getDb } from "@/src/db/client";
import {
  posts,
  categories,
  tags,
  postTags,
  postWorkingCopies,
  postRevisions,
  media,
} from "@/src/db/schema";
import { eq, and, sql, desc, asc, isNull, isNotNull, ilike, or, gt, lte } from "drizzle-orm";
import { formatUtcToIst, formatRelativeTime } from "./timezone";

export type PostTab = "all" | "published" | "scheduled" | "draft" | "archived" | "trash";
export type PostSortField = "updated" | "published" | "title";

export interface OwnerPostItem {
  id: string;
  slug: string;
  title: string;
  status: string;
  effectiveStatus: "published" | "scheduled" | "draft" | "archived" | "trash";
  categorySlug: string;
  categoryLabel: string;
  publishAt: string | null;
  publishAtIst: string;
  relativePublishDate: string;
  updatedAt: string;
  updatedAtIst: string;
  authorName: string;
  authorRole: string;
  featured: boolean;
  version: number;
  deletedAt: string | null;
}

export interface OwnerPostsListResult {
  posts: OwnerPostItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  counts: {
    all: number;
    published: number;
    scheduled: number;
    draft: number;
    archived: number;
    trash: number;
  };
  categories: { slug: string; label: string }[];
}

export async function getOwnerPostsList(options: {
  tab?: PostTab;
  search?: string;
  category?: string;
  sort?: PostSortField;
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}): Promise<OwnerPostsListResult> {
  const db = getDb();
  if (!db) {
    throw new Error("Database unconfigured.");
  }

  const tab = options.tab || "all";
  const search = options.search?.trim();
  const category = options.category?.trim();
  const sort = options.sort || "updated";
  const order = options.order || "desc";
  const page = Math.max(1, options.page || 1);
  const limit = Math.max(1, Math.min(100, options.limit || 20));
  const offset = (page - 1) * limit;

  const now = new Date();

  // 1. Fetch Tab Counts
  const countsSql = await db.execute(sql`
    SELECT
      COUNT(*) FILTER (WHERE deleted_at IS NULL) as all_count,
      COUNT(*) FILTER (WHERE deleted_at IS NULL AND (status = 'published' OR (status = 'scheduled' AND publish_at <= ${now}))) as published_count,
      COUNT(*) FILTER (WHERE deleted_at IS NULL AND status = 'scheduled' AND publish_at > ${now}) as scheduled_count,
      COUNT(*) FILTER (WHERE deleted_at IS NULL AND status = 'draft') as draft_count,
      COUNT(*) FILTER (WHERE deleted_at IS NULL AND status = 'archived') as archived_count,
      COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) as trash_count
    FROM posts
  `);

  const countRow = countsSql.rows[0] as Record<string, unknown> | undefined;
  const counts = {
    all: Number(countRow?.all_count ?? 0),
    published: Number(countRow?.published_count ?? 0),
    scheduled: Number(countRow?.scheduled_count ?? 0),
    draft: Number(countRow?.draft_count ?? 0),
    archived: Number(countRow?.archived_count ?? 0),
    trash: Number(countRow?.trash_count ?? 0),
  };

  // 2. Build Tab Conditions
  const conditions = [];

  if (tab === "trash") {
    conditions.push(isNotNull(posts.deletedAt));
  } else {
    conditions.push(isNull(posts.deletedAt));

    if (tab === "published") {
      conditions.push(
        or(
          eq(posts.status, "published"),
          and(eq(posts.status, "scheduled"), lte(posts.publishAt, now))
        )
      );
    } else if (tab === "scheduled") {
      conditions.push(and(eq(posts.status, "scheduled"), gt(posts.publishAt, now)));
    } else if (tab === "draft") {
      conditions.push(eq(posts.status, "draft"));
    } else if (tab === "archived") {
      conditions.push(eq(posts.status, "archived"));
    }
  }

  // 3. Search Condition
  if (search) {
    const escaped = search.replace(/[%_\\]/g, "\\$&");
    conditions.push(ilike(posts.title, `%${escaped}%`));
  }

  // 4. Category Filter
  if (category) {
    conditions.push(eq(posts.categorySlug, category));
  }

  const whereClause = and(...conditions);

  // 5. Total matching rows
  const [totalRes] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(posts)
    .where(whereClause);
  const total = totalRes?.count ?? 0;
  const totalPages = Math.ceil(total / limit) || 1;

  // 6. Sorting
  let orderColumn;
  if (sort === "published") {
    orderColumn = order === "asc" ? asc(posts.publishAt) : desc(posts.publishAt);
  } else if (sort === "title") {
    orderColumn = order === "asc" ? asc(posts.title) : desc(posts.title);
  } else {
    orderColumn = order === "asc" ? asc(posts.updatedAt) : desc(posts.updatedAt);
  }

  // 7. Query matching rows with categories
  const rows = await db
    .select({
      id: posts.id,
      slug: posts.slug,
      title: posts.title,
      status: posts.status,
      categorySlug: posts.categorySlug,
      categoryLabel: categories.label,
      publishAt: posts.publishAt,
      updatedAt: posts.updatedAt,
      authorName: posts.authorName,
      authorRole: posts.authorRole,
      featured: posts.featured,
      version: posts.version,
      deletedAt: posts.deletedAt,
    })
    .from(posts)
    .leftJoin(categories, eq(posts.categorySlug, categories.slug))
    .where(whereClause)
    .orderBy(orderColumn)
    .limit(limit)
    .offset(offset);

  const mappedPosts: OwnerPostItem[] = rows.map((r) => {
    // Determine effective status
    let effectiveStatus: OwnerPostItem["effectiveStatus"] = r.status as OwnerPostItem["effectiveStatus"];
    if (r.deletedAt) {
      effectiveStatus = "trash";
    } else if (r.status === "scheduled") {
      if (r.publishAt && r.publishAt <= now) {
        effectiveStatus = "published";
      } else {
        effectiveStatus = "scheduled";
      }
    }

    const publishAtIst = r.publishAt ? formatUtcToIst(r.publishAt) : "—";
    const relativePublishDate = r.publishAt ? formatRelativeTime(r.publishAt, now) : "";
    const updatedAtIst = r.updatedAt ? formatUtcToIst(r.updatedAt) : "—";

    return {
      id: r.id,
      slug: r.slug,
      title: r.title,
      status: r.status,
      effectiveStatus,
      categorySlug: r.categorySlug,
      categoryLabel: r.categoryLabel || r.categorySlug,
      publishAt: r.publishAt ? r.publishAt.toISOString() : null,
      publishAtIst,
      relativePublishDate,
      updatedAt: r.updatedAt ? r.updatedAt.toISOString() : new Date().toISOString(),
      updatedAtIst,
      authorName: r.authorName,
      authorRole: r.authorRole,
      featured: r.featured,
      version: r.version,
      deletedAt: r.deletedAt ? r.deletedAt.toISOString() : null,
    };
  });

  // Fetch all categories for filter dropdown
  const allCategories = await db
    .select({
      slug: categories.slug,
      label: categories.label,
    })
    .from(categories)
    .orderBy(categories.sortOrder);

  return {
    posts: mappedPosts,
    total,
    page,
    limit,
    totalPages,
    counts,
    categories: allCategories,
  };
}

export async function getOwnerPostForEditing(id: string) {
  const db = getDb();
  if (!db) throw new Error("Database unconfigured.");

  // 1. Fetch post
  const [postRow] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1);

  if (!postRow) return null;

  // 2. Fetch tags
  const tagRows = await db
    .select({ label: tags.label })
    .from(postTags)
    .innerJoin(tags, eq(postTags.tagSlug, tags.slug))
    .where(eq(postTags.postId, id));
  const postTagNames = tagRows.map((t) => t.label);

  // 3. Fetch working copy
  const [workingCopyRow] = await db
    .select()
    .from(postWorkingCopies)
    .where(eq(postWorkingCopies.postId, id))
    .limit(1);

  // 4. Fetch revisions
  const revisionRows = await db
    .select({
      id: postRevisions.id,
      createdAt: postRevisions.createdAt,
      action: postRevisions.action,
      reason: postRevisions.reason,
      wordCount: postRevisions.wordCount,
      snapshot: postRevisions.snapshot,
    })
    .from(postRevisions)
    .where(eq(postRevisions.postId, id))
    .orderBy(desc(postRevisions.createdAt))
    .limit(50);

  // 5. Fetch all categories
  const allCategories = await db
    .select({
      slug: categories.slug,
      label: categories.label,
    })
    .from(categories)
    .orderBy(categories.sortOrder);

  return {
    post: {
      id: postRow.id,
      slug: postRow.slug,
      title: postRow.title,
      excerpt: postRow.excerpt,
      content: postRow.content,
      categorySlug: postRow.categorySlug,
      authorName: postRow.authorName,
      authorRole: postRow.authorRole,
      reviewedByDoctorSlug: postRow.reviewedByDoctorSlug,
      relatedServiceSlug: postRow.relatedServiceSlug,
      seoTitle: postRow.seoTitle,
      seoDescription: postRow.seoDescription,
      featured: postRow.featured,
      status: postRow.status,
      publishAt: postRow.publishAt ? postRow.publishAt.toISOString() : null,
      lastPublishedAt: postRow.lastPublishedAt ? postRow.lastPublishedAt.toISOString() : null,
      version: postRow.version,
      updatedAt: postRow.updatedAt.toISOString(),
      tags: postTagNames,
      coverSlot: postRow.coverSlot,
      coverMediaId: postRow.coverMediaId,
      coverAltOverride: postRow.coverAltOverride,
    },
    workingCopy: workingCopyRow
      ? {
        data: (workingCopyRow.data || {}) as Record<string, unknown>,
        baseVersion: workingCopyRow.baseVersion,
        updatedAt: workingCopyRow.updatedAt.toISOString(),
        updatedAtIst: formatUtcToIst(workingCopyRow.updatedAt),
      }
      : null,
    coverMedia: postRow.coverMediaId
      ? (
        await db
          .select({
            id: media.id,
            publicId: media.publicId,
            width: media.width,
            height: media.height,
            alt: media.alt,
            decorative: media.decorative,
            blurDataUrl: media.blurDataUrl,
            displayName: media.displayName,
          })
          .from(media)
          .where(eq(media.id, postRow.coverMediaId))
          .limit(1)
      )[0] || null
      : null,
    revisions: revisionRows.map((r) => ({
      id: r.id,
      createdAt: r.createdAt.toISOString(),
      createdAtIst: formatUtcToIst(r.createdAt),
      action: r.action,
      reason: r.reason || "Manual commit",
      wordCount: r.wordCount,
      snapshot: (r.snapshot || {}) as Record<string, unknown>,
    })),
    categories: allCategories,
  };
}

