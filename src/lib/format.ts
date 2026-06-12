import type { Product } from "@/types";

/** Format a number as VND currency, e.g. 391000 -> "391.000 VND" */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + " VND";
}

/** Discount percentage from original -> current price. */
export function discountPercent(price: number, originalPrice?: number): number {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

/** Slugify a Vietnamese string into a URL-safe slug. */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** Format an ISO date string into vi-VN long date. */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Whether a product is currently on sale. */
export function isOnSale(product: Product): boolean {
  return !!product.originalPrice && product.originalPrice > product.price;
}

/** The primary image for a product (optionally for a given color). */
export function primaryImage(product: Product, colorCode?: string): string {
  if (colorCode) {
    const match = product.images.find((i) => i.colorCode === colorCode);
    if (match) return match.src;
  }
  return product.images[0]?.src ?? "";
}
