"use server";

import "server-only";
import crypto from "node:crypto";
import { headers } from "next/headers";
import { getDb } from "@/src/db/client";
import {
  posts,
  categories,
  tags,
  postTags,
  postRevisions,
  postWorkingCopies,
  postSlugHistory,
  postMedia,
  postVideos,
} from "@/src/db/schema";
import { eq, sql } from "drizzle-orm";
import { withOwner } from "@/src/server/auth/guard";
import { getClientIp } from "@/src/server/auth/ip";
import { checkRateLimit } from "@/src/server/security/rate-limit";
import { audit } from "@/src/server/security/audit";
import { revalidateBlog } from "@/src/server/blog/revalidate";
import {
  ContentBlock,
  blogContentArraySchema,
  calculateReadingTimeMinutes,
  normalizeText,
} from "@/src/lib/blog-content";
import { assertValidTransition, PostStatus } from "./transitions";
import { validateScheduleDate } from "./timezone";
import { generateSlug, isValidSlugFormat, isSlugReserved } from "./slug";
import {
  PostEditorData,
  validatePostForPublishing,
} from "./validation";
export type { PostEditorData };

async function enforceRateLimit(bucket: "owner_mutation" | "owner_autosave") {
  const ip = await getClientIp();
  const res = await checkRateLimit(bucket, ip);
  if (!res.allowed) {
    throw new Error(
      `Rate limit exceeded. Please wait ${res.retryAfterSeconds} seconds before retrying.`
    );
  }
}

async function getRequestMetadata() {
  const reqHeaders = await headers();
  const ip = await getClientIp();
  const userAgent = reqHeaders.get("user-agent") || undefined;
  return { ip, userAgent };
}

/**
 * Creates a new blank "Untitled" draft post.
 */
export async function createPostAction(): Promise<{ id: string; slug: string }> {
  return withOwner(async ({ user: owner }) => {
    await enforceRateLimit("owner_mutation");
    const { ip, userAgent } = await getRequestMetadata();
    const db = getDb();
    if (!db) throw new Error("Database offline.");

    // Fetch default category
    const allCategories = await db
      .select()
      .from(categories)
      .orderBy(categories.sortOrder)
      .limit(1);

    if (allCategories.length === 0) {
      throw new Error("No categories found. Please create at least one category first.");
    }

    const defaultCategory = allCategories[0].slug;
    const randomSuffix = crypto.randomBytes(3).toString("hex");
    const uniqueSlug = `untitled-${randomSuffix}`;

    const defaultContent: ContentBlock[] = [
      {
        type: "paragraph",
        runs: [{ text: "Start writing your article here..." }],
      },
    ];

    const [newPost] = await db
      .insert(posts)
      .values({
        title: "Untitled Draft",
        slug: uniqueSlug,
        excerpt: "Brief summary of the article.",
        content: defaultContent,
        categorySlug: defaultCategory,
        status: "draft",
        authorName: owner.name || "Clinic Editorial Team",
        authorRole: "Dental Specialist",
        readingTimeMinutes: 1,
        contentSchemaVersion: 2,
        version: 1,
      })
      .returning({ id: posts.id, slug: posts.slug });

    await audit({
      actorUserId: owner.id,
      action: "post_created",
      entityType: "post",
      entityId: newPost.id,
      summary: `Created new draft post (${uniqueSlug})`,
      diff: { slug: uniqueSlug, category: defaultCategory },
      ip,
      userAgent,
    });

    await revalidateBlog();

    return { id: newPost.id, slug: newPost.slug };
  });
}

/**
 * Autosaves the working copy of a post without touching live columns.
 */
