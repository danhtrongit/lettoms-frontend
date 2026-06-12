"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

export interface HeroSlide {
  image: string;
  alt?: string;
  href?: string;
}

export function HeroCarouselWidget({
  slides = [],
  autoplaySeconds = 5,
}: {
  slides?: HeroSlide[];
  autoplaySeconds?: number;
}) {
  const autoplay = React.useMemo(
    () => Autoplay({ delay: Math.max(autoplaySeconds, 2) * 1000, stopOnInteraction: false }),
    [autoplaySeconds]
  );
  const valid = slides.filter((s) => s.image);
  if (!valid.length) return null;

  return (
    <Carousel opts={{ loop: true }} plugins={[autoplay]} className="w-full">
      <CarouselContent>
        {valid.map((s, i) => (
          <CarouselItem key={`${s.image}-${i}`}>
            <Link
              href={s.href || "/"}
              className="relative block aspect-[2000/762] w-full overflow-hidden bg-muted"
            >
              <Image
                src={s.image}
                alt={s.alt ?? ""}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
              />
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
