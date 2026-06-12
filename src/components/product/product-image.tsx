"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ProductPlaceholder } from "./product-placeholder";

interface ProductImageProps {
  src: string;
  alt: string;
  /** hex used to tint the fallback placeholder */
  hex?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

/**
 * Renders a real product photo via next/image, falling back to the
 * brand-tinted placeholder if the image fails to load.
 */
export function ProductImage({
  src,
  alt,
  hex,
  className,
  sizes = "(max-width: 768px) 50vw, 25vw",
  priority,
}: ProductImageProps) {
  const [failed, setFailed] = React.useState(false);

  if (failed || !src) {
    return <ProductPlaceholder hex={hex} label={alt} className={className} />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={cn("object-cover", className)}
      onError={() => setFailed(true)}
    />
  );
}
