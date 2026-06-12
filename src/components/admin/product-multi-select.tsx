"use client";
/* eslint-disable react-hooks/set-state-in-effect -- data-fetching effects intentionally sync API → state */

import * as React from "react";
import Image from "next/image";
import { SearchIcon, XIcon, Loader2Icon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatVND } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ProductLite {
  id: string;
  name: string;
  slug: string;
  price: number;
  thumbnail?: string | null;
  images?: { src: string }[];
}

function thumb(p: ProductLite): string | null {
  return p.thumbnail || p.images?.[0]?.src || null;
}

interface Props {
  /** Selected product ids */
  value: string[];
  onChange: (ids: string[]) => void;
  className?: string;
}

/**
 * Searchable multi-select for products. Used for "related products" and
 * (single-select mode via parent) admin order item picking.
 * Resolves initial ids to display chips, searches /api/products?q=.
 */
export function ProductMultiSelect({ value, onChange, className }: Props) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<ProductLite[]>([]);
  const [selected, setSelected] = React.useState<ProductLite[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  // Resolve initial ids → product chips.
  React.useEffect(() => {
    if (!value.length) {
      setSelected([]);
      return;
    }
    const missing = value.filter((id) => !selected.some((s) => s.id === id));
    if (!missing.length) return;
    fetch(`/api/products?ids=${missing.join(",")}`)
      .then((r) => r.json())
      .then((d: { data: ProductLite[] }) => {
        setSelected((prev) => {
          const merged = [...prev];
          for (const p of d.data ?? []) {
            if (!merged.some((m) => m.id === p.id)) merged.push(p);
          }
          return merged.filter((m) => value.includes(m.id));
        });
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Debounced search.
  React.useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(() => {
      fetch(`/api/products?q=${encodeURIComponent(query)}&limit=8`)
        .then((r) => r.json())
        .then((d: { data: ProductLite[] }) => setResults(d.data ?? []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  function add(p: ProductLite) {
    if (value.includes(p.id)) return;
    setSelected((prev) => [...prev, p]);
    onChange([...value, p.id]);
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  function remove(id: string) {
    setSelected((prev) => prev.filter((p) => p.id !== id));
    onChange(value.filter((v) => v !== id));
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Tìm sản phẩm theo tên..."
          className="pl-9"
        />
        {loading && (
          <Loader2Icon className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
        {open && results.length > 0 && (
          <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border bg-popover shadow-md">
            {results.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => add(p)}
                disabled={value.includes(p.id)}
                className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted disabled:opacity-40"
              >
                <span className="relative size-9 shrink-0 overflow-hidden rounded border bg-muted">
                  {thumb(p) && (
                    <Image src={thumb(p)!} alt="" fill sizes="36px" className="object-cover" />
                  )}
                </span>
                <span className="flex-1 truncate">{p.name}</span>
                <span className="text-xs text-muted-foreground">{formatVND(p.price)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((p) => (
            <span
              key={p.id}
              className="flex items-center gap-1.5 rounded-full border bg-muted/40 py-1 pl-1 pr-2 text-xs"
            >
              <span className="relative size-5 overflow-hidden rounded-full bg-muted">
                {thumb(p) && (
                  <Image src={thumb(p)!} alt="" fill sizes="20px" className="object-cover" />
                )}
              </span>
              <span className="max-w-[160px] truncate">{p.name}</span>
              <button type="button" onClick={() => remove(p.id)} className="text-muted-foreground hover:text-destructive">
                <XIcon className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
