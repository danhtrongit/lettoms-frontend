import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const HEIGHTS: Record<string, string> = {
  medium: "aspect-[21/9]",
  large: "aspect-[16/8] sm:aspect-[21/8]",
  full: "min-h-[80vh]",
};

const ALIGN: Record<string, string> = {
  left: "text-left items-start",
  center: "text-center items-center",
  right: "text-right items-end",
};

export function HeroWidget({
  image = "",
  heading = "",
  subheading = "",
  ctaLabel = "",
  ctaHref = "/",
  align = "center",
  height = "large",
}: {
  image?: string;
  heading?: string;
  subheading?: string;
  ctaLabel?: string;
  ctaHref?: string;
  align?: string;
  height?: string;
}) {
  return (
    <section className="relative overflow-hidden">
      <div className={cn("relative w-full", HEIGHTS[height] || HEIGHTS.large)}>
        {image && (
          <Image src={image} alt={heading} fill priority sizes="100vw" className="object-cover" />
        )}
        <div className="absolute inset-0 bg-black/30" />
        <div
          className={cn(
            "absolute inset-0 flex flex-col justify-center gap-3 p-8 text-white sm:p-16",
            ALIGN[align] || ALIGN.center
          )}
        >
          <h2 className="max-w-2xl text-3xl font-semibold sm:text-5xl">{heading}</h2>
          {subheading && (
            <p className="max-w-xl text-base sm:text-lg">{subheading}</p>
          )}
          {ctaLabel && (
            <Button asChild size="lg" className="mt-2 w-fit rounded-full">
              <Link href={ctaHref || "/"}>{ctaLabel}</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
