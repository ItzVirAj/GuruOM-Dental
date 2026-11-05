import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { Pool } from "@neondatabase/serverless";
import { ContentBlock, InlineRun } from "../../src/lib/blog-content";

interface LegacyBlock {
  type: string;
  [key: string]: unknown;
}

function convertBlockToV2(block: LegacyBlock): ContentBlock {
  switch (block.type) {
    case "paragraph": {
      if (Array.isArray(block.runs) && block.runs.length > 0) {
        return block as unknown as ContentBlock;
      }
      const text = typeof block.text === "string" ? block.text : "";
      return {
        type: "paragraph",
        runs: [{ text }],
      };
    }

    case "list": {
      const items = Array.isArray(block.items) ? block.items : [];
      const v2Items = items.map((item) => {
        if (Array.isArray(item)) return item as InlineRun[];
        return [{ text: typeof item === "string" ? item : "" }];
      });
      return {
        type: "list",
        ordered: Boolean(block.ordered),
        items: v2Items,
      };
    }

    case "quote": {
      if (Array.isArray(block.runs) && block.runs.length > 0) {
        return block as unknown as ContentBlock;
      }
      const text = typeof block.text === "string" ? block.text : "";
      return {
        type: "quote",
        runs: [{ text }],
        cite: typeof block.cite === "string" ? block.cite : undefined,
      };
    }

    case "callout": {
      if (Array.isArray(block.runs) && block.runs.length > 0) {
        return block as unknown as ContentBlock;
      }
      const text = typeof block.text === "string" ? block.text : "";
      const tone = (block.tone as "tip" | "note" | "warning") || "note";
      return {
        type: "callout",
        tone,
        title: typeof block.title === "string" ? block.title : "",
        runs: [{ text }],
      };
    }

    case "image": {
      const b = block as Record<string, unknown>;
      const caption = typeof b.caption === "string" ? b.caption : undefined;
      const captionRuns = Array.isArray(b.captionRuns)
        ? (b.captionRuns as InlineRun[])
        : caption
        ? [{ text: caption }]
        : undefined;

      return {
        type: "image",
        slot: typeof b.slot === "string" ? b.slot : undefined,
        alt: typeof b.alt === "string" ? b.alt : undefined,
        caption,
        captionRuns,
        layout: "normal" as const,
      };
    }

    case "heading":
    case "youtube":
    default:
      return block as unknown as ContentBlock;
  }
}

async function main() {
  const isDryRun = process.argv.includes("--dry-run");

  console.log("=================================================");
  console.log(" GuruOm Dental - Content Model v2 Migration");
  console.log(` Mode: ${isDryRun ? "DRY-RUN (Simulated)" : "LIVE MIGRATION"}`);
  console.log("=================================================\n");

  const connectionString =
    process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("[ERROR] No DATABASE_URL or DATABASE_URL_UNPOOLED found.");
    process.exit(1);
  }

  const pool = new Pool({ connectionString });

  try {
    const res = await pool.query(
      `SELECT id, slug, title, content, content_schema_version FROM posts ORDER BY created_at ASC`
    );

    console.log(`Found ${res.rows.length} total post(s) in database.\n`);

    let convertedCount = 0;
    let skippedCount = 0;

    for (const row of res.rows) {
      const rawBlocks = (row.content || []) as LegacyBlock[];
      let needsMigration = row.content_schema_version < 2;

      // Check if any block lacks runs
      if (!needsMigration) {
        for (const b of rawBlocks) {
          if (
            (b.type === "paragraph" && !Array.isArray(b.runs)) ||
            (b.type === "quote" && !Array.isArray(b.runs)) ||
            (b.type === "callout" && !Array.isArray(b.runs))
          ) {
            needsMigration = true;
            break;
          }
        }
      }

      if (!needsMigration) {
        skippedCount++;
        console.log(`[SKIPPED] "${row.title}" (${row.slug}) already in v2 format.`);
        continue;
      }

      const v2Blocks = rawBlocks.map(convertBlockToV2);

      if (!isDryRun) {
        await pool.query(
          `UPDATE posts 
           SET content = $1, content_schema_version = 2, updated_at = now() 
           WHERE id = $2`,
          [JSON.stringify(v2Blocks), row.id]
        );
      }

      convertedCount++;
      console.log(`[CONVERTED] "${row.title}" (${row.slug}) -> v2 inline runs`);
    }

    console.log("\nMigration Summary:");
    console.log(`- Converted: ${convertedCount}`);
    console.log(`- Skipped:   ${skippedCount}`);
    console.log(`- Total:     ${res.rows.length}`);

    if (isDryRun) {
      console.log("\n[DRY RUN COMPLETE] Zero database changes were written.");
    } else {
      console.log("\n[SUCCESS] Content v2 migration completed cleanly!");
    }
  } catch (error) {
    console.error("[FATAL ERROR] Migration failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
