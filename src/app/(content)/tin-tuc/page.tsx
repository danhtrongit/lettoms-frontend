import type { Metadata } from "next";
import Link from "next/link";
import { getArticles, getFeaturedArticles } from "@/lib/api/articles";
import { getAllArticleCategories } from "@/lib/repos/articles.repo";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { FeaturedArticle } from "@/components/article/featured-article";
import { ArticleCard } from "@/components/article/article-card";
import { SectionHeading } from "@/components/common/section-heading";

export const metadata: Metadata = buildMetadata({
  title: "Tin Tức & Câu Chuyện",
  description:
    "Phong cách, câu chuyện thương hiệu, bền vững và hợp tác — tất cả tin tức mới nhất từ Letom's.",
  path: "/tin-tuc",
});

export default async function NewsPage() {
  const [featuredList, all, articleCategories] = await Promise.all([
    getFeaturedArticles(1),
    getArticles(),
    getAllArticleCategories(),
  ]);
  const featured = featuredList[0];
  const rest = all.filter((a) => a.slug !== featured?.slug);

  return (
    <div className="container-page py-6">
      <Breadcrumbs items={[{ label: "Trang chủ", href: "/" }, { label: "Tin tức" }]} />

      <h1 className="mt-4 mb-6 text-3xl font-semibold tracking-tight">
        Tin Tức & Câu Chuyện
      </h1>

      {/* Category chips */}
      <div className="mb-8 flex flex-wrap gap-2">
        {articleCategories.map((c) => (
          <Link
            key={c.slug}
            href={`/tin-tuc/${c.slug}`}
            className="rounded-full border px-4 py-1.5 text-sm transition-colors hover:border-primary hover:text-primary"
          >
            {c.name}
          </Link>
        ))}
      </div>

      {featured && (
        <div className="mb-12">
          <FeaturedArticle article={featured} />
        </div>
      )}

      <SectionHeading title="Bài viết mới nhất" />
      <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((a) => (
          <ArticleCard key={a.slug} article={a} />
        ))}
      </div>
    </div>
  );
}