export async function autosaveWorkingCopyAction(
  id: string,
  data: PostEditorData,
  baseVersion: number
): Promise<{ success: boolean; updatedAt: string }> {
  return withOwner(async () => {
    await enforceRateLimit("owner_autosave");
    const db = getDb();
    if (!db) throw new Error("Database offline.");

    // Validate structured blocks
    const contentToValidate =
      Array.isArray(data.content) && data.content.length > 0
        ? data.content
        : [{ type: "paragraph", runs: [{ text: " " }] }];
    const parsed = blogContentArraySchema.safeParse(contentToValidate);
    const validatedContent = parsed.success
      ? parsed.data
      : [{ type: "paragraph", runs: [{ text: " " }] }];

    const payload = {
      title: normalizeText(data.title || ""),
      excerpt: normalizeText(data.excerpt || ""),
      content: validatedContent,
      categorySlug: data.categorySlug,
      authorName: normalizeText(data.authorName || ""),
      authorRole: normalizeText(data.authorRole || ""),
      reviewedByDoctorSlug: data.reviewedByDoctorSlug || null,
      relatedServiceSlug: data.relatedServiceSlug || null,
      seoTitle: data.seoTitle ? normalizeText(data.seoTitle) : null,
      seoDescription: data.seoDescription ? normalizeText(data.seoDescription) : null,
      featured: Boolean(data.featured),
      slug: data.slug || "",
      tags: (data.tags || []).slice(0, 8).map((t) => normalizeText(t).slice(0, 30)),
      coverSlot: data.coverSlot || null,
      coverMediaId: data.coverMediaId || null,
      coverAltOverride: data.coverAltOverride ? normalizeText(data.coverAltOverride).slice(0, 200) : null,
    };

    const now = new Date();

    await db
      .insert(postWorkingCopies)
      .values({
        postId: id,
        data: payload,
        baseVersion,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: postWorkingCopies.postId,
        set: {
          data: payload,
          baseVersion,
          updatedAt: now,
        },
      });

    return { success: true, updatedAt: now.toISOString() };
  });
}

/**
 * Commits post data into the live row, increments version, creates a revision,
 * and clears the working copy. Detects version conflicts.
 */
