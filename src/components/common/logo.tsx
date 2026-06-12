import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** override the link target */
  href?: string;
}

/**
 * Letom's brand logo. Renders the real logo mark (logo.jpg) via next/image.
 */
export function Logo({ className, href = "/" }: LogoProps) {
  return (
    <Link
      href={href}
      aria-label="Letom's trang chủ"
      className={cn("inline-flex items-center select-none", className)}
    >
      <Image
        src="/logo.png"
        alt="Letom's"
        width={120}
        height={120}
        priority
        className="h-8 w-auto object-contain"
      />
    </Link>
  );
}
