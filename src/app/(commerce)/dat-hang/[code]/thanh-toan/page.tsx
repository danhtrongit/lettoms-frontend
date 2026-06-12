import { notFound, redirect } from "next/navigation";
import { getOrderByCode } from "@/lib/repos/orders.repo";
import { vietQrUrl, sepayAccountInfo, paymentContent } from "@/lib/payments/sepay";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { SepayPaymentClient } from "@/components/commerce/sepay-payment-client";

export const metadata = { title: "Thanh toán chuyển khoản", robots: { index: false } };

export default async function SepayPaymentPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const order = await getOrderByCode(code);
  if (!order) notFound();

  // COD orders or already-paid orders skip this page.
  if (order.paymentMethod !== "sepay" || order.paymentStatus === "paid") {
    redirect(`/dat-hang/${code}`);
  }

  const qrUrl = vietQrUrl({ amount: order.total, orderCode: order.code });
  const account = sepayAccountInfo();
  const content = paymentContent(order.code);

  return (
    <div className="container-page py-6">
      <Breadcrumbs
        items={[{ label: "Trang chủ", href: "/" }, { label: "Thanh toán" }]}
      />
      <SepayPaymentClient
        code={order.code}
        total={order.total}
        qrUrl={qrUrl}
        account={account.account}
        bank={account.bank}
        accountName={account.accountName}
        content={content}
      />
    </div>
  );
}
