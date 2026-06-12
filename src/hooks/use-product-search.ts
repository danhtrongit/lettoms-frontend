"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/types";

export const TRENDING = ["Áo thun", "Quần shorts", "AIRism", "Bra Top", "Áo khoác"];
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

export interface ProductSearch {
  query: string;
  setQuery: (q: string) => void;
  results: Product[];
  history: string[];
  clearHistory: () => void;
  submitSearch: (term: string) => void;
  goto: (path: string) => void;
}

/** Shared product-search state: live results (via API) + persistent history. */
export function useProductSearch(onNavigate?: () => void): ProductSearch {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<Product[]>([]);
  const [history, setHistory] = React.useState<string[]>([]);
  const router = useRouter();

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from localStorage after mount
    setHistory(loadHistory());
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
          `/api/products?q=${encodeURIComponent(term)}&limit=8`,
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

  const pushHistory = React.useCallback((term: string) => {
    setHistory((prev) => {
      const next = [term, ...prev.filter((h) => h !== term)].slice(0, 8);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      } catch {
        /* ignore quota errors */
      }
      return next;
    });
  }, []);

  const clearHistory = React.useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const goto = React.useCallback(
    (path: string) => {
      setQuery("");
      onNavigate?.();
      router.push(path);
    },
    [router, onNavigate]
  );

  const submitSearch = React.useCallback(
    (term: string) => {
      if (!term.trim()) return;
      pushHistory(term.trim());
      goto(`/tim-kiem?q=${encodeURIComponent(term.trim())}`);
    },
    [pushHistory, goto]
  );

  return { query, setQuery, results, history, clearHistory, submitSearch, goto };
}
