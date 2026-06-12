"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductMultiSelect } from "@/components/admin/product-multi-select";
import {
  ProvinceWardSelect,
  type AddressArea,
} from "@/components/common/province-ward-select";
import { formatVND } from "@/lib/format";
import { createAdminOrderAction } from "@/server/actions/orders";

interface Variant {
  id: string;
  colorCode: string;
  sizeCode: string;
  colorName: string;
  sizeLabel: string;
  sku: string;
  price: number;
  stock: number;
  image: string | null;
}

interface LineItem {
  productId: string;
  productName: string;
  variantId: string;
  colorCode: string;
  colorName: string;
  sizeCode: string;
  sizeLabel: string;
  sku: string;
  image: string | null;
  unitPrice: number;
  quantity: number;
}

export function AdminOrderForm() {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  // Customer
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [line1, setLine1] = React.useState("");
  const [area, setArea] = React.useState<AddressArea>({});
  const [note, setNote] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState<"cod" | "sepay">("cod");

  // Product picker
  const [pickerIds, setPickerIds] = React.useState<string[]>([]);
  const [variantsByProduct, setVariantsByProduct] = React.useState<
    Record<string, { name: string; variants: Variant[] }>
  >({});
  const [items, setItems] = React.useState<LineItem[]>([]);

  // Load variants for any newly picked product.
  React.useEffect(() => {
    const missing = pickerIds.filter((id) => !variantsByProduct[id]);
    if (!missing.length) return;
    missing.forEach((id) => {
      fetch(`/api/admin/products/${id}/variants`)
        .then((r) => r.json())
        .then((d: { name: string; variants: Variant[] }) => {
          setVariantsByProduct((prev) => ({ ...prev, [id]: d }));
        })
        .catch(() => {});
    });
  }, [pickerIds, variantsByProduct]);

  function addItem(productId: string, variant: Variant) {
    const info = variantsByProduct[productId];
    if (!info) return;
    if (items.some((it) => it.variantId === variant.id)) {
      toast.info("Biến thể đã có trong đơn");
      return;
    }
    setItems((prev) => [
      ...prev,
      {
        productId,
        productName: info.name,
        variantId: variant.id,
        colorCode: variant.colorCode,
        colorName: variant.colorName,
        sizeCode: variant.sizeCode,
        sizeLabel: variant.sizeLabel,
        sku: variant.sku,
        image: variant.image,
        unitPrice: variant.price,
        quantity: 1,
      },
    ]);
  }

  function updateQty(variantId: string, qty: number) {
    setItems((prev) =>
      prev.map((it) => (it.variantId === variantId ? { ...it, quantity: Math.max(1, qty) } : it))
    );
  }

  function removeItem(variantId: string) {
    setItems((prev) => prev.filter((it) => it.variantId !== variantId));
  }

  const subtotal = items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);

  function submit() {
    if (!name || !phone) {
      toast.error("Nhập tên và số điện thoại khách hàng");
      return;
    }
    if (!items.length) {
      toast.error("Thêm ít nhất một sản phẩm");
      return;
    }
    startTransition(async () => {
      const res = await createAdminOrderAction({
        customerName: name,
        customerPhone: phone,
        customerEmail: email || "",
        shippingAddress: {
          fullName: name,
          phone,
          email: email || undefined,
          line1,
          ward: area.wardName,
          wardCode: area.wardCode,
          province: area.provinceName,
          provinceCode: area.provinceCode,
        },
        note: note || undefined,
        paymentMethod,
        items: items.map((it) => ({
          productId: it.productId,
          name: it.productName,
          image: it.image,
          colorCode: it.colorCode,
          colorName: it.colorName,
          sizeCode: it.sizeCode,
          sizeLabel: it.sizeLabel,
          unitPrice: it.unitPrice,
          quantity: it.quantity,
        })),
      });
      if (!res.ok) {
        toast.error(res.error ?? "Tạo đơn thất bại");
        return;
      }
      toast.success(`Đã tạo đơn ${res.code}`);
      router.push("/admin/orders");
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        {/* Products */}
        <section className="space-y-4 rounded-lg border bg-background p-5">
          <h2 className="font-semibold">Sản phẩm</h2>
          <ProductMultiSelect value={pickerIds} onChange={setPickerIds} />

          {pickerIds.map((id) => {
            const info = variantsByProduct[id];
            if (!info) return null;
            return (
              <div key={id} className="space-y-2 rounded-md border p-3">
                <p className="text-sm font-medium">{info.name}</p>
                <div className="flex flex-wrap gap-2">
                  {info.variants.map((vr) => (
                    <button
                      key={vr.id}
                      type="button"
                      onClick={() => addItem(id, vr)}
                      disabled={vr.stock <= 0}
                      className="rounded-md border px-2.5 py-1 text-xs hover:border-primary disabled:opacity-40"
                    >
                      {vr.colorName} / {vr.sizeLabel} · {formatVND(vr.price)} (tồn {vr.stock})
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          {items.length > 0 && (
            <div className="space-y-2">
              {items.map((it) => (
                <div key={it.variantId} className="flex items-center gap-3 rounded-md border p-2">
                  <span className="relative size-12 shrink-0 overflow-hidden rounded border bg-muted">
                    {it.image && (
                      <Image src={it.image} alt="" fill sizes="48px" className="object-cover" />
                    )}
                  </span>
                  <div className="flex-1 text-sm">
                    <p className="font-medium">{it.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      {it.colorName} / {it.sizeLabel} · {formatVND(it.unitPrice)}
                    </p>
                  </div>
                  <Input
                    type="number"
                    min={1}
                    value={it.quantity}
                    onChange={(e) => updateQty(it.variantId, Number(e.target.value))}
                    className="h-8 w-16"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(it.variantId)}
                    className="text-destructive"
                  >
                    <Trash2Icon className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Customer */}
        <section className="space-y-4 rounded-lg border bg-background p-5">
          <h2 className="font-semibold">Khách hàng & giao hàng</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Họ tên</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Số điện thoại</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Email (tuỳ chọn)</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Địa chỉ</Label>
            <Input value={line1} onChange={(e) => setLine1(e.target.value)} placeholder="Số nhà, đường..." />
          </div>
          <ProvinceWardSelect value={area} onChange={setArea} />
          <div className="space-y-1.5">
            <Label>Ghi chú</Label>
            <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        </section>
      </div>

      {/* Summary */}
      <div className="space-y-4">
        <section className="space-y-4 rounded-lg border bg-background p-5">
          <h2 className="font-semibold">Tóm tắt</h2>
          <div className="space-y-1.5">
            <Label>Phương thức thanh toán</Label>
            <Select value={paymentMethod} onValueChange={(val) => setPaymentMethod(val as "cod" | "sepay")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cod">Thanh toán khi nhận hàng (COD)</SelectItem>
                <SelectItem value="sepay">Chuyển khoản (SePay)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tạm tính</span>
            <span className="font-medium">{formatVND(subtotal)}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Phí vận chuyển và giảm giá được tính tự động khi tạo đơn.
          </p>
          <Button onClick={submit} disabled={pending} className="w-full">
            {pending ? "Đang tạo..." : "Tạo đơn hàng"}
          </Button>
        </section>
      </div>
    </div>
  );
}
