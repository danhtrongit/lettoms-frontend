import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getArticleBySlug,
  getArticleCategory,
  getRelatedArticles,
} from "@/lib/api/articles";
import { getAllArticles } from "@/lib/repos/articles.repo";
import { getProductById } from "@/lib/api/products";
import { buildMetadata, articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { formatDate } from "@/lib/format";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ArticleBody } from "@/components/article/article-body";
import { RichTextContent } from "@/components/common/rich-text-content";
import { ArticleCard } from "@/components/article/article-card";
import { ProductGrid } from "@/components/product/product-grid";
import { SectionHeading } from "@/components/common/section-heading";

type Params = Promise<{ category: string; slug: string }>;

export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.map((a) => ({ category: a.category, slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};
  return buildMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/tin-tuc/${article.category}/${article.slug}`,
    image: article.coverImage,
  });
}

export default async function ArticleDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const [cat, related, relatedProductsRaw] = await Promise.all([
    getArticleCategory(article.category),
    getRelatedArticles(article),
    Promise.all((article.relatedProductIds ?? []).map((id) => getProductById(id))),
  ]);
  const relatedProducts = relatedProductsRaw.filter(
    (p): p is NonNullable<typeof p> => Boolean(p)
  );

  const breadcrumbs = [
    { label: "Trang chủ", href: "/" },
    { label: "Tin tức", href: "/tin-tuc" },
    { label: cat?.name ?? "", href: `/tin-tuc/${article.category}` },
    { label: article.title },
  ];

  const tints: Record<string, string> = {
    style: "#232C66",
    stories: "#B0202E",
    sustainability: "#4A6B4A",
    collaborations: "#3A6EA5",
    news: "#6B6B3A",
  };

  return (
    <div className="container-page py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(article)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs)) }}
      />

      <Breadcrumbs items={breadcrumbs} />

      <article className="mx-auto mt-6 max-w-3xl">
        <header className="text-center">
          <span className="text-xs font-medium uppercase tracking-wide text-primary">
            {cat?.name}
          </span>
          <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            {article.title}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {article.author} · {formatDate(article.publishedAt)} ·{" "}
            {article.readingMinutes} phút đọc
          </p>
        </header>

        <div
          className="mt-8 aspect-video rounded-xl"
          style={{
            background: `linear-gradient(135deg, ${tints[article.category]} 0%, ${tints[article.category]}99 100%)`,
          }}
        />

        <div className="mt-10">
          {article.contentHtml ? (
            <RichTextContent html={article.contentHtml} />
          ) : (
            <ArticleBody blocks={article.body} />
          )}
        </div>
      </article>

      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <SectionHeading title="Sản phẩm trong bài" />
          <ProductGrid products={relatedProducts} />
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-16">
          <SectionHeading title="Bài viết liên quan" href="/tin-tuc" />
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
