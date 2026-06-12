import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2Icon } from "lucide-react";
import { getOrderByCode } from "@/lib/repos/orders.repo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Button } from "@/components/ui/button";
import { formatVND } from "@/lib/format";

export const metadata = { title: "Đặt hàng thành công", robots: { index: false } };

const STATUS_LABEL: Record<string, string> = {
  pending: "Chờ xử lý",
  paid: "Đã thanh toán",
  processing: "Đang xử lý",
  shipped: "Đang giao",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
  refunded: "Đã hoàn tiền",
};

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const order = await getOrderByCode(code);
  if (!order) notFound();

  return (
    <div className="container-page py-6">
      <Breadcrumbs
        items={[{ label: "Trang chủ", href: "/" }, { label: "Đơn hàng" }]}
      />

      <div className="mx-auto mt-8 max-w-2xl">
        <div className="flex flex-col items-center text-center">
          <CheckCircle2Icon className="size-14 text-green-600" />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">
            Đặt hàng thành công!
          </h1>
          <p className="mt-2 text-muted-foreground">
            Mã đơn hàng của bạn: <span className="font-semibold text-foreground">{order.code}</span>
          </p>
          {order.paymentMethod === "cod" ? (
            <p className="mt-1 text-sm text-muted-foreground">
              Bạn sẽ thanh toán khi nhận hàng. Chúng tôi sẽ liên hệ sớm để xác nhận.
            </p>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">
              Trạng thái thanh toán:{" "}
              {order.paymentStatus === "paid" ? "Đã thanh toán" : "Chờ thanh toán"}
            </p>
          )}
        </div>

        <div className="mt-8 rounded-xl border bg-background p-5">
          <div className="flex items-center justify-between border-b pb-3">
            <span className="text-sm text-muted-foreground">Trạng thái</span>
            <span className="font-medium">{STATUS_LABEL[order.status] ?? order.status}</span>
          </div>

          <div className="divide-y">
            {order.items.map((it) => (
              <div key={it.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium">{it.nameSnapshot}</p>
                  <p className="text-xs text-muted-foreground">
                    {it.colorName} · {it.sizeLabel} · SL {it.quantity}
                  </p>
                </div>
                <span>{formatVND(it.lineTotal)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-1.5 border-t pt-3 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Tạm tính</span>
              <span>{formatVND(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Phí vận chuyển</span>
              <span>{order.shippingFee === 0 ? "Miễn phí" : formatVND(order.shippingFee)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <span>Tổng cộng</span>
              <span>{formatVND(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/">Về trang chủ</Link>
          </Button>
          <Button asChild>
            <Link href="/tai-khoan/don-hang">Xem đơn hàng của tôi</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