export async function savePostAction(
  id: string,
  data: PostEditorData,
  expectedVersion: number
): Promise<{ success: boolean; version: number }> {
  return withOwner(async ({ user: owner }) => {
    await enforceRateLimit("owner_mutation");
    const { ip, userAgent } = await getRequestMetadata();
    const db = getDb();
    if (!db) throw new Error("Database offline.");

    const existingRows = await db
      .select()
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);

    if (existingRows.length === 0) {
      throw new Error("Post not found.");
    }

    const currentPost = existingRows[0];

    // Optimistic locking conflict check
    if (currentPost.version !== expectedVersion) {
      throw new Error(
        `CONFLICT: This post has been modified elsewhere (current version ${currentPost.version}, your version ${expectedVersion}). Please reload the latest changes or save as a draft copy.`
      );
    }

    // Normalize and validate content
    const contentToValidate =
      Array.isArray(data.content) && data.content.length > 0
        ? data.content
        : [{ type: "paragraph", runs: [{ text: " " }] }];
    const parsed = blogContentArraySchema.safeParse(contentToValidate);
    if (!parsed.success) {
      const issue = parsed.error.issues[0]?.message || "Invalid post content";
      throw new Error(`Content validation error: ${issue}`);
    }
    const validatedContent = parsed.data;
    const readingTime = calculateReadingTimeMinutes(validatedContent);

    // Validate title & excerpt lengths
    const cleanTitle = normalizeText(data.title || "Untitled Draft").slice(0, 160);
    const cleanExcerpt = normalizeText(data.excerpt || "").slice(0, 320);

    // Slug check and update
    let targetSlug = data.slug ? generateSlug(data.slug) : currentPost.slug;
    if (!isValidSlugFormat(targetSlug)) {
      targetSlug = generateSlug(cleanTitle);
    }
    if (!isValidSlugFormat(targetSlug) || isSlugReserved(targetSlug)) {
      throw new Error(`The slug "${targetSlug}" is invalid or reserved.`);
    }

    // Handle slug change on published post
    if (targetSlug !== currentPost.slug) {
      // Check if target slug already taken
      const slugClash = await db
        .select()
        .from(posts)
        .where(eq(posts.slug, targetSlug))
        .limit(1);

      if (slugClash.length > 0 && slugClash[0].id !== id) {
        throw new Error(`The slug "${targetSlug}" is already in use by another post.`);
      }

      // If the post was ever published, preserve old slug in history for 308 redirect
      if (currentPost.lastPublishedAt) {
        await db
          .insert(postSlugHistory)
          .values({
            oldSlug: currentPost.slug,
            postId: id,
          })
          .onConflictDoNothing();
      }
    }

    // Handle featured exclusivity
    if (data.featured) {
      await db
        .update(posts)
        .set({ featured: false })
        .where(eq(posts.featured, true));
    }

    const newVersion = currentPost.version + 1;
    const now = new Date();

    // 1. Update the posts record
    await db
      .update(posts)
      .set({
        title: cleanTitle,
        slug: targetSlug,
        excerpt: cleanExcerpt,
        content: validatedContent,
        categorySlug: data.categorySlug || currentPost.categorySlug,
        authorName: normalizeText(data.authorName || currentPost.authorName),
        authorRole: normalizeText(data.authorRole || currentPost.authorRole),
        reviewedByDoctorSlug: data.reviewedByDoctorSlug || null,
        relatedServiceSlug: data.relatedServiceSlug || null,
        seoTitle: data.seoTitle ? normalizeText(data.seoTitle).slice(0, 100) : null,
        seoDescription: data.seoDescription
          ? normalizeText(data.seoDescription).slice(0, 200)
          : null,
        featured: Boolean(data.featured),
        readingTimeMinutes: readingTime,
        coverSlot: data.coverSlot || null,
        coverMediaId: data.coverMediaId || null,
        coverAltOverride: data.coverAltOverride
          ? normalizeText(data.coverAltOverride).slice(0, 200)
          : null,
        version: newVersion,
        contentSchemaVersion: 4,
        updatedAt: now,
      })
      .where(eq(posts.id, id));

    // 1b. Maintain post_media tracking (cover and inline images)
    await db.delete(postMedia).where(eq(postMedia.postId, id));
    const mediaEntriesToInsert: Array<{
      postId: string;
      mediaId: string;
      role: "cover" | "inline";
    }> = [];

    if (data.coverMediaId) {
      mediaEntriesToInsert.push({
        postId: id,
        mediaId: data.coverMediaId,
        role: "cover",
      });
    }

    const inlineMediaIds = new Set<string>();
    for (const block of validatedContent) {
      if (block.type === "image" && "mediaId" in block && block.mediaId) {
        inlineMediaIds.add(block.mediaId);
      }
    }

    for (const mId of inlineMediaIds) {
      mediaEntriesToInsert.push({
        postId: id,
        mediaId: mId,
        role: "inline",
      });
    }

    if (mediaEntriesToInsert.length > 0) {
      await db.insert(postMedia).values(mediaEntriesToInsert).onConflictDoNothing();
    }

    // 1c. Maintain post_videos tracking by scanning validatedContent
    await db.delete(postVideos).where(eq(postVideos.postId, id));
    const videoIdsToInsert = new Set<string>();
    for (const block of validatedContent) {
      if (block.type === "youtube" && block.videoId) {
        videoIdsToInsert.add(block.videoId);
      }
    }

    if (videoIdsToInsert.size > 0) {
      await db
        .insert(postVideos)
        .values(
          Array.from(videoIdsToInsert).map((vId) => ({
            postId: id,
            videoId: vId,
          }))
        )
        .onConflictDoNothing();
    }

    // 2. Manage tags
    if (data.tags) {
      const cleanTags = data.tags.slice(0, 8).map((t) => normalizeText(t).slice(0, 30));
      // Delete existing post tags
      await db.delete(postTags).where(eq(postTags.postId, id));

      for (const t of cleanTags) {
        const tagSlug = generateSlug(t);
        if (tagSlug) {
          await db
            .insert(tags)
            .values({ slug: tagSlug, label: t })
            .onConflictDoNothing();

          await db
            .insert(postTags)
            .values({ postId: id, tagSlug })
            .onConflictDoNothing();
        }
      }
    }

    // 3. Create revision snapshot
    const totalWords = calculateReadingTimeMinutes(validatedContent) * 200;
    await db.insert(postRevisions).values({
      postId: id,
      snapshot: {
        title: cleanTitle,
        slug: targetSlug,
        excerpt: cleanExcerpt,
        content: validatedContent,
        categorySlug: data.categorySlug,
        version: newVersion,
      },
      reason: `Saved version ${newVersion}`,
      action: "save",
      wordCount: totalWords,
    });

    // 4. Clear working copy now that live row is committed
    await db.delete(postWorkingCopies).where(eq(postWorkingCopies.postId, id));

    // 5. Audit mutation
    await audit({
      actorUserId: owner.id,
      action: "post_saved",
      entityType: "post",
      entityId: id,
      summary: `Saved post "${cleanTitle}" (v${newVersion})`,
      diff: {
        changedFields: [
          "title",
          "slug",
          "excerpt",
          "content",
          "categorySlug",
          "tags",
        ],
        version: newVersion,
      },
      ip,
      userAgent,
    });

    await revalidateBlog(targetSlug);

    return { success: true, version: newVersion };
  });
}

