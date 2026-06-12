"use client";

import * as React from "react";

/** Fetch JSON data for builder-canvas widgets ({ data: T[] } shape). */
export function useWidgetData<T>(url: string): { data: T[] | null; loading: boolean } {
  const [data, setData] = React.useState<T[] | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(url)
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((json: { data: T[] }) => {
        if (!cancelled) setData(json.data);
      })
      .catch(() => {
        if (!cancelled) setData([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return { data, loading };
}
