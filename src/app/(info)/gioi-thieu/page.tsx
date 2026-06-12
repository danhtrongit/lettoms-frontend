import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/data/site";
import { PageShell, Prose } from "@/components/common/page-shell";

export const metadata: Metadata = buildMetadata({
  title: "Về Letom's",
  description: `Câu chuyện thương hiệu Letom's — ${siteConfig.tagline}`,
  path: "/gioi-thieu",
});

export default function AboutPage() {
  return (
    <PageShell
      title="Về Letom's"
      description={siteConfig.tagline}
      breadcrumbs={[{ label: "Trang chủ", href: "/" }, { label: "Về Letom's" }]}
      narrow
    >
      <Prose>
        <p>
          Letom&apos;s là thương hiệu thời trang LifeWear của Việt Nam, mang đến
          quần áo cơ bản, chất lượng cao với thiết kế tối giản và bền bỉ. Chúng
          tôi tin rằng quần áo tốt nhất là quần áo bạn mặc mỗi ngày.
        </p>
        <h2>Triết lý LifeWear</h2>
        <p>
          LifeWear là quần áo được tạo ra để làm cho cuộc sống của mọi người tốt
          đẹp hơn. Đơn giản, chất lượng và được thiết kế chu đáo đến từng chi
          tiết — để phù hợp với nhịp sống hiện đại.
        </p>
        <h2>Cam kết của chúng tôi</h2>
        <ul>
          <li>Chất liệu cao cấp, an toàn cho người dùng và môi trường.</li>
          <li>Thiết kế tối giản, dễ phối, phù hợp mọi dịp.</li>
          <li>Giá hợp lý nhờ tối ưu chuỗi cung ứng.</li>
          <li>Dịch vụ khách hàng tận tâm.</li>
        </ul>
        <h2 id="careers">Tuyển dụng</h2>
        <p>
          Chúng tôi luôn tìm kiếm những con người đam mê. Gửi hồ sơ về{" "}
          {siteConfig.email} để cùng đồng hành.
        </p>
      </Prose>
    </PageShell>
  );
}
