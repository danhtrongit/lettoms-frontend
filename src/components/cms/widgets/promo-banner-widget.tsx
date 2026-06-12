import { PromoBanner } from "@/components/home/promo-banner";

export function PromoBannerWidget({
  title,
  subtitle,
  cta,
  href,
  from,
  to,
}: {
  title?: string;
  subtitle?: string;
  cta?: string;
  href?: string;
  from?: string;
  to?: string;
}) {
  return (
    <PromoBanner
      title={title || "Ưu đãi đặc biệt"}
      subtitle={subtitle || ""}
      cta={cta || "Xem ngay"}
      href={href || "/"}
      from={from || undefined}
      to={to || undefined}
    />
  );
}
