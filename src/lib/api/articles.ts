import type { Article, ArticleCategorySlug } from "@/types";
import { getAllArticles, getAllArticleCategories } from "@/lib/repos/articles.repo";

export async function getArticles(
  category?: ArticleCategorySlug
): Promise<Article[]> {
  const articles = await getAllArticles();
  const list = category
    ? articles.filter((a) => a.category === category)
    : articles;
  return [...list].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function getFeaturedArticles(limit = 2): Promise<Article[]> {
  const articles = await getAllArticles();
  return articles.filter((a) => a.featured).slice(0, limit);
}

export async function getArticleBySlug(
  slug: string
): Promise<Article | undefined> {
  const articles = await getAllArticles();
  return articles.find((a) => a.slug === slug);
}

export async function getArticleCategory(slug: string) {
  const cats = await getAllArticleCategories();
  return cats.find((c) => c.slug === slug);
}

export async function getRelatedArticles(
  article: Article,
  limit = 3
): Promise<Article[]> {
  const articles = await getAllArticles();
  return articles
    .filter((a) => a.slug !== article.slug && a.category === article.category)
    .slice(0, limit);
}
