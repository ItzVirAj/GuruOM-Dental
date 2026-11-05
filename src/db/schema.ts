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
  bigint,
  char,
  date,
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

export const media = pgTable(
  "media",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    publicId: text("public_id").notNull().unique(),
    secureUrl: text("secure_url").notNull(),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    bytes: integer("bytes").notNull(),
    format: varchar("format", { length: 16 }).notNull().default("webp"),
    alt: varchar("alt", { length: 200 }),
    decorative: boolean("decorative").notNull().default(false),
    displayName: varchar("display_name", { length: 120 }).notNull(),
    blurDataUrl: text("blur_data_url").notNull(),
    sha256: varchar("sha256", { length: 64 }).notNull().unique(),
    uploadedBy: text("uploaded_by").references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "date" }),
  },
  (table) => [
    index("idx_media_deleted_at").on(table.deletedAt),
    index("idx_media_created_at").on(table.createdAt.desc()),
    index("idx_media_uploaded_by").on(table.uploadedBy),
  ]
);

export const postMediaRoleEnum = pgEnum("post_media_role", ["cover", "inline"]);

export const postMedia = pgTable(
  "post_media",
  {
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    mediaId: uuid("media_id")
      .notNull()
      .references(() => media.id, { onDelete: "cascade" }),
    role: postMediaRoleEnum("role").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.postId, table.mediaId, table.role] }),
    index("idx_post_media_post_id").on(table.postId),
    index("idx_post_media_media_id").on(table.mediaId),
  ]
);

export const mediaDeletions = pgTable(
  "media_deletions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    publicId: text("public_id").notNull(),
    attempts: integer("attempts").notNull().default(0),
    lastError: text("last_error"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_media_deletions_attempts").on(table.attempts),
    index("idx_media_deletions_created_at").on(table.createdAt),
  ]
);

export const videoStatusEnum = pgEnum("video_status", [
  "draft",
  "published",
]);

export const videos = pgTable(
  "videos",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    youtubeId: char("youtube_id", { length: 11 }).notNull().unique(),
    slug: varchar("slug", { length: 160 }).notNull().unique(),
    title: varchar("title", { length: 160 }).notNull(),
    description: varchar("description", { length: 600 }).notNull(),
    channelName: varchar("channel_name", { length: 120 }),
    thumbnailMediaId: uuid("thumbnail_media_id")
      .notNull()
      .references(() => media.id, { onDelete: "restrict" }),
    categorySlug: text("category_slug").references(() => categories.slug, {
      onDelete: "set null",
    }),
    startSeconds: integer("start_seconds"),
    uploadedOn: date("uploaded_on", { mode: "string" }),
    status: videoStatusEnum("status").notNull().default("draft"),
    featured: boolean("featured").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    version: integer("version").notNull().default(1),
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
      "chk_videos_youtube_id",
      sql`${table.youtubeId} ~ '^[A-Za-z0-9_-]{11}$'`
    ),
    check(
      "chk_videos_start_seconds",
      sql`${table.startSeconds} is null or (${table.startSeconds} >= 0 and ${table.startSeconds} <= 86399)`
    ),
    uniqueIndex("idx_videos_featured_published_unique")
      .on(table.featured)
      .where(
        sql`${table.featured} = true and ${table.status} = 'published' and ${table.deletedAt} is null`
      ),
    index("idx_videos_status").on(table.status),
    index("idx_videos_category_slug").on(table.categorySlug),
    index("idx_videos_sort_order").on(table.sortOrder),
    index("idx_videos_deleted_at").on(table.deletedAt),
    index("idx_videos_created_at").on(table.createdAt.desc()),
  ]
);

export const postVideos = pgTable(
  "post_videos",
  {
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    videoId: uuid("video_id")
      .notNull()
      .references(() => videos.id, { onDelete: "restrict" }),
  },
  (table) => [
    primaryKey({ columns: [table.postId, table.videoId] }),
    index("idx_post_videos_post_id").on(table.postId),
    index("idx_post_videos_video_id").on(table.videoId),
  ]
);

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
    coverMediaId: uuid("cover_media_id").references(() => media.id, { onDelete: "set null" }),
    coverAltOverride: varchar("cover_alt_override", { length: 200 }),
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
    version: integer("version").notNull().default(1),
    lastPublishedAt: timestamp("last_published_at", { withTimezone: true, mode: "date" }),
    contentSchemaVersion: integer("content_schema_version").notNull().default(4),
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
    action: text("action").notNull().default("save"),
    wordCount: integer("word_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_post_revisions_post_id").on(table.postId),
  ]
);

export const postWorkingCopies = pgTable(
  "post_working_copies",
  {
    postId: uuid("post_id")
      .primaryKey()
      .references(() => posts.id, { onDelete: "cascade" }),
    data: jsonb("data").notNull(),
    baseVersion: integer("base_version").notNull().default(1),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  }
);

