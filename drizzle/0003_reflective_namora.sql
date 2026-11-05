CREATE TABLE "post_slug_history" (
	"old_slug" text PRIMARY KEY NOT NULL,
	"post_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_working_copies" (
	"post_id" uuid PRIMARY KEY NOT NULL,
	"data" jsonb NOT NULL,
	"base_version" integer DEFAULT 1 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "post_revisions" ADD COLUMN "action" text DEFAULT 'save' NOT NULL;--> statement-breakpoint
ALTER TABLE "post_revisions" ADD COLUMN "word_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "last_published_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "content_schema_version" integer DEFAULT 2 NOT NULL;--> statement-breakpoint
ALTER TABLE "post_slug_history" ADD CONSTRAINT "post_slug_history_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_working_copies" ADD CONSTRAINT "post_working_copies_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_post_slug_history_post_id" ON "post_slug_history" USING btree ("post_id");