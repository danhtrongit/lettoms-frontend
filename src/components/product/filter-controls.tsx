"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { formatVND } from "@/lib/format";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Facets {
  colors: { code: string; name: string; hex: string }[];
  sizes: { code: string; label: string }[];
  minPrice: number;
  maxPrice: number;
}

interface FilterControlsProps {
  facets: Facets;
  /** called after any change, e.g. to close a drawer */
  onApply?: () => void;
}

const FLAG_OPTIONS = [
  { code: "new", label: "Hàng mới" },
  { code: "sale", label: "Đang giảm giá" },
  { code: "bestseller", label: "Bán chạy" },
  { code: "limited", label: "Giới hạn" },
];

export function FilterControls({ facets, onApply }: FilterControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const selected = React.useCallback(
    (key: string): string[] => {
      const raw = params.get(key);
      return raw ? raw.split(",").filter(Boolean) : [];
    },
    [params]
  );

  function toggleValue(key: string, value: string) {
    const sp = new URLSearchParams(params.toString());
    const cur = selected(key);
    const next = cur.includes(value)
      ? cur.filter((v) => v !== value)
      : [...cur, value];
    if (next.length) sp.set(key, next.join(","));
    else sp.delete(key);
    sp.delete("page");
    router.push(`${pathname}?${sp.toString()}`, { scroll: false });
    onApply?.();
  }

  const selectedColors = selected("colors");
  const selectedSizes = selected("sizes");
  const selectedFlags = selected("flags");

  return (
    <Accordion
      type="multiple"
      defaultValue={["color", "size", "flags"]}
      className="w-full"
    >
      <AccordionItem value="color">
        <AccordionTrigger className="text-sm font-semibold">Màu sắc</AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-wrap gap-2 pt-1">
            {facets.colors.map((c) => {
              const active = selectedColors.includes(c.code);
              return (
                <button
                  key={c.code}
                  type="button"
                  title={c.name}
                  aria-pressed={active}
                  onClick={() => toggleValue("colors", c.code)}
                  className={cn(
                    "size-7 rounded-full border-2 transition-all",
                    active
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border"
                  )}
                  style={{ backgroundColor: c.hex }}
                />
              );
            })}
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="size">
        <AccordionTrigger className="text-sm font-semibold">Kích cỡ</AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-wrap gap-2 pt-1">
            {facets.sizes.map((s) => {
              const active = selectedSizes.includes(s.code);
              return (
                <button
                  key={s.code}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleValue("sizes", s.code)}
                  className={cn(
                    "min-w-11 rounded-md border px-3 py-1.5 text-sm transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-foreground"
                  )}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="flags">
        <AccordionTrigger className="text-sm font-semibold">Ưu đãi</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2.5 pt-1">
            {FLAG_OPTIONS.map((f) => (
              <div key={f.code} className="flex items-center gap-2">
                <Checkbox
                  id={`flag-${f.code}`}
                  checked={selectedFlags.includes(f.code)}
                  onCheckedChange={() => toggleValue("flags", f.code)}
                />
                <Label htmlFor={`flag-${f.code}`} className="text-sm font-normal">
                  {f.label}
                </Label>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="price">
        <AccordionTrigger className="text-sm font-semibold">Khoảng giá</AccordionTrigger>
        <AccordionContent>
          <p className="pt-1 text-sm text-muted-foreground">
            {formatVND(facets.minPrice)} – {formatVND(facets.maxPrice)}
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export function ClearFiltersButton() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const hasFilters = ["colors", "sizes", "flags", "minPrice", "maxPrice"].some(
    (k) => params.has(k)
  );
  if (!hasFilters) return null;
  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-muted-foreground"
      onClick={() => router.push(pathname, { scroll: false })}
    >
      Xóa bộ lọc
    </Button>
  );
}
