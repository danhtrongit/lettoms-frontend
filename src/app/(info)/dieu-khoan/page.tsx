import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { PageShell, Prose } from "@/components/common/page-shell";

export const metadata: Metadata = buildMetadata({
  title: "Điều Khoản Sử Dụng",
  description: "Điều khoản và điều kiện sử dụng website Letom's.",
  path: "/dieu-khoan",
});

export default function TermsPage() {
  return (
    <PageShell
      title="Điều Khoản Sử Dụng"
      breadcrumbs={[{ label: "Trang chủ", href: "/" }, { label: "Điều khoản" }]}
      narrow
    >
      <Prose>
        <p>
          Bằng việc truy cập và sử dụng website Letom&apos;s, bạn đồng ý tuân thủ
          các điều khoản và điều kiện dưới đây.
        </p>
        <h2>Sử dụng website</h2>
        <p>
          Bạn cam kết sử dụng website cho mục đích hợp pháp và không gây ảnh
          hưởng đến quyền lợi của bên thứ ba.
        </p>
        <h2>Sản phẩm và giá cả</h2>
        <p>
          Chúng tôi nỗ lực đảm bảo thông tin sản phẩm và giá cả chính xác. Giá có
          thể thay đổi mà không cần báo trước.
        </p>
        <h2>Quyền sở hữu trí tuệ</h2>
        <p>
          Toàn bộ nội dung trên website thuộc quyền sở hữu của Letom&apos;s và
          được bảo vệ bởi luật sở hữu trí tuệ.
        </p>
      </Prose>
    </PageShell>
  );
}
