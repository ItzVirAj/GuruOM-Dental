import { describe, it, expect, vi, afterEach } from "vitest";

vi.mock("server-only", () => ({}));

import {
  parseYouTubeUrl,
  YouTubeUrlParseError,
} from "../src/server/owner/videos/parse-url";
import { fetchOEmbed } from "../src/server/owner/videos/oembed";
import { blogContentArraySchema } from "../src/lib/blog-content";
import { blocksToEditorDoc, editorDocToBlocks } from "../src/lib/editor/converters";

describe("YouTube URL Parser & SSRF Security (parseYouTubeUrl)", () => {
  // Test suite with over 40 distinct cases

  describe("Accepted Video Formats", () => {
    it("1. Standard watch URL", () => {
      const res = parseYouTubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
      expect(res.youtubeId).toBe("dQw4w9WgXcQ");
      expect(res.startSeconds).toBeNull();
    });

    it("2. Non-www standard watch URL", () => {
      const res = parseYouTubeUrl("https://youtube.com/watch?v=dQw4w9WgXcQ");
      expect(res.youtubeId).toBe("dQw4w9WgXcQ");
    });

    it("3. Mobile domain watch URL", () => {
      const res = parseYouTubeUrl("https://m.youtube.com/watch?v=dQw4w9WgXcQ");
      expect(res.youtubeId).toBe("dQw4w9WgXcQ");
    });

    it("4. youtu.be shortlink URL", () => {
      const res = parseYouTubeUrl("https://youtu.be/dQw4w9WgXcQ");
      expect(res.youtubeId).toBe("dQw4w9WgXcQ");
    });

    it("5. Privacy-enhanced domain embed URL", () => {
      const res = parseYouTubeUrl("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
      expect(res.youtubeId).toBe("dQw4w9WgXcQ");
    });

    it("6. Standard embed URL", () => {
      const res = parseYouTubeUrl("https://www.youtube.com/embed/dQw4w9WgXcQ");
      expect(res.youtubeId).toBe("dQw4w9WgXcQ");
    });

    it("7. Shorts URL", () => {
      const res = parseYouTubeUrl("https://www.youtube.com/shorts/dQw4w9WgXcQ");
      expect(res.youtubeId).toBe("dQw4w9WgXcQ");
    });

    it("8. Live stream URL", () => {
      const res = parseYouTubeUrl("https://www.youtube.com/live/dQw4w9WgXcQ");
      expect(res.youtubeId).toBe("dQw4w9WgXcQ");
    });

    it("9. Bare youtu.be domain without scheme", () => {
      const res = parseYouTubeUrl("youtu.be/dQw4w9WgXcQ");
      expect(res.youtubeId).toBe("dQw4w9WgXcQ");
    });

    it("10. Bare youtube.com domain without scheme", () => {
      const res = parseYouTubeUrl("youtube.com/watch?v=dQw4w9WgXcQ");
      expect(res.youtubeId).toBe("dQw4w9WgXcQ");
    });

    it("11. Leading and trailing whitespace is trimmed", () => {
      const res = parseYouTubeUrl("  https://www.youtube.com/watch?v=dQw4w9WgXcQ   ");
      expect(res.youtubeId).toBe("dQw4w9WgXcQ");
    });

    it("12. Mixed query parameters (extra tracking params)", () => {
      const res = parseYouTubeUrl(
        "https://www.youtube.com/watch?feature=share&v=dQw4w9WgXcQ&si=12345"
      );
      expect(res.youtubeId).toBe("dQw4w9WgXcQ");
    });

    it("13. Uppercase scheme and host normalisation", () => {
      const res = parseYouTubeUrl("HTTPS://WWW.YOUTUBE.COM/watch?v=dQw4w9WgXcQ");
      expect(res.youtubeId).toBe("dQw4w9WgXcQ");
    });

    it("14. URL with hash fragment", () => {
      const res = parseYouTubeUrl("https://youtu.be/dQw4w9WgXcQ#dialog");
      expect(res.youtubeId).toBe("dQw4w9WgXcQ");
    });

    it("15. IDs with underscores and hyphens (regex test)", () => {
      const res = parseYouTubeUrl("https://youtu.be/a-B_1234567");
      expect(res.youtubeId).toBe("a-B_1234567");
    });
  });

  describe("Timestamp Parsing and Clamping", () => {
    it("16. Integer seconds in t param (t=90)", () => {
      const res = parseYouTubeUrl("https://youtu.be/dQw4w9WgXcQ?t=90");
      expect(res.startSeconds).toBe(90);
    });

    it("17. Seconds suffix in t param (t=90s)", () => {
      const res = parseYouTubeUrl("https://youtu.be/dQw4w9WgXcQ?t=90s");
      expect(res.startSeconds).toBe(90);
    });

    it("18. Minutes and seconds format (t=1m30s)", () => {
      const res = parseYouTubeUrl("https://youtu.be/dQw4w9WgXcQ?t=1m30s");
      expect(res.startSeconds).toBe(90);
    });

    it("19. Hours, minutes, and seconds format (t=1h2m3s)", () => {
      const res = parseYouTubeUrl("https://youtu.be/dQw4w9WgXcQ?t=1h2m3s");
      expect(res.startSeconds).toBe(3600 + 120 + 3);
    });

    it("20. Hours only (t=2h)", () => {
      const res = parseYouTubeUrl("https://youtu.be/dQw4w9WgXcQ?t=2h");
      expect(res.startSeconds).toBe(7200);
    });

    it("21. Minutes only (t=5m)", () => {
      const res = parseYouTubeUrl("https://youtu.be/dQw4w9WgXcQ?t=5m");
      expect(res.startSeconds).toBe(300);
    });

    it("22. start param used instead of t (start=150)", () => {
      const res = parseYouTubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ&start=150");
      expect(res.startSeconds).toBe(150);
    });

    it("23. Start time clamping to maximum 86399s (24h - 1s)", () => {
      const res = parseYouTubeUrl("https://youtu.be/dQw4w9WgXcQ?t=999999");
      expect(res.startSeconds).toBe(86399);
    });

    it("24. Invalid time string returns null", () => {
      const res = parseYouTubeUrl("https://youtu.be/dQw4w9WgXcQ?t=invalid");
      expect(res.startSeconds).toBeNull();
    });

    it("25. Negative time returns null", () => {
      const res = parseYouTubeUrl("https://youtu.be/dQw4w9WgXcQ?t=-40");
      expect(res.startSeconds).toBeNull();
    });
  });

  describe("Rejection of Invalid / Dangerous Formats (Security Hardening)", () => {
    it("26. Rejects lookalike host (youtube.com.evil.com)", () => {
      expect(() =>
        parseYouTubeUrl("https://youtube.com.evil.com/watch?v=dQw4w9WgXcQ")
      ).toThrow(YouTubeUrlParseError);
    });

    it("27. Rejects lookalike host in path (evil.com/youtube.com)", () => {
      expect(() =>
        parseYouTubeUrl("https://evil.com/youtube.com/watch?v=dQw4w9WgXcQ")
      ).toThrow(YouTubeUrlParseError);
    });

    it("28. Rejects youtu.be lookalike host (youtu.be.evil.com)", () => {
      expect(() =>
        parseYouTubeUrl("https://youtu.be.evil.com/dQw4w9WgXcQ")
      ).toThrow(YouTubeUrlParseError);
    });

    it("29. Rejects userinfo trick (https://youtube.com@evil.com)", () => {
      expect(() =>
        parseYouTubeUrl("https://youtube.com@evil.com/watch?v=dQw4w9WgXcQ")
      ).toThrow(YouTubeUrlParseError);
    });

    it("30. Rejects insecure HTTP scheme", () => {
      expect(() =>
        parseYouTubeUrl("http://www.youtube.com/watch?v=dQw4w9WgXcQ")
      ).toThrow(YouTubeUrlParseError);
    });

    it("31. Rejects javascript: scheme", () => {
      expect(() =>
        parseYouTubeUrl("javascript:alert('xss')")
      ).toThrow(YouTubeUrlParseError);
    });

    it("32. Rejects data: URI scheme", () => {
      expect(() =>
        parseYouTubeUrl("data:text/html,<script>alert(1)</script>")
      ).toThrow(YouTubeUrlParseError);
    });

    it("33. Rejects non-standard port", () => {
      expect(() =>
        parseYouTubeUrl("https://www.youtube.com:8080/watch?v=dQw4w9WgXcQ")
      ).toThrow(YouTubeUrlParseError);
    });

    it("34. Rejects playlist-only URL", () => {
      expect(() =>
        parseYouTubeUrl("https://www.youtube.com/playlist?list=PL123456789")
      ).toThrow("Only direct video links are supported");
    });

    it("35. Rejects channel URL", () => {
      expect(() =>
        parseYouTubeUrl("https://www.youtube.com/channel/UC123456789")
      ).toThrow("Only direct video links are supported");
    });

    it("36. Rejects custom channel /c/ URL", () => {
      expect(() =>
        parseYouTubeUrl("https://www.youtube.com/c/GuruOmDental")
      ).toThrow("Only direct video links are supported");
    });

    it("37. Rejects username @handle URL", () => {
      expect(() =>
        parseYouTubeUrl("https://www.youtube.com/@GuruOmDental")
      ).toThrow("Only direct video links are supported");
    });

    it("38. Rejects search results URL", () => {
      expect(() =>
        parseYouTubeUrl("https://www.youtube.com/results?search_query=dentist")
      ).toThrow("Only direct video links are supported");
    });

    it("39. Rejects video ID too short (10 chars)", () => {
      expect(() =>
        parseYouTubeUrl("https://youtu.be/1234567890")
      ).toThrow("Invalid YouTube video ID");
    });

    it("40. Rejects video ID too long (12 chars)", () => {
      expect(() =>
        parseYouTubeUrl("https://youtu.be/123456789012")
      ).toThrow("Invalid YouTube video ID");
    });

    it("41. Rejects video ID with special characters", () => {
      expect(() =>
        parseYouTubeUrl("https://youtu.be/dQw4w9WgXc!")
      ).toThrow("Invalid YouTube video ID");
    });

    it("42. Rejects control characters", () => {
      expect(() =>
        parseYouTubeUrl("https://youtu.be/dQw4w9WgXcQ\x00")
      ).toThrow("URL contains illegal control characters");
    });

    it("43. Rejects excessively long input (>500 chars)", () => {
      const longInput = "https://www.youtube.com/watch?v=dQw4w9WgXcQ&junk=" + "a".repeat(600);
      expect(() => parseYouTubeUrl(longInput)).toThrow("exceeds maximum length");
    });

    it("44. Rejects empty string or non-string", () => {
      expect(() => parseYouTubeUrl("")).toThrow("Please provide a valid YouTube URL");
    });
  });
});

describe("YouTube oEmbed Fetching (SSRF Guarded)", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("handles successful oEmbed 200 response with title and author", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      body: {
        getReader: () => {
          let read = false;
          return {
            read: () => {
              if (read) return Promise.resolve({ done: true, value: undefined });
              read = true;
              const json = JSON.stringify({
                title: "Advanced Root Canal Procedure",
                author_name: "GuruOm Dental Clinic",
                thumbnail_url: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
                type: "video",
              });
              return Promise.resolve({ done: false, value: Buffer.from(json) });
            },
            cancel: () => Promise.resolve(),
          };
        },
      },
    } as unknown as Response);

    const res = await fetchOEmbed("dQw4w9WgXcQ");
    expect(res.title).toBe("Advanced Root Canal Procedure");
    expect(res.authorName).toBe("GuruOm Dental Clinic");
  });

  it("maps 404 to 'Video not found on YouTube.'", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      headers: new Headers({ "content-type": "application/json" }),
    } as unknown as Response);

    await expect(fetchOEmbed("dQw4w9WgXcQ")).rejects.toThrow(
      "Video not found on YouTube."
    );
  });

  it("maps 401/403 to 'This video is private or can't be embedded.'", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      headers: new Headers({ "content-type": "application/json" }),
    } as unknown as Response);

    await expect(fetchOEmbed("dQw4w9WgXcQ")).rejects.toThrow(
      "This video is private or can't be embedded."
    );
  });

  it("rejects non-json content types", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "text/html" }),
      body: { getReader: () => ({ read: () => Promise.resolve({ done: true }) }) },
    } as unknown as Response);

    await expect(fetchOEmbed("dQw4w9WgXcQ")).rejects.toThrow(
      "Unexpected response format received from YouTube."
    );
  });
});

