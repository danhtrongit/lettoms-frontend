import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { pages } from "@/db/schema";
import type { Page } from "@/db/schema/cms";
import type { PageSettingsInput } from "@/lib/validators/cms";
import type { Data } from "@puckeditor/core";

export async function listPagesAdmin(): Promise<Page[]> {
  return db.select().from(pages).orderBy(desc(pages.updatedAt));
}

export async function getPageAdmin(id: string): Promise<Page | undefined> {
  return db.query.pages.findFirst({ where: eq(pages.id, id) });
}

export async function getPublishedPageBySlug(
  slug: string
): Promise<Page | undefined> {
  return db.query.pages.findFirst({
    where: (p, { and, eq: e }) => and(e(p.slug, slug), e(p.status, "published")),
  });
}

export async function listPublishedPageSlugs(): Promise<string[]> {
  const rows = await db
    .select({ slug: pages.slug })
    .from(pages)
    .where(eq(pages.status, "published"));
  return rows.map((r) => r.slug);
}

export async function listPublishedPagesForSitemap(): Promise<
  { slug: string; updatedAt: Date; isSystem: boolean }[]
> {
  return db
    .select({ slug: pages.slug, updatedAt: pages.updatedAt, isSystem: pages.isSystem })
    .from(pages)
    .where(eq(pages.status, "published"));
}

export async function updatePageContent(
  id: string,
  content: Data,
  status: "draft" | "published"
): Promise<void> {
  await db
    .update(pages)
    .set({ content, status, updatedAt: new Date() })
    .where(eq(pages.id, id));
}

export async function createPageShell(input: PageSettingsInput): Promise<string> {
  const [row] = await db
    .insert(pages)
    .values({
      slug: input.slug,
      title: input.title,
      status: input.status,
      content: { root: { props: {} }, content: [] } as Data,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      ogImage: input.ogImage ?? null,
    })
    .returning({ id: pages.id });
  return row.id;
}

export async function updatePageSettings(id: string, input: PageSettingsInput): Promise<void> {
  const existing = await getPageAdmin(id);
  if (!existing) throw new Error("Trang không tồn tại");
  const slug = existing.isSystem ? existing.slug : input.slug;
  await db
    .update(pages)
    .set({
      slug,
      title: input.title,
      status: input.status,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      ogImage: input.ogImage ?? null,
      updatedAt: new Date(),
    })
    .where(eq(pages.id, id));
}

export async function deletePage(id: string): Promise<void> {
  const existing = await getPageAdmin(id);
  if (!existing) throw new Error("Trang không tồn tại");
  if (existing.isSystem) {
    throw new Error("Không thể xóa trang hệ thống");
  }
  await db.delete(pages).where(eq(pages.id, id));
}
