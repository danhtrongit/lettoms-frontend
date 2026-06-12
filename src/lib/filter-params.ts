import type { ProductFilter, SortOption } from "@/types";

const SORTS: SortOption[] = [
  "recommended",
  "newest",
  "price-asc",
  "price-desc",
  "bestselling",
];

type SearchParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function list(v: string | string[] | undefined): string[] | undefined {
  const s = first(v);
  if (!s) return undefined;
  return s.split(",").filter(Boolean);
}

/** Parse a ProductFilter from Next.js searchParams (server or client). */
export function parseFilterParams(params: SearchParams): ProductFilter {
  const sortRaw = first(params.sort);
  const sort = SORTS.includes(sortRaw as SortOption)
    ? (sortRaw as SortOption)
    : undefined;
  const page = Number(first(params.page)) || 1;
  const minPrice = first(params.minPrice)
    ? Number(first(params.minPrice))
    : undefined;
  const maxPrice = first(params.maxPrice)
    ? Number(first(params.maxPrice))
    : undefined;

  return {
    colors: list(params.colors),
    sizes: list(params.sizes),
    flags: list(params.flags) as ProductFilter["flags"],
    minPrice,
    maxPrice,
    query: first(params.q),
    sort,
    page,
  };
}

/** Serialize filter values into a URLSearchParams string. */
export function serializeFilterParams(
  current: URLSearchParams,
  updates: Partial<Record<string, string | string[] | number | undefined>>
): string {
  const sp = new URLSearchParams(current.toString());
  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined || value === "" || (Array.isArray(value) && !value.length)) {
      sp.delete(key);
    } else if (Array.isArray(value)) {
      sp.set(key, value.join(","));
    } else {
      sp.set(key, String(value));
    }
  }
  // Reset to page 1 whenever a non-page filter changes.
  if (!("page" in updates)) sp.delete("page");
  return sp.toString();
}

export const sortLabels: Record<SortOption, string> = {
  recommended: "Đề xuất",
  newest: "Mới nhất",
  "price-asc": "Giá: Thấp đến cao",
  "price-desc": "Giá: Cao đến thấp",
  bestselling: "Bán chạy nhất",
};
