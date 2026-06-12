// Run this BEFORE applying migration 0003 (blocks column drop).
// After the column has been dropped this script is a no-op (returns 0 rows).
import { config } from "dotenv";
config({ path: ".env.local" });

import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { pages } from "@/db/schema";
import { legacyBlocksToPuckData, type PageBlock } from "@/lib/builder/migrate-legacy";

type LegacyRow = { id: string; slug: string; blocks: PageBlock[] };

async function main() {
  // SELECT via raw SQL to avoid compile errors after the typed column was removed.
  const result = await db.execute<LegacyRow>(
    sql`SELECT id, slug, blocks FROM pages WHERE content IS NULL`
  );
  const rows = result.rows as LegacyRow[];
  console.log(`Migrating ${rows.length} page(s) to Puck format...`);
  for (const row of rows) {
    const data = legacyBlocksToPuckData(row.blocks ?? []);
    await db.update(pages).set({ content: data }).where(eq(pages.id, row.id));
    console.log(`  ✓ ${row.slug} (${(row.blocks ?? []).length} blocks)`);
  }
  console.log("Done.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
