import { describe, it, expect } from "vitest";
import {
  detectStandaloneYouTubeUrl,
  findYouTubeUrlInText,
} from "../src/lib/editor/youtube-url";
import { blogContentArraySchema } from "../src/lib/blog-content";
import { blocksToEditorDoc, editorDocToBlocks } from "../src/lib/editor/converters";

describe("Standalone YouTube paste detection", () => {
  it("detects standard, short, shorts, live, and bare YouTube URLs", () => {
    expect(
      detectStandaloneYouTubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
    ).toEqual({
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      youtubeId: "dQw4w9WgXcQ",
    });

    expect(
      detectStandaloneYouTubeUrl("  https://youtu.be/dQw4w9WgXcQ?t=30  ")
    ).toEqual({
      url: "https://youtu.be/dQw4w9WgXcQ?t=30",
      youtubeId: "dQw4w9WgXcQ",
    });

    expect(
      detectStandaloneYouTubeUrl("youtube.com/shorts/a-B_1234567")
    ).toEqual({
      url: "https://youtube.com/shorts/a-B_1234567",
      youtubeId: "a-B_1234567",
    });
  });

  it("ignores multi-word text, playlists, channels, and insecure links", () => {
    expect(
      detectStandaloneYouTubeUrl("Watch this video https://youtu.be/dQw4w9WgXcQ today")
    ).toBeNull();
    expect(
      detectStandaloneYouTubeUrl("https://www.youtube.com/playlist?list=PL123456")
    ).toBeNull();
    expect(
      detectStandaloneYouTubeUrl("http://www.youtube.com/watch?v=dQw4w9WgXcQ")
    ).toBeNull();
    expect(
      detectStandaloneYouTubeUrl("https://evil-youtube.com/watch?v=dQw4w9WgXcQ")
    ).toBeNull();
  });

  it("extracts inline YouTube URLs jammed inside existing prose", () => {
    const match = findYouTubeUrlInText(
      "This is a test for YT embed Linkshttps://www.youtube.com/watch?v=scJH8HA8zAM"
    );
    expect(match?.youtubeId).toBe("scJH8HA8zAM");
    expect(match?.url).toBe("https://www.youtube.com/watch?v=scJH8HA8zAM");
  });
});

describe("YouTube block visibility persistence", () => {
  it("validates and round-trips visible: false across schema and converters", () => {
    const blocks = [
      {
        type: "youtube" as const,
        videoId: "3d2bfd4e-b52b-4261-9c80-e837cb058e57",
        visible: false,
        caption: "Hidden clinical walkthrough",
      },
    ];

    expect(blogContentArraySchema.safeParse(blocks).success).toBe(true);

    const doc = blocksToEditorDoc(blocks, {
      "3d2bfd4e-b52b-4261-9c80-e837cb058e57": {
        id: "3d2bfd4e-b52b-4261-9c80-e837cb058e57",
        title: "Clinical Walkthrough",
        thumbnailUrl: "https://res.cloudinary.com/demo/image/upload/sample.webp",
        youtubeId: "dQw4w9WgXcQ",
        status: "published",
      },
    });

    expect(doc.content[0].attrs?.visible).toBe(false);
    expect(doc.content[0].attrs?.title).toBe("Clinical Walkthrough");

    const back = editorDocToBlocks(doc);
    expect(back[0]).toEqual({
      type: "youtube",
      videoId: "3d2bfd4e-b52b-4261-9c80-e837cb058e57",
      visible: false,
      caption: "Hidden clinical walkthrough",
      captionRuns: [{ text: "Hidden clinical walkthrough" }],
    });
  });
});
