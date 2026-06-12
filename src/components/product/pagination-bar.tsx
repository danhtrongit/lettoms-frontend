"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationBarProps {
  page: number;
  totalPages: number;
  total: number;
}

export function PaginationBar({ page, totalPages, total }: PaginationBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function goTo(p: number) {
    const sp = new URLSearchParams(params.toString());
    if (p <= 1) sp.delete("page");
    else sp.set("page", String(p));
    router.push(`${pathname}?${sp.toString()}`, { scroll: true });
  }

  if (totalPages <= 1) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        {total} sản phẩm
      </p>
    );
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      className="flex flex-col items-center gap-3"
      aria-label="Phân trang"
    >
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          disabled={page <= 1}
          onClick={() => goTo(page - 1)}
          aria-label="Trang trước"
        >
          <ChevronLeftIcon className="size-4" />
        </Button>
        {pages.map((p) => (
          <Button
            key={p}
            variant={p === page ? "default" : "outline"}
            size="icon"
            onClick={() => goTo(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn("min-w-9")}
          >
            {p}
          </Button>
        ))}
        <Button
          variant="outline"
          size="icon"
          disabled={page >= totalPages}
          onClick={() => goTo(page + 1)}
          aria-label="Trang sau"
        >
          <ChevronRightIcon className="size-4" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">{total} sản phẩm</p>
    </nav>
  );
}
