import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { PageShell } from "@/components/common/page-shell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = buildMetadata({
  title: "Câu Hỏi Thường Gặp",
  description: "Giải đáp các thắc mắc thường gặp khi mua sắm tại Letom's.",
  path: "/cau-hoi-thuong-gap",
});

const faqs = [
  {
    q: "Làm thế nào để đặt hàng?",
    a: "Chọn sản phẩm, kích cỡ và màu sắc, thêm vào giỏ hàng rồi tiến hành thanh toán theo hướng dẫn.",
  },
  {
    q: "Thời gian giao hàng là bao lâu?",
    a: "Giao hàng tiêu chuẩn 3-5 ngày làm việc, giao nhanh 1-2 ngày làm việc tùy khu vực.",
  },
  {
    q: "Chính sách đổi trả như thế nào?",
    a: "Bạn có thể đổi trả trong vòng 30 ngày kể từ ngày nhận hàng, với sản phẩm còn nguyên tem mác.",
  },
  {
    q: "Tôi có được miễn phí giao hàng không?",
    a: "Đơn hàng từ 499.000 VND được miễn phí giao hàng tiêu chuẩn trên toàn quốc.",
  },
  {
    q: "Làm sao để chọn đúng kích cỡ?",
    a: "Vui lòng tham khảo Hướng Dẫn Chọn Size để tìm kích cỡ phù hợp nhất với bạn.",
  },
];

export default function FaqPage() {
  return (
    <PageShell
      title="Câu Hỏi Thường Gặp"
      breadcrumbs={[
        { label: "Trang chủ", href: "/" },
        { label: "Trợ giúp", href: "/ho-tro" },
        { label: "FAQ" },
      ]}
      narrow
    >
      <Accordion type="single" collapsible>
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`faq-${i}`}>
            <AccordionTrigger className="text-left text-sm font-medium">
              {f.q}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              {f.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </PageShell>
  );
}
