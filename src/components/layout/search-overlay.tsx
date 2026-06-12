"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { SearchIcon, ClockIcon, StoreIcon, HelpCircleIcon, LayoutGridIcon } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types";
import { formatVND } from "@/lib/format";

const TRENDING = ["Áo thun", "Quần shorts", "AIRism", "Bra Top", "Áo khoác"];
const HISTORY_KEY = "letoms:search-history";

function loadHistory(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function SearchOverlay() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<Product[]>([]);
  const [history, setHistory] = React.useState<string[]>([]);
  const router = useRouter();

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate history from localStorage after mount
    setHistory(loadHistory());
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Debounced live search against the API route.
  React.useEffect(() => {
    const term = query.trim();
    const ctrl = new AbortController();
    const id = window.setTimeout(async () => {
      if (!term) {
        setResults([]);
        return;
      }
      try {
        const res = await fetch(
          `/api/products?q=${encodeURIComponent(term)}&limit=6`,
          { signal: ctrl.signal }
        );
        if (!res.ok) return;
        const json = (await res.json()) as { data: Product[] };
        setResults(json.data);
      } catch {
        /* aborted or network error */
      }
    }, 200);
    return () => {
      ctrl.abort();
      window.clearTimeout(id);
    };
  }, [query]);

  function pushHistory(term: string) {
    const next = [term, ...history.filter((h) => h !== term)].slice(0, 6);
    setHistory(next);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    } catch {
      /* ignore quota errors */
    }
  }

  function clearHistory() {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {
      /* ignore */
    }
  }

  function go(path: string) {
    setOpen(false);
    setQuery("");
    router.push(path);
  }

  function submitSearch(term: string) {
    if (!term.trim()) return;
    pushHistory(term.trim());
    go(`/tim-kiem?q=${encodeURIComponent(term)}`);
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Tìm kiếm"
        onClick={() => setOpen(true)}
      >
        <SearchIcon className="size-5" />
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Tìm kiếm sản phẩm"
        description="Tìm kiếm sản phẩm trên Letom's"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Tìm sản phẩm, danh mục..."
            value={query}
            onValueChange={setQuery}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitSearch(query);
            }}
          />
          <CommandList>
            <CommandEmpty>Không tìm thấy kết quả.</CommandEmpty>

            {!query && history.length > 0 && (
              <CommandGroup
                heading={
                  <span className="flex items-center justify-between">
                    Lịch sử tìm kiếm
                    <button
                      type="button"
                      onClick={clearHistory}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Xóa
                    </button>
                  </span>
                }
              >
                {history.map((h) => (
                  <CommandItem key={h} value={`history-${h}`} onSelect={() => submitSearch(h)}>
                    <ClockIcon className="size-4 text-muted-foreground" />
                    {h}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {!query && (
              <CommandGroup heading="Xu hướng tìm kiếm">
                {TRENDING.map((t) => (
                  <CommandItem key={t} value={t} onSelect={() => submitSearch(t)}>
                    <SearchIcon className="size-4 text-muted-foreground" />
                    {t}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {results.length > 0 && (
              <CommandGroup heading="Sản phẩm">
                {results.map((p) => (
                  <CommandItem
                    key={p.id}
                    value={p.id}
                    onSelect={() => go(`/san-pham/${p.id}`)}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="truncate">{p.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatVND(p.price)}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {!query && (
              <CommandGroup heading="Liên kết nhanh">
                <CommandItem value="link-categories" onSelect={() => go("/nu")}>
                  <LayoutGridIcon className="size-4 text-muted-foreground" />
                  Tìm theo danh mục
                </CommandItem>
                <CommandItem value="link-stores" onSelect={() => go("/cua-hang")}>
                  <StoreIcon className="size-4 text-muted-foreground" />
                  Hệ thống cửa hàng
                </CommandItem>
                <CommandItem value="link-faq" onSelect={() => go("/cau-hoi-thuong-gap")}>
                  <HelpCircleIcon className="size-4 text-muted-foreground" />
                  Câu hỏi thường gặp
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
