import Link from "next/link";
import type { Article } from "@/types";
import { articleCategories } from "@/data/articles";
import { formatDate } from "@/lib/format";

const tints: Record<string, string> = {
  style: "#232C66",
  stories: "#B0202E",
  sustainability: "#4A6B4A",
  collaborations: "#3A6EA5",
  news: "#6B6B3A",
};

export function FeaturedArticle({ article }: { article: Article }) {
  const cat = articleCategories.find((c) => c.slug === article.category);
  return (
    <Link
      href={`/tin-tuc/${article.category}/${article.slug}`}
      className="group grid overflow-hidden rounded-xl border md:grid-cols-2"
    >
      <div
        className="aspect-video md:aspect-auto"
        style={{
          background: `linear-gradient(135deg, ${tints[article.category]} 0%, ${tints[article.category]}99 100%)`,
        }}
      />
      <div className="flex flex-col justify-center gap-3 p-6 sm:p-10">
        <span className="text-xs font-medium uppercase tracking-wide text-primary">
          {cat?.name}
        </span>
        <h2 className="text-2xl font-semibold leading-tight group-hover:underline sm:text-3xl">
          {article.title}
        </h2>
        <p className="text-muted-foreground">{article.excerpt}</p>
        <p className="text-xs text-muted-foreground">
          {formatDate(article.publishedAt)} · {article.readingMinutes} phút đọc
        </p>
      </div>
    </Link>
  );
}