describe("Content Schema & Converters with Video Blocks", () => {
  it("zod rejects raw YouTube URLs in youtube blocks", () => {
    const invalidBlock = {
      type: "youtube",
      videoId: "3d2bfd4e-b52b-4261-9c80-e837cb058e57",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    };

    const res = blogContentArraySchema.safeParse([invalidBlock]);
    expect(res.success).toBe(false);
  });

  it("zod rejects non-UUID videoId", () => {
    const invalidBlock = {
      type: "youtube",
      videoId: "dQw4w9WgXcQ", // 11-char youtube ID instead of UUID
    };

    const res = blogContentArraySchema.safeParse([invalidBlock]);
    expect(res.success).toBe(false);
  });

  it("zod accepts valid youtube block with internal UUID", () => {
    const validBlock = {
      type: "youtube",
      videoId: "3d2bfd4e-b52b-4261-9c80-e837cb058e57",
      caption: "Specialist consultation guide",
    };

    const res = blogContentArraySchema.safeParse([validBlock]);
    expect(res.success).toBe(true);
  });

  it("round-trips youtube blocks across converters: blocks -> editorDoc -> blocks", () => {
    const blocks = [
      {
        type: "paragraph" as const,
        runs: [{ text: "Introductory paragraph before clinical video." }],
      },
      {
        type: "youtube" as const,
        videoId: "3d2bfd4e-b52b-4261-9c80-e837cb058e57",
        caption: "Clinical demonstration of painless root canal",
      },
    ];

    const editorDoc = blocksToEditorDoc(blocks);
    const roundTripped = editorDocToBlocks(editorDoc);

    expect(roundTripped.length).toBe(2);
    expect(roundTripped[1].type).toBe("youtube");
    if (roundTripped[1].type === "youtube") {
      expect(roundTripped[1].videoId).toBe("3d2bfd4e-b52b-4261-9c80-e837cb058e57");
      expect(roundTripped[1].caption).toBe("Clinical demonstration of painless root canal");
    }
  });
});