/**
 * Publishes a draft or scheduled post immediately.
 */
export async function publishNowAction(id: string): Promise<{ success: boolean }> {
  return withOwner(async ({ user: owner }) => {
    await enforceRateLimit("owner_mutation");
    const { ip, userAgent } = await getRequestMetadata();
    const db = getDb();
    if (!db) throw new Error("Database offline.");

    const rows = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    if (rows.length === 0) throw new Error("Post not found.");
    const post = rows[0];

    assertValidTransition(post.status as PostStatus, "published");

    // Enforce publication completeness requirements
    const validation = validatePostForPublishing({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      categorySlug: post.categorySlug,
      slug: post.slug,
    });

    if (!validation.valid) {
      throw new Error(`Cannot publish: ${validation.errors.join("; ")}`);
    }

    const now = new Date();
    const newVersion = post.version + 1;

    await db
      .update(posts)
      .set({
        status: "published",
        publishAt: now,
        lastPublishedAt: now,
        version: newVersion,
        updatedAt: now,
      })
      .where(eq(posts.id, id));

    await db.insert(postRevisions).values({
      postId: id,
      snapshot: { status: "published", publishAt: now },
      reason: "Published live",
      action: "publish",
      wordCount: post.readingTimeMinutes * 200,
    });

    await db.delete(postWorkingCopies).where(eq(postWorkingCopies.postId, id));

    await audit({
      actorUserId: owner.id,
      action: "post_published",
      entityType: "post",
      entityId: id,
      summary: `Published post "${post.title}" live`,
      diff: { status: "published", version: newVersion },
      ip,
      userAgent,
    });

    await revalidateBlog(post.slug);

    return { success: true };
  });
}

/**
 * Schedules a post for future publication.
 */
export async function schedulePostAction(
  id: string,
  publishAtISO: string
): Promise<{ success: boolean; publishAt: string }> {
  return withOwner(async ({ user: owner }) => {
    await enforceRateLimit("owner_mutation");
    const { ip, userAgent } = await getRequestMetadata();
    const db = getDb();
    if (!db) throw new Error("Database offline.");

    const rows = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    if (rows.length === 0) throw new Error("Post not found.");
    const post = rows[0];

    assertValidTransition(post.status as PostStatus, "scheduled");

    const validation = validatePostForPublishing({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      categorySlug: post.categorySlug,
      slug: post.slug,
    });

    if (!validation.valid) {
      throw new Error(`Cannot schedule: ${validation.errors.join("; ")}`);
    }

    const scheduleDate = new Date(publishAtISO);
    const scheduleValidation = validateScheduleDate(scheduleDate);
    if (!scheduleValidation.valid) {
      throw new Error(scheduleValidation.error || "Invalid schedule date.");
    }

    const now = new Date();
    const newVersion = post.version + 1;

    await db
      .update(posts)
      .set({
        status: "scheduled",
        publishAt: scheduleDate,
        version: newVersion,
        updatedAt: now,
      })
      .where(eq(posts.id, id));

    await db.insert(postRevisions).values({
      postId: id,
      snapshot: { status: "scheduled", publishAt: scheduleDate },
      reason: `Scheduled for ${scheduleDate.toISOString()}`,
      action: "schedule",
      wordCount: post.readingTimeMinutes * 200,
    });

    await audit({
      actorUserId: owner.id,
      action: "post_scheduled",
      entityType: "post",
      entityId: id,
      summary: `Scheduled post "${post.title}" for ${scheduleDate.toISOString()}`,
      diff: { status: "scheduled", publishAt: scheduleDate.toISOString() },
      ip,
      userAgent,
    });

    await revalidateBlog(post.slug);

    return { success: true, publishAt: scheduleDate.toISOString() };
  });
}

