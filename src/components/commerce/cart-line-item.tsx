"use client";

import Link from "next/link";
import { Trash2Icon } from "lucide-react";
import type { CartItem } from "@/types";
import { formatVND } from "@/lib/format";
import { QuantityStepper } from "@/components/common/quantity-stepper";
import { ProductImage } from "@/components/product/product-image";
import { useCart } from "@/store/cart";

export function CartLineItem({ item }: { item: CartItem }) {
  const updateQuantity = useCart((s) => s.updateQuantity);
  const removeItem = useCart((s) => s.removeItem);

  return (
    <div className="flex gap-4 py-4">
      <Link
        href={`/san-pham/${item.productId}`}
        className="relative aspect-3/4 w-20 shrink-0 overflow-hidden rounded-md bg-muted sm:w-24"
      >
        <ProductImage src={item.image} alt={item.name} sizes="96px" />
      </Link>

      <div className="flex flex-1 flex-col">
        <div className="flex justify-between gap-2">
          <div>
            <Link
              href={`/san-pham/${item.productId}`}
              className="text-sm font-medium hover:underline"
            >
              {item.name}
            </Link>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {item.colorName} · {item.sizeLabel}
            </p>
          </div>
          <button
            type="button"
            aria-label="Xóa sản phẩm"
            onClick={() => removeItem(item.productId, item.colorCode, item.sizeCode)}
            className="h-fit text-muted-foreground transition-colors hover:text-destructive"
          >
            <Trash2Icon className="size-4" />
          </button>
        </div>

        <div className="mt-auto flex items-center justify-between pt-3">
          <QuantityStepper
            value={item.quantity}
            onChange={(q) =>
              updateQuantity(item.productId, item.colorCode, item.sizeCode, q)
            }
          />
          <span className="text-sm font-semibold">
            {formatVND(item.price * item.quantity)}
          </span>
        </div>
      </div>
    </div>
  );
}
