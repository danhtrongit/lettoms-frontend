import Link from "next/link";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  className?: string;
  align?: "left" | "center";
}

export function SectionHeading({
  title,
  description,
  href,
  linkLabel = "Xem tất cả",
  className,
  align = "left",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-6 flex items-end justify-between gap-4",
        align === "center" && "flex-col items-center text-center",
        className
      )}
    >
      <div>
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="shrink-0 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