/**
 * Unschedules a post back to draft status.
 */
export async function unschedulePostAction(id: string): Promise<{ success: boolean }> {
  return withOwner(async ({ user: owner }) => {
    await enforceRateLimit("owner_mutation");
    const { ip, userAgent } = await getRequestMetadata();
    const db = getDb();
    if (!db) throw new Error("Database offline.");

    const rows = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    if (rows.length === 0) throw new Error("Post not found.");
    const post = rows[0];

    assertValidTransition(post.status as PostStatus, "draft");

    const newVersion = post.version + 1;
    await db
      .update(posts)
      .set({
        status: "draft",
        publishAt: null,
        version: newVersion,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, id));

    await audit({
      actorUserId: owner.id,
      action: "post_unscheduled",
      entityType: "post",
      entityId: id,
      summary: `Unscheduled post "${post.title}" back to draft`,
      diff: { status: "draft" },
      ip,
      userAgent,
    });

    await revalidateBlog(post.slug);
    return { success: true };
  });
}

/**
 * Unpublishes a live post back to draft.
 */
export async function unpublishPostAction(id: string): Promise<{ success: boolean }> {
  return withOwner(async ({ user: owner }) => {
    await enforceRateLimit("owner_mutation");
    const { ip, userAgent } = await getRequestMetadata();
    const db = getDb();
    if (!db) throw new Error("Database offline.");

    const rows = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    if (rows.length === 0) throw new Error("Post not found.");
    const post = rows[0];

    assertValidTransition(post.status as PostStatus, "draft");

    const newVersion = post.version + 1;
    await db
      .update(posts)
      .set({
        status: "draft",
        version: newVersion,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, id));

    await audit({
      actorUserId: owner.id,
      action: "post_unpublished",
      entityType: "post",
      entityId: id,
      summary: `Unpublished post "${post.title}"`,
      diff: { status: "draft" },
      ip,
      userAgent,
    });

    await revalidateBlog(post.slug);
    return { success: true };
  });
}

/**
 * Archives a post.
 */
export async function archivePostAction(id: string): Promise<{ success: boolean }> {
  return withOwner(async ({ user: owner }) => {
    await enforceRateLimit("owner_mutation");
    const { ip, userAgent } = await getRequestMetadata();
    const db = getDb();
    if (!db) throw new Error("Database offline.");

    const rows = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    if (rows.length === 0) throw new Error("Post not found.");
    const post = rows[0];

    assertValidTransition(post.status as PostStatus, "archived");

    const newVersion = post.version + 1;
    await db
      .update(posts)
      .set({
        status: "archived",
        version: newVersion,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, id));

    await audit({
      actorUserId: owner.id,
      action: "post_archived",
      entityType: "post",
      entityId: id,
      summary: `Archived post "${post.title}"`,
      diff: { status: "archived" },
      ip,
      userAgent,
    });

    await revalidateBlog(post.slug);
    return { success: true };
  });
}

/**
 * Duplicates an existing post as a new draft.
 */
export async function duplicatePostAction(id: string): Promise<{ id: string; slug: string }> {
  return withOwner(async ({ user: owner }) => {
    await enforceRateLimit("owner_mutation");
    const { ip, userAgent } = await getRequestMetadata();
    const db = getDb();
    if (!db) throw new Error("Database offline.");

    const rows = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    if (rows.length === 0) throw new Error("Post not found.");
    const source = rows[0];

    const randomSuffix = crypto.randomBytes(3).toString("hex");
    const newTitle = `Copy of ${source.title}`.slice(0, 160);
    const newSlug = `${source.slug}-copy-${randomSuffix}`.slice(0, 120);

    const [newPost] = await db
      .insert(posts)
      .values({
        title: newTitle,
        slug: newSlug,
        excerpt: source.excerpt,
        content: source.content,
        categorySlug: source.categorySlug,
        status: "draft",
        authorName: source.authorName,
        authorRole: source.authorRole,
        reviewedByDoctorSlug: source.reviewedByDoctorSlug,
        relatedServiceSlug: source.relatedServiceSlug,
        seoTitle: source.seoTitle,
        seoDescription: source.seoDescription,
        featured: false,
        readingTimeMinutes: source.readingTimeMinutes,
        coverSlot: source.coverSlot,
        contentSchemaVersion: source.contentSchemaVersion,
        version: 1,
      })
      .returning({ id: posts.id, slug: posts.slug });

    // Copy tags
    const existingTags = await db
      .select({ tagSlug: postTags.tagSlug })
      .from(postTags)
      .where(eq(postTags.postId, id));

    for (const t of existingTags) {
      await db.insert(postTags).values({ postId: newPost.id, tagSlug: t.tagSlug }).onConflictDoNothing();
    }

    await audit({
      actorUserId: owner.id,
      action: "post_duplicated",
      entityType: "post",
      entityId: newPost.id,
      summary: `Duplicated post "${source.title}" into "${newTitle}"`,
      diff: { sourceId: id, newSlug },
      ip,
      userAgent,
    });

    await revalidateBlog();

    return { id: newPost.id, slug: newPost.slug };
  });
}

