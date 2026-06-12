import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { PageShell, Prose } from "@/components/common/page-shell";

export const metadata: Metadata = buildMetadata({
  title: "Chính Sách Bảo Mật",
  description: "Cách Letom's thu thập, sử dụng và bảo vệ dữ liệu cá nhân của bạn.",
  path: "/bao-mat",
});

export default function PrivacyPage() {
  return (
    <PageShell
      title="Chính Sách Bảo Mật"
      breadcrumbs={[{ label: "Trang chủ", href: "/" }, { label: "Bảo mật" }]}
      narrow
    >
      <Prose>
        <p>
          Letom&apos;s cam kết bảo vệ quyền riêng tư và dữ liệu cá nhân của khách
          hàng.
        </p>
        <h2>Thông tin chúng tôi thu thập</h2>
        <ul>
          <li>Thông tin liên hệ: họ tên, email, số điện thoại, địa chỉ.</li>
          <li>Thông tin đơn hàng và lịch sử mua sắm.</li>
          <li>Dữ liệu sử dụng website để cải thiện trải nghiệm.</li>
        </ul>
        <h2>Cách chúng tôi sử dụng</h2>
        <ul>
          <li>Xử lý và giao đơn hàng.</li>
          <li>Hỗ trợ khách hàng và chăm sóc sau bán.</li>
          <li>Gửi thông tin khuyến mãi (nếu bạn đồng ý).</li>
        </ul>
        <h2>Bảo mật dữ liệu</h2>
        <p>
          Chúng tôi áp dụng các biện pháp kỹ thuật và tổ chức phù hợp để bảo vệ
          dữ liệu của bạn khỏi truy cập trái phép.
        </p>
      </Prose>
    </PageShell>
  );
}
