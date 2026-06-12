"use client";

import * as React from "react";
import { HeartIcon, ShoppingBagIcon, CheckIcon } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";
import { Price } from "@/components/common/price";
import { QuantityStepper } from "@/components/common/quantity-stepper";
import { Gallery } from "./gallery";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";

export function ProductInfo({ product }: { product: Product }) {
  const [colorCode, setColorCode] = React.useState(product.colors[0]?.code);
  const [sizeCode, setSizeCode] = React.useState<string | undefined>(undefined);
  const [qty, setQty] = React.useState(1);

  const addItem = useCart((s) => s.addItem);
  const wished = useWishlist((s) => s.ids.includes(product.id));
  const toggleWish = useWishlist((s) => s.toggle);

  const color = product.colors.find((c) => c.code === colorCode);
  const size = product.sizes.find((s) => s.code === sizeCode);

  function handleAdd() {
    if (!size) {
      toast.error("Vui lòng chọn kích cỡ");
      return;
    }
    if (!color) return;
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image:
        product.images.find((i) => i.colorCode === color.code)?.src ??
        product.images[0]?.src ??
        "",
      price: product.price,
      colorCode: color.code,
      colorName: color.name,
      sizeCode: size.code,
      sizeLabel: size.label,
      quantity: qty,
    });
    toast.success("Đã thêm vào giỏ hàng", {
      description: `${product.name} · ${color.name} · ${size.label}`,
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
      <Gallery product={product} colorHex={color?.hex} colorCode={colorCode} />

      <div className="lg:max-w-md">
        <div className="flex flex-wrap gap-2">
          {product.flags.includes("new") && <Badge>MỚI</Badge>}
          {product.flags.includes("bestseller") && (
            <Badge variant="secondary">BÁN CHẠY</Badge>
          )}
        </div>

        <h1 className="mt-3 text-2xl font-semibold tracking-tight">
          {product.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Mã: {product.id}</p>

        <div className="mt-4">
          <Price
            price={product.price}
            originalPrice={product.originalPrice}
            size="lg"
          />
        </div>

        {/* Color selection */}
        <div className="mt-6">
          <p className="mb-2 text-sm font-medium">
            Màu sắc: <span className="text-muted-foreground">{color?.name}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((c) => (
              <button
                key={c.code}
                type="button"
                title={c.name}
                aria-label={c.name}
                aria-pressed={c.code === colorCode}
                onClick={() => setColorCode(c.code)}
                className={cn(
                  "size-9 overflow-hidden rounded-full border-2 bg-cover bg-center transition-all",
                  c.code === colorCode
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-border"
                )}
                style={
                  c.chip
                    ? { backgroundImage: `url(${c.chip})` }
                    : { backgroundColor: c.hex }
                }
              />
            ))}
          </div>
        </div>

        {/* Size selection */}
        <div className="mt-6">
          <p className="mb-2 text-sm font-medium">Kích cỡ</p>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s.code}
                type="button"
                disabled={!s.inStock}
                aria-pressed={s.code === sizeCode}
                onClick={() => setSizeCode(s.code)}
                className={cn(
                  "min-w-12 rounded-md border px-3 py-2 text-sm transition-colors",
                  s.code === sizeCode
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-foreground",
                  !s.inStock && "cursor-not-allowed opacity-40 line-through"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity + actions */}
        <div className="mt-6 flex items-center gap-3">
          <QuantityStepper value={qty} onChange={setQty} />
        </div>

        <div className="mt-4 flex gap-3">
          <Button
            size="lg"
            className="flex-1 rounded-full"
            onClick={handleAdd}
          >
            <ShoppingBagIcon className="size-4" />
            Thêm vào giỏ
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-full"
            aria-label="Yêu thích"
            aria-pressed={wished}
            onClick={() => toggleWish(product.id)}
          >
            <HeartIcon
              className={cn("size-4", wished && "fill-destructive text-destructive")}
            />
          </Button>
        </div>

        {/* Short highlights */}
        <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <CheckIcon className="size-4 text-primary" /> Miễn phí giao hàng cho đơn từ 499.000 VND
          </li>
          <li className="flex items-center gap-2">
            <CheckIcon className="size-4 text-primary" /> Đổi trả trong 30 ngày
          </li>
        </ul>
      </div>
    </div>
  );
}
