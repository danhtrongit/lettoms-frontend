"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCart, selectCartTotal } from "@/store/cart";
import { CartSummary } from "@/components/commerce/cart-summary";
import { EmptyState } from "@/components/common/empty-state";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ProvinceWardSelect,
  type AddressArea,
} from "@/components/common/province-ward-select";
import { useHydrated } from "@/hooks/use-hydrated";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const subtotal = useCart(selectCartTotal);
  const clear = useCart((s) => s.clear);
  const mounted = useHydrated();

  const [pending, setPending] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState<"cod" | "sepay">("cod");
  const [area, setArea] = React.useState<AddressArea>({});

  async function placeOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setPending(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: fd.get("fullname"),
          customerPhone: fd.get("phone"),
          customerEmail: fd.get("email") || "",
          shippingAddress: {
            fullName: fd.get("fullname"),
            phone: fd.get("phone"),
            email: fd.get("email") || undefined,
            line1: fd.get("address"),
            ward: area.wardName || undefined,
            wardCode: area.wardCode || undefined,
            province: area.provinceName || undefined,
            provinceCode: area.provinceCode || undefined,
          },
          note: fd.get("note") || undefined,
          paymentMethod,
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            image: i.image,
            colorCode: i.colorCode,
            colorName: i.colorName,
            sizeCode: i.sizeCode,
            sizeLabel: i.sizeLabel,
            unitPrice: i.price,
            quantity: i.quantity,
          })),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Đặt hàng thất bại");
        return;
      }

      clear();
      const code = json.data.code as string;
      if (json.data.paymentMethod === "sepay") {
        router.push(`/dat-hang/${code}/thanh-toan`);
      } else {
        router.push(`/dat-hang/${code}`);
      }
    } catch {
      toast.error("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setPending(false);
    }
  }

  if (!mounted) return <div className="container-page py-20" />;

  if (items.length === 0) {
    return (
      <div className="container-page py-6">
        <Breadcrumbs items={[{ label: "Trang chủ", href: "/" }, { label: "Thanh toán" }]} />
        <div className="mt-6">
          <EmptyState
            title="Không có gì để thanh toán"
            description="Giỏ hàng của bạn đang trống."
            actionLabel="Tiếp tục mua sắm"
            actionHref="/nu"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-6">
      <Breadcrumbs items={[{ label: "Trang chủ", href: "/" }, { label: "Thanh toán" }]} />
      <h1 className="mt-4 mb-6 text-2xl font-semibold tracking-tight sm:text-3xl">
        Thanh toán
      </h1>

      <form onSubmit={placeOrder} className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <section>
            <h2 className="mb-4 text-lg font-semibold">Thông tin giao hàng</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="fullname">Họ và tên</Label>
                <Input id="fullname" name="fullname" required autoComplete="name" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input id="phone" name="phone" type="tel" required autoComplete="tel" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="email">Email (tùy chọn)</Label>
                <Input id="email" name="email" type="email" autoComplete="email" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="address">Địa chỉ</Label>
                <Input id="address" name="address" required autoComplete="street-address" />
              </div>
              <div className="sm:col-span-2">
                <ProvinceWardSelect value={area} onChange={setArea} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="note">Ghi chú (tùy chọn)</Label>
                <Textarea id="note" name="note" rows={2} />
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold">Phương thức thanh toán</h2>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(v) => setPaymentMethod(v as "cod" | "sepay")}
              className="gap-3"
            >
              <Label
                htmlFor="pay-cod"
                className="flex items-center gap-3 rounded-lg border p-4"
              >
                <RadioGroupItem value="cod" id="pay-cod" />
                <span className="text-sm font-medium">
                  Thanh toán khi nhận hàng (COD)
                </span>
              </Label>
              <Label
                htmlFor="pay-sepay"
                className="flex items-center gap-3 rounded-lg border p-4"
              >
                <RadioGroupItem value="sepay" id="pay-sepay" />
                <span className="text-sm font-medium">
                  Chuyển khoản ngân hàng (VietQR / SePay)
                </span>
              </Label>
            </RadioGroup>
          </section>
        </div>

        <div className="lg:sticky lg:top-24 lg:h-fit">
          <CartSummary subtotal={subtotal} showCheckout={false} />
          <Button
            type="submit"
            size="lg"
            className="mt-4 w-full rounded-full"
            disabled={pending}
          >
            {pending ? "Đang xử lý..." : "Đặt hàng"}
          </Button>
        </div>
      </form>
    </div>
  );
}