/**
 * Moves a post to Trash (soft delete).
 */
export async function trashPostAction(id: string): Promise<{ success: boolean }> {
  return withOwner(async ({ user: owner }) => {
    await enforceRateLimit("owner_mutation");
    const { ip, userAgent } = await getRequestMetadata();
    const db = getDb();
    if (!db) throw new Error("Database offline.");

    const rows = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    if (rows.length === 0) throw new Error("Post not found.");
    const post = rows[0];

    assertValidTransition(post.status as PostStatus, "trash");

    await db
      .update(posts)
      .set({
        deletedAt: new Date(),
        featured: false, // Trashed post cannot remain featured
        updatedAt: new Date(),
      })
      .where(eq(posts.id, id));

    await audit({
      actorUserId: owner.id,
      action: "post_trashed",
      entityType: "post",
      entityId: id,
      summary: `Moved post "${post.title}" to Trash`,
      diff: { trashed: true },
      ip,
      userAgent,
    });

    await revalidateBlog(post.slug);
    return { success: true };
  });
}

/**
 * Restores a post from Trash. Restores ALWAYS as DRAFT (never auto-republishes).
 */
export async function restorePostAction(id: string): Promise<{ success: boolean }> {
  return withOwner(async ({ user: owner }) => {
    await enforceRateLimit("owner_mutation");
    const { ip, userAgent } = await getRequestMetadata();
    const db = getDb();
    if (!db) throw new Error("Database offline.");

    const rows = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    if (rows.length === 0) throw new Error("Post not found.");
    const post = rows[0];

    assertValidTransition("trash", "draft");

    await db
      .update(posts)
      .set({
        deletedAt: null,
        status: "draft",
        publishAt: null,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, id));

    await audit({
      actorUserId: owner.id,
      action: "post_restored",
      entityType: "post",
      entityId: id,
      summary: `Restored post "${post.title}" from Trash as draft`,
      diff: { status: "draft" },
      ip,
      userAgent,
    });

    await revalidateBlog(post.slug);
    return { success: true };
  });
}

/**
 * Permanently deletes a post from Trash.
 * Strict security requirement: Requires fresh session and typed confirmation of the post title.
 */
export async function deletePermanentlyAction(
  id: string,
  typedConfirmation: string
): Promise<{ success: boolean }> {
  // Requires fresh session under 10 minutes
  return withOwner(async ({ user: owner }) => {
    await enforceRateLimit("owner_mutation");
    const { ip, userAgent } = await getRequestMetadata();
    const db = getDb();
    if (!db) throw new Error("Database offline.");

    const rows = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    if (rows.length === 0) throw new Error("Post not found.");
    const post = rows[0];

    if (!post.deletedAt) {
      throw new Error("Only posts in the Trash can be permanently deleted.");
    }

    if (typedConfirmation.trim() !== post.title.trim()) {
      throw new Error("Confirmation title does not match. Permanent deletion aborted.");
    }

    // Cascade deletes handle post_tags, post_revisions, post_working_copies, post_slug_history
    await db.delete(posts).where(eq(posts.id, id));

    await audit({
      actorUserId: owner.id,
      action: "post_permanently_deleted",
      entityType: "post",
      entityId: id,
      summary: `Permanently deleted post "${post.title}"`,
      diff: { permanentDeletion: true, title: post.title },
      ip,
      userAgent,
    });

    await revalidateBlog(post.slug);
    return { success: true };
  }, { fresh: true });
}

