CREATE TYPE "public"."post_status" AS ENUM('draft', 'scheduled', 'published', 'archived');--> statement-breakpoint
CREATE TABLE "categories" (
	"slug" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_revisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"snapshot" jsonb NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_tags" (
	"post_id" uuid NOT NULL,
	"tag_slug" text NOT NULL,
	CONSTRAINT "post_tags_post_id_tag_slug_pk" PRIMARY KEY("post_id","tag_slug")
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" varchar(160) NOT NULL,
	"excerpt" varchar(320) NOT NULL,
	"content" jsonb NOT NULL,
	"cover_image_url" text,
	"cover_image_alt" text,
	"cover_slot" text,
	"category_slug" text NOT NULL,
	"status" "post_status" DEFAULT 'draft' NOT NULL,
	"publish_at" timestamp with time zone,
	"author_name" text NOT NULL,
	"author_role" text NOT NULL,
	"reviewed_by_doctor_slug" text,
	"related_service_slug" text,
	"seo_title" text,
	"seo_description" text,
	"featured" boolean DEFAULT false NOT NULL,
	"reading_time_minutes" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "posts_slug_unique" UNIQUE("slug"),
	CONSTRAINT "posts_slug_format_check" CHECK (char_length("posts"."slug") >= 3 AND char_length("posts"."slug") <= 120 AND "posts"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	CONSTRAINT "posts_publish_at_required_check" CHECK ("posts"."status" NOT IN ('scheduled', 'published') OR "posts"."publish_at" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"slug" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "post_revisions" ADD CONSTRAINT "post_revisions_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_tag_slug_tags_slug_fk" FOREIGN KEY ("tag_slug") REFERENCES "public"."tags"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_category_slug_categories_slug_fk" FOREIGN KEY ("category_slug") REFERENCES "public"."categories"("slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_post_revisions_post_id" ON "post_revisions" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "idx_post_tags_post_id" ON "post_tags" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "idx_post_tags_tag_slug" ON "post_tags" USING btree ("tag_slug");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_active_featured_post" ON "posts" USING btree ("featured") WHERE "posts"."featured" = true AND "posts"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "idx_posts_status_publish_at" ON "posts" USING btree ("status","publish_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_posts_category_slug" ON "posts" USING btree ("category_slug");