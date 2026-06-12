import { cn } from "@/lib/utils";
import type { SlotComponent } from "@puckeditor/core";

const GRID_COLS: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

export function ColumnsWidget({
  count = 2,
  gap = 24,
  slots,
}: {
  count?: number;
  gap?: number;
  slots: SlotComponent[];
}) {
  const n = Math.min(Math.max(Number(count) || 2, 2), 4);
  const shown = slots.slice(0, n);
  return (
    <section className="container-page py-6">
      <div className={cn("grid grid-cols-1", GRID_COLS[n])} style={{ gap }}>
        {shown.map((Col, i) => (
          <Col key={i} className="space-y-4" />
        ))}
      </div>
    </section>
  );
}
