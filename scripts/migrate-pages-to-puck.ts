import { config } from "dotenv";
config({ path: ".env.local" });

import { eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { pages } from "@/db/schema";
import { legacyBlocksToPuckData } from "@/lib/builder/migrate-legacy";

async function main() {
  const rows = await db.select().from(pages).where(isNull(pages.content));
  console.log(`Migrating ${rows.length} page(s) to Puck format...`);
  for (const row of rows) {
    const data = legacyBlocksToPuckData(row.blocks);
    await db.update(pages).set({ content: data }).where(eq(pages.id, row.id));
    console.log(`  ✓ ${row.slug} (${row.blocks.length} blocks)`);
  }
  console.log("Done.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
