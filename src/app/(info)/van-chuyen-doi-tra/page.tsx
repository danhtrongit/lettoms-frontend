import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { PageShell, Prose } from "@/components/common/page-shell";

export const metadata: Metadata = buildMetadata({
  title: "Vận Chuyển & Đổi Trả",
  description: "Chính sách vận chuyển và đổi trả của Letom's.",
  path: "/van-chuyen-doi-tra",
});

export default function ShippingReturnsPage() {
  return (
    <PageShell
      title="Vận Chuyển & Đổi Trả"
      breadcrumbs={[
        { label: "Trang chủ", href: "/" },
        { label: "Trợ giúp", href: "/ho-tro" },
        { label: "Vận chuyển & Đổi trả" },
      ]}
      narrow
    >
      <Prose>
        <h2>Vận chuyển</h2>
        <ul>
          <li>Giao hàng tiêu chuẩn: 3-5 ngày làm việc.</li>
          <li>Giao hàng nhanh: 1-2 ngày làm việc (phí 40.000 VND).</li>
          <li>Miễn phí giao hàng cho đơn từ 499.000 VND.</li>
        </ul>
        <h2>Đổi trả</h2>
        <ul>
          <li>Đổi trả trong vòng 30 ngày kể từ ngày nhận hàng.</li>
          <li>Sản phẩm còn nguyên tem mác, chưa qua sử dụng.</li>
          <li>Hoàn tiền trong 7-14 ngày làm việc sau khi nhận hàng đổi trả.</li>
        </ul>
        <p>
          Để yêu cầu đổi trả, vui lòng liên hệ trung tâm trợ giúp với mã đơn hàng
          của bạn.
        </p>
      </Prose>
    </PageShell>
  );
}
