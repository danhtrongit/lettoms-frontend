"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

interface Slide {
  image: string;
  alt: string;
  href: string;
}

const slides: Slide[] = [
  {
    image: "/banners/banner-1.jpg",
    alt: "Bộ sưu tập mới Letom's",
    href: "/uu-dai/hang-moi",
  },
  {
    image: "/banners/banner-2.jpg",
    alt: "Ưu đãi đặc biệt Letom's",
    href: "/uu-dai/khuyen-mai",
  },
];

export function HeroCarousel() {
  const autoplay = React.useMemo(
    () => Autoplay({ delay: 5000, stopOnInteraction: false }),
    []
  );

  return (
    <Carousel opts={{ loop: true }} plugins={[autoplay]} className="w-full">
      <CarouselContent>
        {slides.map((s, i) => (
          <CarouselItem key={s.image}>
            <Link
              href={s.href}
              className="relative block aspect-[2000/762] w-full overflow-hidden bg-muted"
            >
              <Image
                src={s.image}
                alt={s.alt}
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
