CREATE TYPE "public"."video_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TABLE "post_videos" (
	"post_id" uuid NOT NULL,
	"video_id" uuid NOT NULL,
	CONSTRAINT "post_videos_post_id_video_id_pk" PRIMARY KEY("post_id","video_id")
);
--> statement-breakpoint
CREATE TABLE "videos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"youtube_id" char(11) NOT NULL,
	"slug" varchar(160) NOT NULL,
	"title" varchar(160) NOT NULL,
	"description" varchar(600) NOT NULL,
	"channel_name" varchar(120),
	"thumbnail_media_id" uuid NOT NULL,
	"category_slug" text,
	"start_seconds" integer,
	"uploaded_on" date,
	"status" "video_status" DEFAULT 'draft' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "videos_youtube_id_unique" UNIQUE("youtube_id"),
	CONSTRAINT "videos_slug_unique" UNIQUE("slug"),
	CONSTRAINT "chk_videos_youtube_id" CHECK ("videos"."youtube_id" ~ '^[A-Za-z0-9_-]{11}$'),
	CONSTRAINT "chk_videos_start_seconds" CHECK ("videos"."start_seconds" is null or ("videos"."start_seconds" >= 0 and "videos"."start_seconds" <= 86399))
);
--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "content_schema_version" SET DEFAULT 4;--> statement-breakpoint
ALTER TABLE "post_videos" ADD CONSTRAINT "post_videos_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_videos" ADD CONSTRAINT "post_videos_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_thumbnail_media_id_media_id_fk" FOREIGN KEY ("thumbnail_media_id") REFERENCES "public"."media"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_category_slug_categories_slug_fk" FOREIGN KEY ("category_slug") REFERENCES "public"."categories"("slug") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_post_videos_post_id" ON "post_videos" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "idx_post_videos_video_id" ON "post_videos" USING btree ("video_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_videos_featured_published_unique" ON "videos" USING btree ("featured") WHERE "videos"."featured" = true and "videos"."status" = 'published' and "videos"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "idx_videos_status" ON "videos" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_videos_category_slug" ON "videos" USING btree ("category_slug");--> statement-breakpoint
CREATE INDEX "idx_videos_sort_order" ON "videos" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "idx_videos_deleted_at" ON "videos" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_videos_created_at" ON "videos" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'guruom_app') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "videos", "post_videos" TO guruom_app;
  END IF;
END
$$;
