import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ButtonWidget({
  label,
  href,
  variant = "default",
  align = "left",
}: {
  label: string;
  href: string;
  variant?: "default" | "outline" | "secondary";
  align?: string;
}) {
  return (
    <section
      className={cn("container-page flex py-4", {
        "justify-start": align === "left",
        "justify-center": align === "center",
        "justify-end": align === "right",
      })}
    >
      <Button asChild variant={variant} className="rounded-full">
        <Link href={href || "/"}>{label || "Xem thêm"}</Link>
      </Button>
    </section>
  );
}
