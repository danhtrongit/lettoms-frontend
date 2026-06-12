import { eq, desc, asc } from "drizzle-orm";
import { db } from "@/db";
import { articles, articleCategories } from "@/db/schema";
import type { ArticleInput, ArticleCategoryInput } from "@/lib/validators/content";
import { renderTiptapHtml } from "@/lib/rich-text/render";
import type { JSONContent } from "@tiptap/core";

/* ----------------------------- Article Categories ----------------------------- */

export async function listArticleCategoriesAdmin() {
  return db
    .select()
    .from(articleCategories)
    .orderBy(asc(articleCategories.sortOrder));
}

export async function getArticleCategoryAdmin(id: string) {
  return db.query.articleCategories.findFirst({
    where: eq(articleCategories.id, id),
  });
}

export async function createArticleCategory(
  input: ArticleCategoryInput
): Promise<string> {
  const [row] = await db
    .insert(articleCategories)
    .values({
      slug: input.slug,
      name: input.name,
      description: input.description,
      thumbnail: input.thumbnail ?? null,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      ogImage: input.ogImage ?? null,
      sortOrder: input.sortOrder,
    })
    .returning({ id: articleCategories.id });
  return row.id;
}

export async function updateArticleCategory(
  id: string,
  input: ArticleCategoryInput
): Promise<void> {
  await db
    .update(articleCategories)
    .set({
      slug: input.slug,
      name: input.name,
      description: input.description,
      thumbnail: input.thumbnail ?? null,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      ogImage: input.ogImage ?? null,
      sortOrder: input.sortOrder,
    })
    .where(eq(articleCategories.id, id));
}

export async function deleteArticleCategory(id: string): Promise<void> {
  await db.delete(articleCategories).where(eq(articleCategories.id, id));
}

/* ----------------------------- Articles ----------------------------- */

export interface AdminArticleRow {
  id: string;
  slug: string;
  title: string;
  categoryName: string | null;
  isPublished: boolean;
  featured: boolean;
  publishedAt: Date;
}

export async function listArticlesAdmin(): Promise<AdminArticleRow[]> {
  const rows = await db
    .select()
    .from(articles)
    .orderBy(desc(articles.publishedAt));
  const cats = await db.select().from(articleCategories);
  const catName = new Map(cats.map((c) => [c.id, c.name]));

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    categoryName: r.categoryId ? catName.get(r.categoryId) ?? null : null,
    isPublished: r.isPublished,
    featured: r.featured,
    publishedAt: r.publishedAt,
  }));
}

export async function getArticleAdmin(id: string) {
  return db.query.articles.findFirst({ where: eq(articles.id, id) });
}

export async function createArticle(input: ArticleInput): Promise<string> {
  const contentJson = (input.contentJson ?? null) as JSONContent | null;
  const contentHtml = renderTiptapHtml(contentJson);
  const [row] = await db
    .insert(articles)
    .values({
      slug: input.slug,
      title: input.title,
      excerpt: input.excerpt,
      categoryId: input.categoryId || null,
      coverImage: input.coverImage ?? null,
      author: input.author,
      publishedAt: input.publishedAt ?? new Date(),
      readingMinutes: input.readingMinutes,
      body: input.body,
      contentJson,
      contentHtml,
      featured: input.featured,
      isPublished: input.isPublished,
      relatedProductIds: input.relatedProductIds,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      ogImage: input.ogImage ?? null,
    })
    .returning({ id: articles.id });
  return row.id;
}

export async function updateArticle(id: string, input: ArticleInput): Promise<void> {
  const contentJson = (input.contentJson ?? null) as JSONContent | null;
  const contentHtml = renderTiptapHtml(contentJson);
  await db
    .update(articles)
    .set({
      slug: input.slug,
      title: input.title,
      excerpt: input.excerpt,
      categoryId: input.categoryId || null,
      coverImage: input.coverImage ?? null,
      author: input.author,
      publishedAt: input.publishedAt ?? new Date(),
      readingMinutes: input.readingMinutes,
      body: input.body,
      contentJson,
      contentHtml,
      featured: input.featured,
      isPublished: input.isPublished,
      relatedProductIds: input.relatedProductIds,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      ogImage: input.ogImage ?? null,
      updatedAt: new Date(),
    })
    .where(eq(articles.id, id));
}

export async function deleteArticle(id: string): Promise<void> {
  await db.delete(articles).where(eq(articles.id, id));
}
