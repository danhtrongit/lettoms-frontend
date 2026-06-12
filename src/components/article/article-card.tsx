import Link from "next/link";
import type { Article } from "@/types";
import { cn } from "@/lib/utils";
import { articleCategories } from "@/data/articles";
import { formatDate } from "@/lib/format";

const tints: Record<string, string> = {
  style: "#232C66",
  stories: "#B0202E",
  sustainability: "#4A6B4A",
  collaborations: "#3A6EA5",
  news: "#6B6B3A",
};

interface ArticleCardProps {
  article: Article;
  className?: string;
}

export function ArticleCard({ article, className }: ArticleCardProps) {
  const cat = articleCategories.find((c) => c.slug === article.category);
  return (
    <Link
      href={`/tin-tuc/${article.category}/${article.slug}`}
      className={cn("group block", className)}
    >
      <div
        className="aspect-video overflow-hidden rounded-lg transition-transform duration-500 group-hover:scale-[1.02]"
        style={{
          background: `linear-gradient(135deg, ${tints[article.category]} 0%, ${tints[article.category]}99 100%)`,
        }}
      />
      <div className="mt-3 space-y-1">
        <span className="text-xs font-medium uppercase tracking-wide text-primary">
          {cat?.name}
        </span>
        <h3 className="line-clamp-2 font-semibold leading-snug group-hover:underline">
          {article.title}
        </h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {article.excerpt}
        </p>
        <p className="pt-1 text-xs text-muted-foreground">
          {formatDate(article.publishedAt)} · {article.readingMinutes} phút đọc
        </p>
      </div>
    </Link>
  );
}
