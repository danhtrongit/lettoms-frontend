"use client";

import * as React from "react";
import Link from "next/link";
import { HeartIcon } from "lucide-react";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";
import { Price } from "@/components/common/price";
import { ProductImage } from "./product-image";
import { Badge } from "@/components/ui/badge";
import { useWishlist } from "@/store/wishlist";
import { useHydrated } from "@/hooks/use-hydrated";

interface ProductCardProps {
  product: Product;
  className?: string;
}

function flagBadge(product: Product) {
  if (product.flags.includes("limited"))
    return { label: "GIỚI HẠN", variant: "outline" as const, sale: false };
  if (product.originalPrice && product.originalPrice > product.price)
    return { label: "SALE", variant: "destructive" as const, sale: true };
  if (product.flags.includes("new"))
    return { label: "MỚI", variant: "default" as const, sale: false };
  if (product.flags.includes("bestseller"))
    return { label: "BÁN CHẠY", variant: "secondary" as const, sale: false };
  return null;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const wished = useWishlist((s) => s.ids.includes(product.id));
  const toggle = useWishlist((s) => s.toggle);
  const mounted = useHydrated();

  const badge = flagBadge(product);
  const href = `/san-pham/${product.id}`;
  const mainColor = product.colors[0];
  const mainImage =
    product.images.find((i) => i.colorCode === mainColor?.code) ??
    product.images[0];

  return (
    <article className={cn("group relative", className)}>
      <Link href={href} className="block">
        <div className="relative aspect-3/4 overflow-hidden rounded-md bg-muted">
          <ProductImage
            src={mainImage?.src ?? ""}
            alt={product.name}
            hex={mainColor?.hex}
            className="transition-transform duration-500 group-hover:scale-105"
          />
          {badge && (
            <Badge
              variant={badge.variant}
              className="absolute left-2 top-2 rounded-sm text-[10px] font-semibold uppercase"
            >
              {badge.label}
            </Badge>
          )}
        </div>
      </Link>

      <button
        type="button"
        aria-label={wished ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"}
        aria-pressed={mounted ? wished : undefined}
        onClick={() => toggle(product.id)}
        className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-background/80 text-foreground backdrop-blur transition-colors hover:bg-background"
      >
        <HeartIcon
          className={cn(
            "size-4",
            mounted && wished && "fill-destructive text-destructive"
          )}
        />
      </button>

      <div className="mt-3 space-y-1">
        {/* color chips */}
        <div className="flex items-center gap-1">
          {product.colors.slice(0, 5).map((c) => (
            <span
              key={c.code}
              title={c.name}
              className="size-3 overflow-hidden rounded-full border border-border bg-cover bg-center"
              style={
                c.chip
                  ? { backgroundImage: `url(${c.chip})` }
                  : { backgroundColor: c.hex }
              }
            />
          ))}
          {product.colors.length > 5 && (
            <span className="text-[10px] text-muted-foreground">
              +{product.colors.length - 5}
            </span>
          )}
        </div>
        <h3 className="line-clamp-2 text-sm leading-snug">
          <Link href={href} className="hover:underline">
            {product.name}
          </Link>
        </h3>
        <Price price={product.price} originalPrice={product.originalPrice} size="sm" />
      </div>
    </article>
  );
}
