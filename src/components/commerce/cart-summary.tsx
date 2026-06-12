"use client";

import Link from "next/link";
import { formatVND } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface CartSummaryProps {
  subtotal: number;
  /** show the checkout CTA */
  showCheckout?: boolean;
}

const FREE_SHIP_THRESHOLD = 499000;

export function CartSummary({ subtotal, showCheckout = true }: CartSummaryProps) {
  const shipping = subtotal >= FREE_SHIP_THRESHOLD || subtotal === 0 ? 0 : 30000;
  const total = subtotal + shipping;
  const remaining = Math.max(0, FREE_SHIP_THRESHOLD - subtotal);

  return (
    <div className="rounded-lg border p-5">
      <h2 className="text-lg font-semibold">Tóm tắt đơn hàng</h2>

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Tạm tính</dt>
          <dd>{formatVND(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Phí vận chuyển</dt>
          <dd>{shipping === 0 ? "Miễn phí" : formatVND(shipping)}</dd>
        </div>
      </dl>

      {remaining > 0 && (
        <p className="mt-3 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
          Mua thêm {formatVND(remaining)} để được miễn phí giao hàng.
        </p>
      )}

      <Separator className="my-4" />

      <div className="flex justify-between text-base font-semibold">
        <span>Tổng cộng</span>
        <span>{formatVND(total)}</span>
      </div>

      {showCheckout && (
        <Button asChild size="lg" className="mt-5 w-full rounded-full">
          <Link href="/thanh-toan">Tiến hành thanh toán</Link>
        </Button>
      )}
    </div>
  );
}
