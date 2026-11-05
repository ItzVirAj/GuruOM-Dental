import { describe, it, expect } from "vitest";
import sharp from "sharp";
import { fileTypeFromBuffer } from "file-type";
import {
  getNearestAllowedWidth,
  ALLOWED_IMAGE_WIDTHS,
  ALLOWED_CLOUDINARY_TRANSFORMATIONS,
  coverUrl,
  mediaThumbUrl,
} from "../src/lib/media/cloudinary-loader";
import { blogContentArraySchema, ContentBlock } from "../src/lib/blog-content";
import { blocksToEditorDoc, editorDocToBlocks } from "../src/lib/editor/converters";

describe("Media Security & Integrity Pipeline", () => {
  describe("1. Magic Byte & Content Verification", () => {
    it("rejects non-image disguised text files", async () => {
      const fakeImage = Buffer.from("<html><script>alert('xss')</script></html>");
      const detected = await fileTypeFromBuffer(fakeImage);
      const isAllowed =
        detected &&
        ["image/jpeg", "image/png", "image/webp", "image/avif"].includes(
          detected.mime
        );
      expect(isAllowed).toBeFalsy();
    });

    it("accepts valid WebP image generated buffer", async () => {
      const webpBuffer = await sharp({
        create: {
          width: 100,
          height: 100,
          channels: 4,
          background: { r: 255, g: 0, b: 0, alpha: 1 },
        },
      })
        .webp()
        .toBuffer();

      const detected = await fileTypeFromBuffer(webpBuffer);
      expect(detected?.mime).toBe("image/webp");
    });

    it("accepts valid PNG image generated buffer", async () => {
      const pngBuffer = await sharp({
        create: {
          width: 50,
          height: 50,
          channels: 3,
          background: { r: 0, g: 255, b: 0 },
        },
      })
        .png()
        .toBuffer();

      const detected = await fileTypeFromBuffer(pngBuffer);
      expect(detected?.mime).toBe("image/png");
    });
  });

  describe("2. Decompression Bomb & Pixel Limiting", () => {
    it("fails when input image exceeds 40M pixel limit", async () => {
      // 7000 x 6000 = 42,000,000 pixels (>40M limit)
      const bigSvg = Buffer.from(
        `<svg width="7000" height="6000" xmlns="http://www.w3.org/2000/svg"><rect width="7000" height="6000" fill="red"/></svg>`
      );

      await expect(
        sharp(bigSvg, { limitInputPixels: 40_000_000 }).toBuffer()
      ).rejects.toThrow();
    });

    it("succeeds when image is within 40M pixel bounds", async () => {
      const normalBuffer = await sharp({
        create: {
          width: 1000,
          height: 1000,
          channels: 3,
          background: { r: 10, g: 20, b: 30 },
        },
      })
        .webp()
        .toBuffer();

      const processed = await sharp(normalBuffer, {
        limitInputPixels: 40_000_000,
      })
        .resize(2400, 2400, { fit: "inside", withoutEnlargement: true })
        .webp()
        .toBuffer();

      const meta = await sharp(processed).metadata();
      expect(meta.width).toBe(1000);
      expect(meta.height).toBe(1000);
    });
  });

  describe("3. EXIF Metadata Stripping", () => {
    it("strips EXIF / camera metadata on re-encoding", async () => {
      // Create JPEG with fake EXIF orientation metadata
      const rawWithExif = await sharp({
        create: {
          width: 200,
          height: 150,
          channels: 3,
          background: { r: 100, g: 150, b: 200 },
        },
      })
        .jpeg()
        .toBuffer();

      // Sharp re-encode pipeline (rotate strips EXIF and normalizes)
      const sanitized = await sharp(rawWithExif)
        .rotate()
        .resize(2400, 2400, { fit: "inside" })
        .webp({ quality: 88 })
        .toBuffer();

      const meta = await sharp(sanitized).metadata();
      expect(meta.exif).toBeUndefined();
    });
  });

  describe("4. Filename Sanitization", () => {
    function sanitizeFilename(name: string): string {
      return name.replace(/[^\w.-]/g, "_").slice(0, 120);
    }

    it("eliminates directory traversal characters", () => {
      expect(sanitizeFilename("../../../etc/passwd.png")).toBe(
        ".._.._.._etc_passwd.png"
      );
      expect(sanitizeFilename("..\\..\\windows\\system32\\cmd.exe")).toBe(
        ".._.._windows_system32_cmd.exe"
      );
    });

    it("replaces special symbols and preserves safe extensions", () => {
      expect(
        sanitizeFilename("dr handal's smile guide (2026) #teeth! <clinic>.webp")
      ).toBe("dr_handal_s_smile_guide__2026___teeth___clinic_.webp");
    });

    it("clamps length to 120 characters", () => {
      const veryLong = "a".repeat(200) + ".jpg";
      expect(sanitizeFilename(veryLong).length).toBe(120);
    });
  });

  describe("5. Cloudinary Strict Transformation & Width Snapping", () => {
    it("snaps requested widths to approved set only", () => {
      expect(getNearestAllowedWidth(50)).toBe(320);
      expect(getNearestAllowedWidth(320)).toBe(320);
      expect(getNearestAllowedWidth(500)).toBe(640);
      expect(getNearestAllowedWidth(640)).toBe(640);
      expect(getNearestAllowedWidth(800)).toBe(960);
      expect(getNearestAllowedWidth(1100)).toBe(1280);
      expect(getNearestAllowedWidth(1500)).toBe(1920);
      expect(getNearestAllowedWidth(2100)).toBe(2400);
      expect(getNearestAllowedWidth(5000)).toBe(2400); // capped at 2400
    });

    it("contains all generated widths in allowed transformation allowlist", () => {
      for (const w of ALLOWED_IMAGE_WIDTHS) {
        const trans = `f_auto,q_auto,c_limit,w_${w}`;
        expect(
          (ALLOWED_CLOUDINARY_TRANSFORMATIONS as readonly string[]).includes(trans)
        ).toBe(true);
      }
    });

    it("generates correct cover URLs for card and og ratios", () => {
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = "guruom-test";
      const card = coverUrl("guruom-dev/2026-11/test-uuid", "16/10");
      expect(card).toBe(
        "https://res.cloudinary.com/guruom-test/image/upload/c_fill,g_auto,w_1200,h_750/guruom-dev/2026-11/test-uuid"
      );

      const og = coverUrl("guruom-dev/2026-11/test-uuid", "og");
      expect(og).toBe(
        "https://res.cloudinary.com/guruom-test/image/upload/c_fill,g_auto,w_1200,h_630/guruom-dev/2026-11/test-uuid"
      );

      const thumb = mediaThumbUrl("guruom-dev/2026-11/test-uuid");
      expect(thumb).toBe(
        "https://res.cloudinary.com/guruom-test/image/upload/c_fill,g_auto,w_300,h_300/guruom-dev/2026-11/test-uuid"
      );
    });
  });

  describe("6. Zod Schema Image Security", () => {
    it("rejects blocks containing raw image URLs", () => {
      const rawUrlBlock = [
        {
          type: "image",
          url: "https://evil.com/phishing.jpg",
        },
      ];
      expect(() => blogContentArraySchema.parse(rawUrlBlock)).toThrow();
    });

    it("rejects blocks with invalid mediaId (not UUID)", () => {
      const invalidMediaId = [
        {
          type: "image",
          mediaId: "not-a-valid-uuid",
        },
      ];
      expect(() => blogContentArraySchema.parse(invalidMediaId)).toThrow();
    });

    it("accepts valid UUID mediaId image blocks", () => {
      const validBlock = [
        {
          type: "image",
          mediaId: "6b185cd9-5d52-4aaf-8bf4-780c00149b1c",
          alt: "Root canal therapy illustration",
          layout: "wide" as const,
        },
      ];
      const parsed = blogContentArraySchema.parse(validBlock);
      expect(parsed[0].type).toBe("image");
      if (parsed[0].type === "image" && "mediaId" in parsed[0]) {
        expect(parsed[0].mediaId).toBe("6b185cd9-5d52-4aaf-8bf4-780c00149b1c");
        expect(parsed[0].layout).toBe("wide");
      }
    });

    it("accepts legacy slot-based image blocks for backwards compatibility", () => {
      const legacyBlock = [
        {
          type: "image",
          slot: "hero-clinical",
          alt: "Clinic exterior",
        },
      ];
      const parsed = blogContentArraySchema.parse(legacyBlock);
      expect(parsed[0].type).toBe("image");
      if (parsed[0].type === "image" && "slot" in parsed[0]) {
        expect(parsed[0].slot).toBe("hero-clinical");
      }
    });
  });

  describe("7. TipTap Converters Round-trip", () => {
    it("preserves modern image blocks with mediaId and layout through doc round-trip", () => {
      const originalBlocks: ContentBlock[] = [
        {
          type: "image",
          mediaId: "6b185cd9-5d52-4aaf-8bf4-780c00149b1c",
          alt: "Dental implant placement schematic",
          caption: "Implant osseointegration stage",
          captionRuns: [{ text: "Implant osseointegration stage" }],
          layout: "wide",
        },
      ];

      const doc = blocksToEditorDoc(originalBlocks);
      expect(doc.content[0].type).toBe("image");
      expect(doc.content[0].attrs?.mediaId).toBe(
        "6b185cd9-5d52-4aaf-8bf4-780c00149b1c"
      );
      expect(doc.content[0].attrs?.layout).toBe("wide");

      const roundTripped = editorDocToBlocks(doc);
      expect(roundTripped[0].type).toBe("image");
      if (roundTripped[0].type === "image" && "mediaId" in roundTripped[0]) {
        expect(roundTripped[0].mediaId).toBe(
          "6b185cd9-5d52-4aaf-8bf4-780c00149b1c"
        );
        expect(roundTripped[0].layout).toBe("wide");
        expect(roundTripped[0].alt).toBe("Dental implant placement schematic");
      }
    });
  });
});
