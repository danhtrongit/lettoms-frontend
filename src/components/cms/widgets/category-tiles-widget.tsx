import Link from "next/link";
import Image from "next/image";

export interface CategoryTile {
  image: string;
  label: string;
  href: string;
}

export function CategoryTilesWidget({ tiles = [] }: { tiles?: CategoryTile[] }) {
  const valid = tiles.filter((t) => t.image && t.label);
  if (!valid.length) return null;
  return (
    <section className="container-page py-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {valid.map((t, i) => (
          <Link key={i} href={t.href || "/"} className="group flex flex-col items-center gap-2">
            <div className="relative aspect-square w-full overflow-hidden rounded-full bg-muted">
              <Image
                src={t.image}
                alt={t.label}
                fill
                sizes="200px"
                className="object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <span className="text-sm font-medium">{t.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
