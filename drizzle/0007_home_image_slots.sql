CREATE TABLE "home_image_slots" (
	"slot" text PRIMARY KEY NOT NULL,
	"media_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "home_image_slots" ADD CONSTRAINT "home_image_slots_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;