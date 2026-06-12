import { eq } from "drizzle-orm";
import { db } from "@/db";
import { menus } from "@/db/schema";
import type { MenuNode } from "@/db/schema/cms";

export async function getMenu(key: "header" | "footer"): Promise<MenuNode[] | null> {
  const row = await db.query.menus.findFirst({ where: eq(menus.key, key) });
  return row?.items ?? null;
}

export async function saveMenu(key: "header" | "footer", items: MenuNode[]): Promise<void> {
  await db
    .insert(menus)
    .values({ key, items, updatedAt: new Date() })
    .onConflictDoUpdate({ target: menus.key, set: { items, updatedAt: new Date() } });
}
