import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PromoBannerProps {
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  from?: string;
  to?: string;
}

export function PromoBanner({
  title,
  subtitle,
  cta,
  href,
  from = "#232C66",
  to = "#3A6EA5",
}: PromoBannerProps) {
  return (
    <section className="container-page py-6">
      <div
        className="relative flex min-h-56 flex-col items-start justify-center gap-3 overflow-hidden rounded-xl p-8 text-white sm:p-12"
        style={{ background: `linear-gradient(120deg, ${from} 0%, ${to} 100%)` }}
      >
        <h2 className="text-2xl font-semibold sm:text-3xl">{title}</h2>
        <p className="max-w-md text-white/85">{subtitle}</p>
        <Button asChild variant="secondary" className="mt-2 rounded-full">
          <Link href={href}>{cta}</Link>
        </Button>
      </div>
    </section>
  );
}
