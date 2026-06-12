import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { getOrderById } from "@/lib/repos/orders.repo";
import { formatVND, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { OrderStatusUpdater } from "@/components/admin/order-status-updater";
import {
  PAYMENT_STATUS_LABEL,
  PAYMENT_METHOD_LABEL,
} from "@/lib/order-status";

export const metadata = { title: "Chi tiết đơn hàng" };

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const addr = order.shippingAddress;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link href="/admin/orders">
              <ArrowLeftIcon className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Đơn {order.code}</h1>
            <p className="text-sm text-muted-foreground">
              {formatDate(order.createdAt.toISOString())}
            </p>
          </div>
        </div>
        <OrderStatusUpdater id={order.id} current={order.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Items */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded-lg border bg-background">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40 text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Sản phẩm</th>
                  <th className="px-4 py-3 font-medium">SKU</th>
                  <th className="px-4 py-3 font-medium">SL</th>
                  <th className="px-4 py-3 font-medium">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((it) => (
                  <tr key={it.id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium">{it.nameSnapshot}</p>
                      <p className="text-xs text-muted-foreground">
                        {it.colorName} · {it.sizeLabel}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{it.sku}</td>
                    <td className="px-4 py-3">{it.quantity}</td>
                    <td className="px-4 py-3">{formatVND(it.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-lg border bg-background p-4 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Tạm tính</span>
              <span>{formatVND(order.subtotal)}</span>
            </div>
            <div className="mt-1 flex justify-between text-muted-foreground">
              <span>Phí vận chuyển</span>
              <span>{order.shippingFee === 0 ? "Miễn phí" : formatVND(order.shippingFee)}</span>
            </div>
            <div className="mt-2 flex justify-between border-t pt-2 text-base font-semibold">
              <span>Tổng cộng</span>
              <span>{formatVND(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Customer + payment */}
        <div className="space-y-4">
          <div className="rounded-lg border bg-background p-4 text-sm">
            <h2 className="mb-2 font-semibold">Khách hàng</h2>
            <p>{order.customerName}</p>
            <p className="text-muted-foreground">{order.customerPhone}</p>
            {order.customerEmail && (
              <p className="text-muted-foreground">{order.customerEmail}</p>
            )}
          </div>

          <div className="rounded-lg border bg-background p-4 text-sm">
            <h2 className="mb-2 font-semibold">Địa chỉ giao hàng</h2>
            <p>{addr.fullName} · {addr.phone}</p>
            <p className="text-muted-foreground">
              {[addr.line1, addr.ward, addr.district, addr.province]
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>

          <div className="rounded-lg border bg-background p-4 text-sm">
            <h2 className="mb-2 font-semibold">Thanh toán</h2>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phương thức</span>
              <span>{PAYMENT_METHOD_LABEL[order.paymentMethod]}</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-muted-foreground">Trạng thái</span>
              <span>{PAYMENT_STATUS_LABEL[order.paymentStatus]}</span>
            </div>
            {order.sepayRef && (
              <div className="mt-1 flex justify-between">
                <span className="text-muted-foreground">Mã GD</span>
                <span>{order.sepayRef}</span>
              </div>
            )}
          </div>

          {order.note && (
            <div className="rounded-lg border bg-background p-4 text-sm">
              <h2 className="mb-2 font-semibold">Ghi chú</h2>
              <p className="text-muted-foreground">{order.note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
