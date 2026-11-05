import { describe, it, expect } from "vitest";
import { sanitizePastedHtml } from "../src/lib/editor/sanitize-paste";

describe("Paste HTML Sanitizer", () => {
  it("strips scripts, style tags, and event handlers", () => {
    const dirty = '<p>Normal text<script>alert("xss")</script><style>body{color:red}</style></p>';
    const clean = sanitizePastedHtml(dirty);
    expect(clean).not.toContain("<script>");
    expect(clean).not.toContain("alert");
    expect(clean).not.toContain("<style>");
    expect(clean).toContain("<p>Normal text</p>");
  });

  it("strips onerror and onclick attributes", () => {
    const dirty = '<p onclick="steal()">Click <img src="x" onerror="alert(1)"> me</p>';
    const clean = sanitizePastedHtml(dirty);
    expect(clean).not.toContain("onclick");
    expect(clean).not.toContain("onerror");
    expect(clean).not.toContain("<img");
    expect(clean).toContain("Click  me");
  });

  it("strips inline style and class attributes", () => {
    const dirty = '<p style="color: red; font-size: 50px;" class="custom-class">Styled text</p>';
    const clean = sanitizePastedHtml(dirty);
    expect(clean).toBe("<p>Styled text</p>");
  });

  it("preserves safe links and strips javascript links", () => {
    const dirty =
      '<p><a href="https://guruomdental.com">Safe</a> and <a href="javascript:alert(1)">Dangerous</a></p>';
    const clean = sanitizePastedHtml(dirty);
    expect(clean).toContain('<a href="https://guruomdental.com">Safe</a>');
    expect(clean).not.toContain("javascript:");
    expect(clean).toContain("Dangerous");
  });

  it("maps h1 to h2 and h4-h6 to p", () => {
    const dirty = "<h1>Main Heading</h1><h4>Sub heading</h4>";
    const clean = sanitizePastedHtml(dirty);
    expect(clean).toContain("<h2>Main Heading</h2>");
    expect(clean).toContain("<p>Sub heading</p>");
  });
});
