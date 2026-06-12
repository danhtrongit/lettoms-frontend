"use client";

import { SlidersHorizontalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { FilterControls, ClearFiltersButton } from "./filter-controls";

interface Facets {
  colors: { code: string; name: string; hex: string }[];
  sizes: { code: string; label: string }[];
  minPrice: number;
  maxPrice: number;
}

export function FilterDrawer({ facets }: { facets: Facets }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden">
          <SlidersHorizontalIcon className="size-4" />
          Bộ lọc
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex w-[88vw] max-w-sm flex-col">
        <SheetHeader>
          <SheetTitle>Bộ lọc</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4">
          <FilterControls facets={facets} />
        </div>
        <SheetFooter className="flex-row gap-2">
          <ClearFiltersButton />
          <SheetClose asChild>
            <Button className="flex-1 rounded-full">Xem kết quả</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
