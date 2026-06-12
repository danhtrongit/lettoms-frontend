"use client";

import * as React from "react";

/** Fetch JSON data for builder-canvas widgets ({ data: T[] } shape). */
export function useWidgetData<T>(url: string): { data: T[] | null; loading: boolean } {
  // Keeping the source url next to the items lets `loading` derive from a
  // simple comparison instead of a synchronous setState in the effect.
  const [result, setResult] = React.useState<{ url: string; items: T[] } | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    fetch(url)
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((json: { data: T[] }) => {
        if (!cancelled) setResult({ url, items: json.data });
      })
      .catch(() => {
        if (!cancelled) setResult({ url, items: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  const loading = result?.url !== url;
  return { data: loading ? null : result!.items, loading };
}
