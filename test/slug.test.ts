import { describe, it, expect } from "vitest";
import {
  generateSlug,
  isSlugReserved,
  isValidSlugFormat,
  RESERVED_SLUGS,
} from "../src/server/owner/posts/slug";

describe("Slug utilities", () => {
  it("generates clean kebab-case slugs from titles", () => {
    expect(generateSlug("The Complete Guide to Dental Implants!")).toBe(
      "the-complete-guide-to-dental-implants"
    );
    expect(generateSlug("Root Canal Therapy: Myth vs. Reality")).toBe(
      "root-canal-therapy-myth-vs-reality"
    );
    expect(generateSlug("  Extra   Spaces  -- & Special $$ Characters  ")).toBe(
      "extra-spaces-special-characters"
    );
  });

  it("identifies all reserved slugs", () => {
    for (const reserved of RESERVED_SLUGS) {
      expect(isSlugReserved(reserved)).toBe(true);
      expect(isSlugReserved(reserved.toUpperCase())).toBe(true);
    }
    expect(isSlugReserved("my-custom-blog-post")).toBe(false);
  });

  it("validates slug format according to requirements", () => {
    expect(isValidSlugFormat("valid-slug-123")).toBe(true);
    expect(isValidSlugFormat("another-post")).toBe(true);
    expect(isValidSlugFormat("a")).toBe(false); // min 2
    expect(isValidSlugFormat("-invalid-lead")).toBe(false);
    expect(isValidSlugFormat("invalid-trail-")).toBe(false);
    expect(isValidSlugFormat("invalid--double-dash")).toBe(false);
    expect(isValidSlugFormat("has_underscore")).toBe(false);
    expect(isValidSlugFormat("HasCapitals")).toBe(false);
  });
});
