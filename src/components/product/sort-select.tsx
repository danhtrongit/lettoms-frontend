"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { SortOption } from "@/types";
import { sortLabels } from "@/lib/filter-params";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const current = (params.get("sort") as SortOption) || "recommended";

  function onChange(value: string) {
    const sp = new URLSearchParams(params.toString());
    if (value === "recommended") sp.delete("sort");
    else sp.set("sort", value);
    sp.delete("page");
    router.push(`${pathname}?${sp.toString()}`, { scroll: false });
  }

  return (
    <Select value={current} onValueChange={onChange}>
      <SelectTrigger className="w-[200px]" id="sort-select" aria-label="Sắp xếp">
        <SelectValue placeholder="Sắp xếp" />
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(sortLabels) as SortOption[]).map((s) => (
          <SelectItem key={s} value={s}>
            {sortLabels[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
