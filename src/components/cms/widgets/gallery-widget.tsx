import Image from "next/image";
import { cn } from "@/lib/utils";

const GRID: Record<string, string> = {
  "2": "grid-cols-2",
  "3": "grid-cols-2 sm:grid-cols-3",
  "4": "grid-cols-2 sm:grid-cols-4",
};

export function GalleryWidget({
  images = [],
  columns = "3",
}: {
  images?: { src: string }[];
  columns?: string;
}) {
  const valid = images.filter((i) => i.src);
  return (
    <section className="container-page py-6">
      <div className={cn("grid gap-3", GRID[columns] || GRID["3"])}>
        {valid.map((img, i) => (
          <div key={i} className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            <Image src={img.src} alt="" fill sizes="300px" className="object-cover" />
          </div>
        ))}
      </div>
    </section>
  );
}
