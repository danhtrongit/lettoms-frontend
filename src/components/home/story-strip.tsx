import Link from "next/link";
import type { Article } from "@/types";
import { SectionHeading } from "@/components/common/section-heading";
import { articleCategories } from "@/data/articles";
import { formatDate } from "@/lib/format";

interface StoryStripProps {
  articles: Article[];
}

const tints = ["#232C66", "#B0202E", "#3A6EA5", "#4A6B4A"];

export function StoryStrip({ articles }: StoryStripProps) {
  if (!articles.length) return null;
  return (
    <section className="container-page py-12">
      <SectionHeading
        title="Câu Chuyện Letom's"
        description="Phong cách, cảm hứng và hậu trường thương hiệu."
        href="/tin-tuc"
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {articles.slice(0, 3).map((a, i) => {
          const cat = articleCategories.find((c) => c.slug === a.category);
          return (
            <Link
              key={a.slug}
              href={`/tin-tuc/${a.category}/${a.slug}`}
              className="group block"
            >
              <div
                className="aspect-video overflow-hidden rounded-lg"
                style={{
                  background: `linear-gradient(135deg, ${tints[i % tints.length]} 0%, ${tints[i % tints.length]}99 100%)`,
                }}
              />
              <div className="mt-3 space-y-1">
                <span className="text-xs font-medium uppercase tracking-wide text-primary">
                  {cat?.name}
                </span>
                <h3 className="line-clamp-2 font-semibold leading-snug group-hover:underline">
                  {a.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {formatDate(a.publishedAt)} · {a.readingMinutes} phút đọc
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
