import Link from "next/link";
import Image from "next/image";
import type { Category, Gender } from "@/types";

export interface FeaturedCategoriesWidgetProps {
  heading?: string;
  gender?: string;
  limit?: number;
}

export function FeaturedCategoriesView({
  heading,
  gender,
  categories,
  limit,
}: {
  heading?: string;
  gender?: string;
  categories: Category[];
  limit?: number;
}) {
  const shown = categories.slice(0, limit || 6);
  return (
    <section className="container-page py-8">
      {heading && (
        <h2 className="mb-4 text-2xl font-semibold tracking-tight">{heading}</h2>
      )}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {shown.map((c) => (
          <Link
            key={c.slug}
            href={`/${(gender as Gender) || "nu"}/${c.slug}`}
            className="group flex flex-col items-center gap-2"
          >
            <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
              {c.heroImage && (
                <Image
                  src={c.heroImage}
                  alt={c.name}
                  fill
                  sizes="200px"
                  className="object-cover transition-transform group-hover:scale-105"
                />
              )}
            </div>
            <span className="text-sm font-medium">{c.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
