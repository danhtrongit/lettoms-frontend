import { notFound } from "next/navigation";
import {
  getArticleAdmin,
  listArticleCategoriesAdmin,
} from "@/lib/repos/content-admin.repo";
import { ArticleForm } from "@/components/admin/article-form";
import type { JSONContent } from "@tiptap/core";

export const metadata = { title: "Sửa bài viết" };

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [article, cats] = await Promise.all([
    getArticleAdmin(id),
    listArticleCategoriesAdmin(),
  ]);
  if (!article) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Sửa bài viết</h1>
      <ArticleForm
        id={article.id}
        categories={cats.map((c) => ({ id: c.id, name: c.name }))}
        initial={{
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          categoryId: article.categoryId,
          coverImage: article.coverImage,
          author: article.author,
          readingMinutes: article.readingMinutes,
          contentJson: (article.contentJson as JSONContent | null) ?? null,
          featured: article.featured,
          isPublished: article.isPublished,
          relatedProductIds: article.relatedProductIds,
          seoTitle: article.seoTitle,
          seoDescription: article.seoDescription,
        }}
      />
    </div>
  );
}
