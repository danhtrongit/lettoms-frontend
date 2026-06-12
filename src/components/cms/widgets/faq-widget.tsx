"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  heading?: string;
  items: { q: string; a: string }[];
}

export function FaqWidget({ heading, items }: Props) {
  const [open, setOpen] = React.useState<number | null>(0);
  if (!items.length) return null;

  return (
    <section className="container-page py-8">
      <div className="mx-auto max-w-2xl">
        {heading && (
          <h2 className="mb-5 text-center text-2xl font-semibold tracking-tight">{heading}</h2>
        )}
        <div className="divide-y rounded-lg border">
          {items.map((it, i) => (
            <div key={i}>
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-3 p-4 text-left font-medium"
              >
                {it.q}
                <ChevronDownIcon
                  className={cn("size-4 shrink-0 transition-transform", open === i && "rotate-180")}
                />
              </button>
              {open === i && (
                <div className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">
                  {it.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
