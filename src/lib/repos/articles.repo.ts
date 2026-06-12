import { cache } from "react";
import { db } from "@/db";
import type { Article, ArticleCategory, ArticleCategorySlug } from "@/types";

export const getAllArticles = cache(async (): Promise<Article[]> => {
  const [rows, cats] = await Promise.all([
    db.query.articles.findMany({
      where: (a, { eq }) => eq(a.isPublished, true),
    }),
    db.query.articleCategories.findMany(),
  ]);
  const catSlugById = new Map(cats.map((c) => [c.id, c.slug]));

  return rows.map((r) => ({
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    category: (r.categoryId
      ? catSlugById.get(r.categoryId)
      : "tin-tuc") as ArticleCategorySlug,
    coverImage: r.coverImage ?? "",
    author: r.author,
    publishedAt: r.publishedAt.toISOString().slice(0, 10),
    readingMinutes: r.readingMinutes,
    body: r.body,
    contentHtml: r.contentHtml ?? null,
    featured: r.featured,
    relatedProductIds: r.relatedProductIds,
  }));
});

export const getAllArticleCategories = cache(
  async (): Promise<ArticleCategory[]> => {
    const rows = await db.query.articleCategories.findMany({
      orderBy: (c, { asc }) => asc(c.sortOrder),
    });
    return rows.map((c) => ({
      slug: c.slug as ArticleCategorySlug,
      name: c.name,
      description: c.description,
    }));
  }
);
