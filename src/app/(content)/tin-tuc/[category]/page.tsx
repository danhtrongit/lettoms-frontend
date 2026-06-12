import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticles, getArticleCategory } from "@/lib/api/articles";
import { getAllArticleCategories } from "@/lib/repos/articles.repo";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ArticleCard } from "@/components/article/article-card";
import { EmptyState } from "@/components/common/empty-state";
import type { ArticleCategorySlug } from "@/types";

type Params = Promise<{ category: string }>;

export async function generateStaticParams() {
  const articleCategories = await getAllArticleCategories();
  return articleCategories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = await getArticleCategory(category);
  if (!cat) return {};
  return buildMetadata({
    title: cat.name,
    description: cat.description,
    path: `/tin-tuc/${category}`,
  });
}

export default async function NewsCategoryPage({ params }: { params: Params }) {
  const { category } = await params;
  const [cat, list] = await Promise.all([
    getArticleCategory(category),
    getArticles(category as ArticleCategorySlug),
  ]);
  if (!cat) notFound();

  return (
    <div className="container-page py-6">
      <Breadcrumbs
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Tin tức", href: "/tin-tuc" },
          { label: cat.name },
        ]}
      />

      <div className="mt-4 mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">{cat.name}</h1>
        <p className="mt-1 max-w-2xl text-muted-foreground">{cat.description}</p>
      </div>

      {list.length ? (
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Chưa có bài viết"
          description="Hãy quay lại sau để xem nội dung mới."
          actionLabel="Xem tất cả tin tức"
          actionHref="/tin-tuc"
        />
      )}
    </div>
  );
}
