CREATE TYPE "public"."post_media_role" AS ENUM('cover', 'inline');--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"public_id" text NOT NULL,
	"secure_url" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"bytes" integer NOT NULL,
	"format" varchar(16) DEFAULT 'webp' NOT NULL,
	"alt" varchar(200),
	"decorative" boolean DEFAULT false NOT NULL,
	"display_name" varchar(120) NOT NULL,
	"blur_data_url" text NOT NULL,
	"sha256" varchar(64) NOT NULL,
	"uploaded_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "media_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "media_sha256_unique" UNIQUE("sha256")
);
--> statement-breakpoint
CREATE TABLE "media_deletions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"public_id" text NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_media" (
	"post_id" uuid NOT NULL,
	"media_id" uuid NOT NULL,
	"role" "post_media_role" NOT NULL,
	CONSTRAINT "post_media_post_id_media_id_role_pk" PRIMARY KEY("post_id","media_id","role")
);
--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "content_schema_version" SET DEFAULT 3;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "cover_media_id" uuid;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "cover_alt_override" varchar(200);--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_uploaded_by_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_media" ADD CONSTRAINT "post_media_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_media" ADD CONSTRAINT "post_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_media_deleted_at" ON "media" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_media_created_at" ON "media" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_media_uploaded_by" ON "media" USING btree ("uploaded_by");--> statement-breakpoint
CREATE INDEX "idx_media_deletions_attempts" ON "media_deletions" USING btree ("attempts");--> statement-breakpoint
CREATE INDEX "idx_media_deletions_created_at" ON "media_deletions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_post_media_post_id" ON "post_media" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "idx_post_media_media_id" ON "post_media" USING btree ("media_id");--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_cover_media_id_media_id_fk" FOREIGN KEY ("cover_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'guruom_app') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "media", "post_media", "media_deletions" TO guruom_app;
  END IF;
END $$;