"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  SearchIcon,
  ClockIcon,
  StoreIcon,
  HelpCircleIcon,
  LayoutGridIcon,
  XIcon,
} from "lucide-react";
import type { Gender, NavItem } from "@/types";
import { getCategoriesByGender } from "@/data/categories";
import { formatVND } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useProductSearch, TRENDING } from "@/hooks/use-product-search";

/** Compact dropdown panel for DB-driven header items that have children (columns) but no gender. */
function ColumnsPanel({ columns, onNavigate }: { columns: NavItem["columns"]; onNavigate: () => void }) {
  if (!columns?.length) return null;
  return (
    <div className="container-page py-4">
      <div className="flex flex-wrap gap-8">
        {columns.map((col) => (
          <div key={col.title} className="min-w-[160px] space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {col.title}
            </p>
            <ul className="space-y-1.5">
              {col.items.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onNavigate}
                    className="block text-sm text-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Full-width category grid shown in the mega-menu panel. */
function MegaPanel({ gender, onNavigate }: { gender: Gender; onNavigate: () => void }) {
  const cats = getCategoriesByGender(gender);
  return (
    <div className="container-page py-8">
      <div className="grid grid-cols-5 gap-x-8 gap-y-8">
        {cats.map((cat) => (
          <div key={cat.slug} className="space-y-3">
            <Link
              href={`/${gender}/${cat.slug}`}
              onClick={onNavigate}
              className="group block"
            >
              <div className="relative mb-2 aspect-square overflow-hidden rounded-lg bg-muted">
                {cat.iconImage && (
                  <Image
                    src={cat.iconImage}
                    alt={cat.name}
                    fill
                    sizes="160px"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                )}
              </div>
              <span className="text-sm font-semibold text-foreground group-hover:underline">
                {cat.name}
              </span>
            </Link>
            <ul className="space-y-1.5">
              {cat.subcategories.map((sub) => (
                <li key={sub.slug}>
                  <Link
                    href={`/${gender}/${cat.slug}/${sub.slug}`}
                    onClick={onNavigate}
                    className="block text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {sub.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Full-width search panel with live results, history, trending and quick links. */
function SearchPanel({
  search,
  inputRef,
}: {
  search: ReturnType<typeof useProductSearch>;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const { query, setQuery, results, history, clearHistory, submitSearch, goto } = search;

  return (
    <div className="container-page py-6">
      <div className="mx-auto max-w-3xl">
        {/* Input */}
        <div className="flex items-center gap-3 rounded-full border border-input bg-background px-5 py-3 shadow-sm focus-within:border-foreground">
          <SearchIcon className="size-5 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitSearch(query);
            }}
            placeholder="Tìm sản phẩm, danh mục..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            aria-label="Tìm kiếm sản phẩm"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Xóa"
              className="text-muted-foreground hover:text-foreground"
            >
              <XIcon className="size-4" />
            </button>
          )}
        </div>

        <div className="mt-6 grid gap-8 sm:grid-cols-2">
          {/* Left: results or history+trending */}
          <div className="space-y-6">
            {query && results.length > 0 && (
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Sản phẩm
                </h3>
                <ul className="space-y-1">
                  {results.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => goto(`/san-pham/${p.id}`)}
                        className="flex w-full items-center justify-between gap-3 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                      >
                        <span className="truncate">{p.name}</span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatVND(p.price)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {query && results.length === 0 && (
              <p className="text-sm text-muted-foreground">Không tìm thấy kết quả.</p>
            )}

            {!query && history.length > 0 && (
              <div>
                <h3 className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Lịch sử tìm kiếm
                  <button
                    type="button"
                    onClick={clearHistory}
                    className="text-xs font-normal normal-case hover:text-foreground"
                  >
                    Xóa
                  </button>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {history.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => submitSearch(h)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm hover:border-foreground"
                    >
                      <ClockIcon className="size-3.5 text-muted-foreground" />
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!query && (
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Xu hướng tìm kiếm
                </h3>
                <div className="flex flex-wrap gap-2">
                  {TRENDING.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => submitSearch(t)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm hover:bg-muted/70"
                    >
                      <SearchIcon className="size-3.5 text-muted-foreground" />
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: quick links */}
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Liên kết nhanh
            </h3>
            <ul className="space-y-1">
              <li>
                <button
                  type="button"
                  onClick={() => goto("/nu")}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted"
                >
                  <LayoutGridIcon className="size-4 text-muted-foreground" />
                  Tìm theo danh mục
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => goto("/cua-hang")}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted"
                >
                  <StoreIcon className="size-4 text-muted-foreground" />
                  Hệ thống cửa hàng
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => goto("/cau-hoi-thuong-gap")}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted"
                >
                  <HelpCircleIcon className="size-4 text-muted-foreground" />
                  Câu hỏi thường gặp
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DesktopNavProps {
  nav: NavItem[];
}

export function DesktopNav({ nav }: DesktopNavProps) {
  const [open, setOpen] = React.useState<string | null>(null);
  const [headerBottom, setHeaderBottom] = React.useState(0);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const close = React.useCallback(() => setOpen(null), []);
  const search = useProductSearch(close);

  const measure = React.useCallback(() => {
    const header = rootRef.current?.closest("header");
    if (header) setHeaderBottom(header.getBoundingClientRect().bottom);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, measure, close]);

  // Focus the search input when the search panel opens.
  React.useEffect(() => {
    if (open === "search") {
      const id = window.setTimeout(() => inputRef.current?.focus(), 50);
      return () => window.clearTimeout(id);
    }
  }, [open]);

  function openPanel(key: string) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(key);
  }

  function scheduleClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(null), 120);
  }

  return (
    <div
      ref={rootRef}
      className="hidden flex-1 items-center lg:flex"
      onMouseLeave={scheduleClose}
      onMouseEnter={() => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
      }}
    >
      {/* Nav triggers */}
      <nav className="flex items-center">
        {nav.map((item) =>
          item.gender ? (
            <button
              key={item.label}
              type="button"
              onMouseEnter={() => openPanel(item.gender!)}
              onFocus={() => openPanel(item.gender!)}
              onClick={() => setOpen((o) => (o === item.gender ? null : item.gender!))}
              aria-expanded={open === item.gender}
              className={cn(
                "inline-flex h-16 items-center px-3 text-sm font-medium uppercase tracking-wide transition-colors hover:text-primary",
                open === item.gender && "text-primary"
              )}
            >
              {item.label}
            </button>
          ) : item.columns?.length ? (
            <button
              key={item.label}
              type="button"
              onMouseEnter={() => openPanel(item.label)}
              onFocus={() => openPanel(item.label)}
              onClick={() => setOpen((o) => (o === item.label ? null : item.label))}
              aria-expanded={open === item.label}
              className={cn(
                "inline-flex h-16 items-center px-3 text-sm font-medium uppercase tracking-wide transition-colors hover:text-primary",
                open === item.label && "text-primary"
              )}
            >
              {item.label}
            </button>
          ) : (
            <Link
              key={item.label}
              href={item.href}
              onMouseEnter={() => setOpen(null)}
              className="inline-flex h-16 items-center px-3 text-sm font-medium uppercase tracking-wide transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          )
        )}
      </nav>

      {/* Search pill */}
      <button
        type="button"
        onClick={() => setOpen((o) => (o === "search" ? null : "search"))}
        onMouseEnter={() => {
          if (closeTimer.current) clearTimeout(closeTimer.current);
        }}
        aria-label="Tìm kiếm"
        aria-expanded={open === "search"}
        className={cn(
          "ml-auto flex h-10 w-56 items-center gap-2 rounded-full border border-input bg-muted/50 px-4 text-sm text-muted-foreground transition-colors hover:border-foreground xl:w-72",
          open === "search" && "border-foreground bg-background"
        )}
      >
        <SearchIcon className="size-4" />
        <span>Tìm kiếm sản phẩm...</span>
      </button>

      {/* Full-width panel + backdrop, fused seamlessly to the header */}
      {open && (
        <>
          <button
            type="button"
            aria-label="Đóng"
            tabIndex={-1}
            onClick={close}
            className="fixed inset-x-0 bottom-0 z-30 animate-in fade-in bg-black/30"
            style={{ top: headerBottom }}
          />
          <div
            data-nav-open
            className="absolute inset-x-0 top-full z-40 max-h-[80vh] overflow-y-auto bg-background shadow-[0_18px_32px_-18px_rgba(0,0,0,0.28)] animate-in fade-in slide-in-from-top-1"
            onMouseEnter={() => {
              if (closeTimer.current) clearTimeout(closeTimer.current);
            }}
          >
            {open === "search" ? (
              <SearchPanel search={search} inputRef={inputRef} />
            ) : (() => {
              // Check if the open key matches a columns-only nav item
              const columnsItem = nav.find((i) => !i.gender && i.columns?.length && i.label === open);
              if (columnsItem) {
                return <ColumnsPanel columns={columnsItem.columns} onNavigate={close} />;
              }
              return <MegaPanel gender={open as Gender} onNavigate={close} />;
            })()}
          </div>
        </>
      )}
    </div>
  );
}
