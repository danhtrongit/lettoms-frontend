import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { pages } from "@/db/schema";
import type { Page, PageBlock } from "@/db/schema/cms";
import type { PageInput } from "@/lib/validators/cms";
import { renderTiptapHtml } from "@/lib/rich-text/render";
import type { JSONContent } from "@tiptap/core";

/**
 * Walk page blocks (including nested column children) and cache the
 * sanitized HTML for any richText widget from its Tiptap JSON.
 */
function processBlocks(blocks: PageBlock[]): PageBlock[] {
  return blocks.map((b) => {
    if (b.type === "columns") {
      const cols = (Array.isArray((b.props as Record<string, unknown>).columns)
        ? ((b.props as Record<string, unknown>).columns as PageBlock[][])
        : []) as PageBlock[][];
      return {
        ...b,
        props: {
          ...b.props,
          columns: cols.map((col) => processBlocks(col)),
        },
      };
    }
    if (b.type === "richText") {
      const json = (b.props as Record<string, unknown>).contentJson as
        | JSONContent
        | null
        | undefined;
      return {
        ...b,
        props: { ...b.props, contentHtml: renderTiptapHtml(json ?? null) },
      };
    }
    return b;
  });
}

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

export async function createPage(input: PageInput): Promise<string> {
  const [row] = await db
    .insert(pages)
    .values({
      slug: input.slug,
      title: input.title,
      status: input.status,
      blocks: processBlocks(input.blocks as PageBlock[]),
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      ogImage: input.ogImage ?? null,
    })
    .returning({ id: pages.id });
  return row.id;
}

export async function updatePage(id: string, input: PageInput): Promise<void> {
  const existing = await getPageAdmin(id);
  if (!existing) throw new Error("Trang không tồn tại");
  // System pages (e.g. homepage) keep their slug — other code addresses them by it.
  const slug = existing.isSystem ? existing.slug : input.slug;
  await db
    .update(pages)
    .set({
      slug,
      title: input.title,
      status: input.status,
      blocks: processBlocks(input.blocks as PageBlock[]),
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