/**
 * Category management server actions
 */
export async function createCategoryAction(label: string, slugInput?: string) {
  return withOwner(async ({ user: owner }) => {
    await enforceRateLimit("owner_mutation");
    const { ip, userAgent } = await getRequestMetadata();
    const db = getDb();
    if (!db) throw new Error("Database offline.");

    const cleanLabel = normalizeText(label).trim();
    if (!cleanLabel) throw new Error("Category label cannot be empty.");

    const cleanSlug = generateSlug(slugInput || cleanLabel);
    if (!isValidSlugFormat(cleanSlug) || isSlugReserved(cleanSlug)) {
      throw new Error(`The category slug "${cleanSlug}" is invalid or reserved.`);
    }

    const existing = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, cleanSlug))
      .limit(1);

    if (existing.length > 0) {
      throw new Error(`Category with slug "${cleanSlug}" already exists.`);
    }

    const countRes = await db.select({ count: sql<number>`count(*)` }).from(categories);
    const nextOrder = Number(countRes[0]?.count || 0) + 1;

    await db.insert(categories).values({
      slug: cleanSlug,
      label: cleanLabel,
      sortOrder: nextOrder,
    });

    await audit({
      actorUserId: owner.id,
      action: "category_created",
      entityType: "category",
      entityId: cleanSlug,
      summary: `Created category "${cleanLabel}" (${cleanSlug})`,
      diff: { slug: cleanSlug, label: cleanLabel },
      ip,
      userAgent,
    });

    await revalidateBlog();
    return { success: true, slug: cleanSlug };
  });
}

export async function renameCategoryAction(slug: string, newLabel: string) {
  return withOwner(async ({ user: owner }) => {
    await enforceRateLimit("owner_mutation");
    const { ip, userAgent } = await getRequestMetadata();
    const db = getDb();
    if (!db) throw new Error("Database offline.");

    const cleanLabel = normalizeText(newLabel).trim();
    if (!cleanLabel) throw new Error("Category label cannot be empty.");

    await db
      .update(categories)
      .set({ label: cleanLabel })
      .where(eq(categories.slug, slug));

    await audit({
      actorUserId: owner.id,
      action: "category_renamed",
      entityType: "category",
      entityId: slug,
      summary: `Renamed category "${slug}" to "${cleanLabel}"`,
      diff: { slug, newLabel: cleanLabel },
      ip,
      userAgent,
    });

    await revalidateBlog();
    return { success: true };
  });
}

export async function reorderCategoriesAction(orderedSlugs: string[]) {
  return withOwner(async ({ user: owner }) => {
    await enforceRateLimit("owner_mutation");
    const { ip, userAgent } = await getRequestMetadata();
    const db = getDb();
    if (!db) throw new Error("Database offline.");

    for (let i = 0; i < orderedSlugs.length; i++) {
      await db
        .update(categories)
        .set({ sortOrder: i + 1 })
        .where(eq(categories.slug, orderedSlugs[i]));
    }

    await audit({
      actorUserId: owner.id,
      action: "categories_reordered",
      entityType: "category",
      summary: `Reordered ${orderedSlugs.length} categories`,
      diff: { orderedSlugs },
      ip,
      userAgent,
    });

    await revalidateBlog();
    return { success: true };
  });
}

export async function deleteCategoryAction(slug: string) {
  return withOwner(async ({ user: owner }) => {
    await enforceRateLimit("owner_mutation");
    const { ip, userAgent } = await getRequestMetadata();
    const db = getDb();
    if (!db) throw new Error("Database offline.");

    // Check if any posts use this category
    const usedPosts = await db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.categorySlug, slug))
      .limit(1);

    if (usedPosts.length > 0) {
      throw new Error(
        `Cannot delete category "${slug}" because existing posts are assigned to it. Reassign or delete those posts first.`
      );
    }

    await db.delete(categories).where(eq(categories.slug, slug));

    await audit({
      actorUserId: owner.id,
      action: "category_deleted",
      entityType: "category",
      entityId: slug,
      summary: `Deleted category "${slug}"`,
      diff: { slug },
      ip,
      userAgent,
    });

    await revalidateBlog();
    return { success: true };
  });
}
