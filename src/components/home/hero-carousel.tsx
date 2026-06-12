"use client";

import { HeroCarouselWidget } from "@/components/cms/widgets/hero-carousel-widget";

const slides = [
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
  return <HeroCarouselWidget slides={slides} autoplaySeconds={5} />;
}
