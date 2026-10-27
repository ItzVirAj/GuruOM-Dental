import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { eq } from "drizzle-orm";
import * as schema from "../../src/db/schema";
import {
  blogCategories,
  blogPosts,
} from "./seed-data/blog";
import {
  validateBlogContent,
  calculateReadingTimeMinutes,
} from "../../src/lib/blog-content";

async function runSeed() {
  const connectionString =
    process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

  if (
    !connectionString ||
    connectionString.includes("REPLACE_WITH_") ||
    connectionString.includes("ep-sample")
  ) {
    console.error(
      "\n[ERROR] Database connection string is not configured in .env.local.\n" +
        "Please follow docs/neon-setup.md to configure DATABASE_URL_UNPOOLED or DATABASE_URL.\n"
    );
    process.exit(1);
  }

  console.log("Connecting to database for idempotent seed operation...");
  const pool = new Pool({ connectionString });
  const db = drizzle(pool, { schema });

  try {
    // 1. Seed Categories
    console.log(`Seeding ${blogCategories.length} categories...`);
    for (let i = 0; i < blogCategories.length; i++) {
      const cat = blogCategories[i];
      await db
        .insert(schema.categories)
        .values({
          slug: cat.slug,
          label: cat.label,
          sortOrder: i + 1,
        })
        .onConflictDoUpdate({
          target: schema.categories.slug,
          set: {
            label: cat.label,
            sortOrder: i + 1,
          },
        });
    }

    // 2. Identify featured post in seed data (preserve single featured post rule)
    const featuredSlug = blogPosts.find((p) => p.featured)?.slug;

    // Reset featured flag if any post will become featured
    if (featuredSlug) {
      await db
        .update(schema.posts)
        .set({ featured: false })
        .where(eq(schema.posts.featured, true));
    }

    // 3. Seed Posts & Tags
    console.log(`Seeding ${blogPosts.length} blog posts...`);
    for (const post of blogPosts) {
      // Validate content blocks with Zod schema
      const validatedContent = validateBlogContent(post.content);
      const computedReadingTime = calculateReadingTimeMinutes(validatedContent);

      const publishDate = new Date(
        post.publishedAt.includes("T")
          ? post.publishedAt
          : `${post.publishedAt}T00:00:00Z`
      );

      const isFeatured = post.slug === featuredSlug;

      // Upsert post by slug
      const insertedPosts = await db
        .insert(schema.posts)
        .values({
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          content: validatedContent,
          coverSlot: post.coverSlot || null,
          categorySlug: post.category,
          status: "published",
          publishAt: publishDate,
          authorName: post.authorName,
          authorRole: post.authorRole,
          reviewedByDoctorSlug: post.reviewedBySlug || null,
          relatedServiceSlug: post.relatedServiceSlug || null,
          featured: isFeatured,
          readingTimeMinutes: computedReadingTime,
          deletedAt: null, // Ensure not soft-deleted
        })
        .onConflictDoUpdate({
          target: schema.posts.slug,
          set: {
            title: post.title,
            excerpt: post.excerpt,
            content: validatedContent,
            coverSlot: post.coverSlot || null,
            categorySlug: post.category,
            status: "published",
            publishAt: publishDate,
            authorName: post.authorName,
            authorRole: post.authorRole,
            reviewedByDoctorSlug: post.reviewedBySlug || null,
            relatedServiceSlug: post.relatedServiceSlug || null,
            featured: isFeatured,
            readingTimeMinutes: computedReadingTime,
            updatedAt: new Date(),
            deletedAt: null,
          },
        })
        .returning({ id: schema.posts.id, slug: schema.posts.slug });

      const postId = insertedPosts[0]?.id;

      // Seed tags
      if (postId && post.tags && post.tags.length > 0) {
        for (const tagLabel of post.tags) {
          const tagSlug = tagLabel
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");

          await db
            .insert(schema.tags)
            .values({
              slug: tagSlug,
              label: tagLabel,
            })
            .onConflictDoUpdate({
              target: schema.tags.slug,
              set: { label: tagLabel },
            });

          await db
            .insert(schema.postTags)
            .values({
              postId,
              tagSlug,
            })
            .onConflictDoNothing();
        }
      }
    }

    console.log(
      `[SUCCESS] Seed complete! Seeded ${blogCategories.length} categories and ${blogPosts.length} posts.`
    );
  } catch (error) {
    console.error(
      "[ERROR] Database seeding failed:",
      error instanceof Error ? error.message : "Unknown error"
    );
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runSeed();