export const postSlugHistory = pgTable(
  "post_slug_history",
  {
    oldSlug: text("old_slug").primaryKey(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_post_slug_history_post_id").on(table.postId),
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
  coverMedia: one(media, {
    fields: [posts.coverMediaId],
    references: [media.id],
  }),
  tags: many(postTags),
  revisions: many(postRevisions),
  workingCopy: one(postWorkingCopies),
  slugHistory: many(postSlugHistory),
  postMedia: many(postMedia),
  postVideos: many(postVideos),
}));

export const mediaRelations = relations(media, ({ one, many }) => ({
  uploader: one(user, {
    fields: [media.uploadedBy],
    references: [user.id],
  }),
  posts: many(postMedia),
  videos: many(videos),
}));

export const videosRelations = relations(videos, ({ one, many }) => ({
  thumbnailMedia: one(media, {
    fields: [videos.thumbnailMediaId],
    references: [media.id],
  }),
  category: one(categories, {
    fields: [videos.categorySlug],
    references: [categories.slug],
  }),
  postVideos: many(postVideos),
}));

export const postVideosRelations = relations(postVideos, ({ one }) => ({
  post: one(posts, {
    fields: [postVideos.postId],
    references: [posts.id],
  }),
  video: one(videos, {
    fields: [postVideos.videoId],
    references: [videos.id],
  }),
}));

export const postMediaRelations = relations(postMedia, ({ one }) => ({
  post: one(posts, {
    fields: [postMedia.postId],
    references: [posts.id],
  }),
  media: one(media, {
    fields: [postMedia.mediaId],
    references: [media.id],
  }),
}));

export const postWorkingCopiesRelations = relations(postWorkingCopies, ({ one }) => ({
  post: one(posts, {
    fields: [postWorkingCopies.postId],
    references: [posts.id],
  }),
}));

export const postSlugHistoryRelations = relations(postSlugHistory, ({ one }) => ({
  post: one(posts, {
    fields: [postSlugHistory.postId],
    references: [posts.id],
  }),
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

// Better Auth & Security Tables
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  role: text("role").default("owner"),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)]
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
      mode: "date",
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
      mode: "date",
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)]
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
);

export const twoFactor = pgTable(
  "two_factor",
  {
    id: text("id").primaryKey(),
    secret: text("secret").notNull(),
    backupCodes: text("backup_codes").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    verified: boolean("verified").default(true),
    failedVerificationCount: integer("failed_verification_count").default(0),
    lockedUntil: timestamp("locked_until", { withTimezone: true, mode: "date" }),
  },
  (table) => [
    index("twoFactor_secret_idx").on(table.secret),
    index("twoFactor_userId_idx").on(table.userId),
  ]
);

export const rateLimit = pgTable("rate_limit", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  count: integer("count").notNull(),
  lastRequest: bigint("last_request", { mode: "number" }).notNull(),
});

export const accountLockouts = pgTable("account_lockouts", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  failedCount: integer("failed_count").notNull().default(0),
  lockedUntil: timestamp("locked_until", { withTimezone: true, mode: "date" }),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
});

export const securityEvents = pgTable(
  "security_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: text("type").notNull(),
    userId: text("user_id"),
    ip: text("ip"),
    userAgent: text("user_agent"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_security_events_user_id").on(table.userId),
    index("idx_security_events_created_at").on(table.createdAt.desc()),
    index("idx_security_events_type").on(table.type),
  ]
);

export const rateLimits = pgTable(
  "rate_limits",
  {
    keyHash: varchar("key_hash", { length: 64 }).notNull(),
    bucket: varchar("bucket", { length: 32 }).notNull(),
    count: integer("count").notNull().default(1),
    windowStart: timestamp("window_start", { withTimezone: true, mode: "date" }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.keyHash, table.bucket] }),
    index("idx_rate_limits_expires_at").on(table.expiresAt),
  ]
);

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorUserId: text("actor_user_id"),
    action: varchar("action", { length: 64 }).notNull(),
    entityType: varchar("entity_type", { length: 32 }).notNull(),
    entityId: varchar("entity_id", { length: 128 }),
    summary: text("summary").notNull(),
    diff: jsonb("diff"),
    ip: varchar("ip", { length: 64 }),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    prevHash: varchar("prev_hash", { length: 64 }).notNull(),
    rowHash: varchar("row_hash", { length: 64 }).notNull(),
  },
  (table) => [
    index("idx_audit_log_created_at").on(table.createdAt.desc()),
    index("idx_audit_log_action").on(table.action),
    index("idx_audit_log_actor").on(table.actorUserId),
  ]
);

export const userRelations = relations(user, ({ many, one }) => ({
  sessions: many(session),
  accounts: many(account),
  twoFactors: many(twoFactor),
  lockout: one(accountLockouts, {
    fields: [user.id],
    references: [accountLockouts.userId],
  }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const twoFactorRelations = relations(twoFactor, ({ one }) => ({
  user: one(user, {
    fields: [twoFactor.userId],
    references: [user.id],
  }),
}));

export const accountLockoutsRelations = relations(accountLockouts, ({ one }) => ({
  user: one(user, {
    fields: [accountLockouts.userId],
    references: [user.id],
  }),
}));

