ALTER TABLE "gallery_cards" ADD COLUMN "section" text DEFAULT 'gallery' NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_gallery_cards_section" ON "gallery_cards" USING btree ("section");--> statement-breakpoint
INSERT INTO gallery_cards (id, section, title, label, image_slot, position) VALUES
('lab-cadcam', 'lab', 'CAD/CAM Milling Suite', 'CAD/CAM', 'labGallery1', 0),
('lab-3d-scan', 'lab', 'Digital Design Studio', '3D Design', 'labGallery2', 1),
('lab-zirconia', 'lab', 'Zirconia Sintering Lab', 'Zirconia', 'labGallery3', 2),
('lab-ceramic', 'lab', 'Ceramic Finishing Bench', 'Ceramics', 'labGallery4', 3)
ON CONFLICT (id) DO NOTHING;