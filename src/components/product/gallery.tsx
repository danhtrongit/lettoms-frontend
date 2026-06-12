"use client";

import * as React from "react";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";
import { ProductImage } from "./product-image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

interface GalleryProps {
  product: Product;
  /** active color code to tint the placeholder */
  colorHex?: string;
  /** active color code to prioritize the matching image */
  colorCode?: string;
}

/**
 * PDP gallery showing real Uniqlo photography. The main shot follows the
 * selected color; sub shots fill the rest. Falls back to a placeholder on error.
 */
export function Gallery({ product, colorHex, colorCode }: GalleryProps) {
  const hex = colorHex ?? product.colors[0]?.hex;

  // Build an ordered image list: selected-color main first, then the rest.
  const images = React.useMemo(() => {
    const selected = colorCode
      ? product.images.filter((i) => i.colorCode === colorCode)
      : [];
    const others = product.images.filter(
      (i) => !colorCode || i.colorCode !== colorCode
    );
    const ordered = [...selected, ...others];
    return ordered.length ? ordered.slice(0, 5) : product.images.slice(0, 5);
  }, [product.images, colorCode]);

  const [active, setActive] = React.useState(0);
  // Reset to the first image when the selected color changes (render-time adjust).
  const [prevColor, setPrevColor] = React.useState(colorCode);
  if (colorCode !== prevColor) {
    setPrevColor(colorCode);
    setActive(0);
  }

  const main = images[active] ?? images[0];

  return (
    <div className="flex flex-col-reverse gap-3 lg:flex-row">
      {/* Thumbnails (desktop) */}
      <div className="hidden flex-col gap-2 lg:flex">
        {images.map((img, i) => (
          <button
            key={img.src + i}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Ảnh ${i + 1}`}
            className={cn(
              "relative aspect-3/4 w-16 overflow-hidden rounded-md border",
              active === i ? "border-primary" : "border-transparent"
            )}
          >
            <ProductImage src={img.src} alt={img.alt} hex={hex} sizes="64px" />
          </button>
        ))}
      </div>

      {/* Main (desktop) */}
      <div className="hidden flex-1 lg:block">
        <div className="relative aspect-3/4 overflow-hidden rounded-lg bg-muted">
          <ProductImage
            src={main?.src ?? ""}
            alt={product.name}
            hex={hex}
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>
      </div>

      {/* Mobile carousel */}
      <div className="lg:hidden">
        <Carousel opts={{ loop: true }}>
          <CarouselContent>
            {images.map((img, i) => (
              <CarouselItem key={img.src + i}>
                <div className="relative aspect-3/4 overflow-hidden rounded-lg bg-muted">
                  <ProductImage
                    src={img.src}
                    alt={product.name}
                    hex={hex}
                    sizes="100vw"
                    priority={i === 0}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
}
