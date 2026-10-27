import {
  pgTable,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  uuid,
  jsonb,
  pgEnum,
  primaryKey,
  uniqueIndex,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";
import type { ContentBlock } from "@/src/lib/blog-content";

export const postStatusEnum = pgEnum("post_status", [
  "draft",
  "scheduled",
  "published",
  "archived",
]);

export const categories = pgTable("categories", {
  slug: text("slug").primaryKey(),
  label: text("label").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull().unique(),
    title: varchar("title", { length: 160 }).notNull(),
    excerpt: varchar("excerpt", { length: 320 }).notNull(),
    content: jsonb("content").$type<ContentBlock[]>().notNull(),
    coverImageUrl: text("cover_image_url"),
    coverImageAlt: text("cover_image_alt"),
    coverSlot: text("cover_slot"),
    categorySlug: text("category_slug")
      .notNull()
      .references(() => categories.slug),
    status: postStatusEnum("status").notNull().default("draft"),
    publishAt: timestamp("publish_at", { withTimezone: true, mode: "date" }),
    authorName: text("author_name").notNull(),
    authorRole: text("author_role").notNull(),
    reviewedByDoctorSlug: text("reviewed_by_doctor_slug"),
    relatedServiceSlug: text("related_service_slug"),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    featured: boolean("featured").notNull().default(false),
    readingTimeMinutes: integer("reading_time_minutes").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "date" }),
  },
  (table) => [
    check(
      "posts_slug_format_check",
      sql`char_length(${table.slug}) >= 3 AND char_length(${table.slug}) <= 120 AND ${table.slug} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`
    ),
    check(
      "posts_publish_at_required_check",
      sql`${table.status} NOT IN ('scheduled', 'published') OR ${table.publishAt} IS NOT NULL`
    ),
    uniqueIndex("unique_active_featured_post")
      .on(table.featured)
      .where(sql`${table.featured} = true AND ${table.deletedAt} IS NULL`),
    index("idx_posts_status_publish_at").on(table.status, table.publishAt.desc()),
    index("idx_posts_category_slug").on(table.categorySlug),
  ]
);

export const tags = pgTable("tags", {
  slug: text("slug").primaryKey(),
  label: text("label").notNull(),
});

export const postTags = pgTable(
  "post_tags",
  {
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    tagSlug: text("tag_slug")
      .notNull()
      .references(() => tags.slug, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.postId, table.tagSlug] }),
    index("idx_post_tags_post_id").on(table.postId),
    index("idx_post_tags_tag_slug").on(table.tagSlug),
  ]
);

export const postRevisions = pgTable(
  "post_revisions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    snapshot: jsonb("snapshot").notNull(),
    reason: text("reason").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_post_revisions_post_id").on(table.postId),
  ]
);

// Relations definitions
export const categoriesRelations = relations(categories, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  category: one(categories, {
    fields: [posts.categorySlug],
    references: [categories.slug],
  }),
  tags: many(postTags),
  revisions: many(postRevisions),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  posts: many(postTags),
}));

export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(posts, {
    fields: [postTags.postId],
    references: [posts.id],
  }),
  tag: one(tags, {
    fields: [postTags.tagSlug],
    references: [tags.slug],
  }),
}));

export const postRevisionsRelations = relations(postRevisions, ({ one }) => ({
  post: one(posts, {
    fields: [postRevisions.postId],
    references: [posts.id],
  }),
}));
