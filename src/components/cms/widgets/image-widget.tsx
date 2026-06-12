import Image from "next/image";
import { cn } from "@/lib/utils";

const WIDTHS: Record<string, string> = {
  full: "max-w-none",
  wide: "max-w-4xl",
  normal: "max-w-2xl",
};

export function ImageWidget({
  src = "",
  alt = "",
  caption = "",
  width = "full",
}: {
  src?: string;
  alt?: string;
  caption?: string;
  width?: string;
}) {
  if (!src) return null;
  return (
    <section className="container-page py-6">
      <figure className={cn("mx-auto", WIDTHS[width] || WIDTHS.full)}>
        <Image
          src={src}
          alt={alt}
          width={1200}
          height={800}
          className="h-auto w-full rounded-lg object-cover"
        />
        {caption && (
          <figcaption className="mt-2 text-center text-sm text-muted-foreground">
            {caption}
          </figcaption>
        )}
      </figure>
    </section>
  );
}
