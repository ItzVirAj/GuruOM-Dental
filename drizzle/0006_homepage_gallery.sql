CREATE TABLE "gallery_cards" (
	"id" text PRIMARY KEY NOT NULL,
	"title" varchar(120) NOT NULL,
	"label" varchar(50) NOT NULL,
	"image_slot" text,
	"media_id" uuid,
	"position" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "gallery_cards" ADD CONSTRAINT "gallery_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
INSERT INTO gallery_cards (id, title, label, image_slot, position) VALUES
('preventive', 'Veneer Makeover', 'Preventive', 'gallery1', 0),
('oral-surgery', 'Implantology Case', 'Oral Surgery', 'gallery2', 1),
('laser-care', 'Clear Aligners', 'Laser Care', 'gallery3', 2),
('cosmetic', 'Full Mouth Rehab', 'Cosmetic', 'gallery4', 3),
('implants', 'Micro Endodontics', 'Implants', 'gallery5', 4),
('orthodontics', 'Laser Periodontics', 'Orthodontics', 'gallery6', 5),
('pediatric', 'Sterilization Suite', 'Pediatric', 'gallery7', 6),
('emergency', 'Relaxation Suite', 'Emergency', 'gallery8', 7);
