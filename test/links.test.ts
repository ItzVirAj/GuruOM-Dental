import { describe, it, expect } from "vitest";
import { isSafeLink, safeLinkSchema } from "../src/lib/blog-content";

describe("isSafeLink validator", () => {
  it("accepts valid https URLs", () => {
    expect(isSafeLink("https://example.com")).toBe(true);
    expect(isSafeLink("https://guruomdental.com/services/implants")).toBe(true);
    expect(isSafeLink("https://sub.domain.org/path?query=1&foo=bar#hash")).toBe(true);
  });

  it("accepts valid mailto links", () => {
    expect(isSafeLink("mailto:contact@guruomdental.com")).toBe(true);
  });

  it("accepts valid tel links", () => {
    expect(isSafeLink("tel:+919876543210")).toBe(true);
  });

  it("accepts relative same-site paths and hash fragments", () => {
    expect(isSafeLink("/services/cosmetic")).toBe(true);
    expect(isSafeLink("/about-us")).toBe(true);
    expect(isSafeLink("#procedure-overview")).toBe(true);
  });

  it("rejects insecure http URLs", () => {
    expect(isSafeLink("http://example.com")).toBe(false);
    expect(isSafeLink("http://insecure-site.org")).toBe(false);
  });

  it("rejects dangerous javascript:, data:, and vbscript: URIs", () => {
    expect(isSafeLink("javascript:alert(1)")).toBe(false);
    expect(isSafeLink("JAVASCRIPT:void(0)")).toBe(false);
    expect(isSafeLink("data:text/html,<script>alert(1)</script>")).toBe(false);
    expect(isSafeLink("vbscript:msgbox(1)")).toBe(false);
  });

  it("rejects protocol-relative URLs", () => {
    expect(isSafeLink("//evil.com/phishing")).toBe(false);
    expect(isSafeLink("//google.com")).toBe(false);
  });

  it("rejects control characters", () => {
    expect(isSafeLink("https://example.com\u0000/evil")).toBe(false);
    expect(isSafeLink("https://example.com\n/evil")).toBe(false);
    expect(isSafeLink("https://example.com\r/evil")).toBe(false);
  });

  it("enforces max length via safeLinkSchema", () => {
    const longUrl = "https://example.com/" + "a".repeat(1005);
    const result = safeLinkSchema.safeParse(longUrl);
    expect(result.success).toBe(false);
  });
});
