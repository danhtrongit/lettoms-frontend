import type { Metadata } from "next";
import Link from "next/link";
import {
  TruckIcon,
  RotateCcwIcon,
  RulerIcon,
  HelpCircleIcon,
  MailIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { PageShell } from "@/components/common/page-shell";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = buildMetadata({
  title: "Trung Tâm Trợ Giúp",
  description: "Hỗ trợ khách hàng Letom's: vận chuyển, đổi trả, kích cỡ và liên hệ.",
  path: "/ho-tro",
});

const links = [
  { icon: TruckIcon, title: "Vận chuyển", desc: "Thời gian & phí giao hàng", href: "/van-chuyen-doi-tra" },
  { icon: RotateCcwIcon, title: "Đổi trả", desc: "Chính sách đổi trả 30 ngày", href: "/van-chuyen-doi-tra" },
  { icon: RulerIcon, title: "Hướng dẫn chọn size", desc: "Bảng size chi tiết", href: "/huong-dan-size" },
  { icon: HelpCircleIcon, title: "Câu hỏi thường gặp", desc: "Giải đáp nhanh", href: "/cau-hoi-thuong-gap" },
  { icon: MailIcon, title: "Liên hệ", desc: "Gửi câu hỏi cho chúng tôi", href: "/lien-he" },
  { icon: ShieldCheckIcon, title: "Chính sách bảo mật", desc: "Bảo vệ dữ liệu của bạn", href: "/bao-mat" },
];

export default function CustomerServicePage() {
  return (
    <PageShell
      title="Trung Tâm Trợ Giúp"
      description="Chúng tôi có thể giúp gì cho bạn?"
      breadcrumbs={[{ label: "Trang chủ", href: "/" }, { label: "Trợ giúp" }]}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((l) => (
          <Link key={l.title} href={l.href}>
            <Card className="h-full transition-colors hover:border-primary">
              <CardContent className="flex items-start gap-3">
                <l.icon className="size-6 text-primary" />
                <div>
                  <h3 className="font-medium">{l.title}</h3>
                  <p className="text-sm text-muted-foreground">{l.desc}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
