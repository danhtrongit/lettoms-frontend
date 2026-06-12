"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  className,
}: QuantityStepperProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border",
        className
      )}
    >
      <button
        type="button"
        aria-label="Giảm số lượng"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="grid size-9 place-items-center rounded-full text-foreground disabled:opacity-40"
      >
        <MinusIcon className="size-4" />
      </button>
      <span className="min-w-8 text-center text-sm tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        aria-label="Tăng số lượng"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="grid size-9 place-items-center rounded-full text-foreground disabled:opacity-40"
      >
        <PlusIcon className="size-4" />
      </button>
    </div>
  );
}
