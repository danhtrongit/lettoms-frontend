import type { Metadata } from "next";
import { MapPinIcon, PhoneIcon, ClockIcon } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { stores } from "@/data/stores";
import { PageShell } from "@/components/common/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = buildMetadata({
  title: "Hệ Thống Cửa Hàng",
  description: "Tìm cửa hàng Letom's gần bạn trên toàn quốc.",
  path: "/cua-hang",
});

export default function StoresPage() {
  return (
    <PageShell
      title="Hệ Thống Cửa Hàng"
      description="Ghé thăm cửa hàng Letom's gần bạn."
      breadcrumbs={[{ label: "Trang chủ", href: "/" }, { label: "Cửa hàng" }]}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stores.map((s) => (
          <Card key={s.id}>
            <CardHeader>
              <CardTitle className="text-base">{s.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{s.city}</p>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-start gap-2">
                <MapPinIcon className="mt-0.5 size-4 shrink-0" />
                {s.address}
              </p>
              <p className="flex items-center gap-2">
                <PhoneIcon className="size-4 shrink-0" />
                {s.phone}
              </p>
              <p className="flex items-center gap-2">
                <ClockIcon className="size-4 shrink-0" />
                {s.hours}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
