import { NextRequest, NextResponse } from "next/server";
import { filterProducts } from "@/lib/api/products";
import { getAllProducts } from "@/lib/repos/products.repo";
import type { Gender, ProductFlag, SortOption } from "@/types";

/**
 * GET /api/products
 * Query params:
 *   q, gender, category, subcategory, sort, limit
 *   ids=a,b,c  → fetch specific products by id (for wishlist)
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  // Lookup by explicit ids (wishlist)
  const idsParam = sp.get("ids");
  if (idsParam) {
    const ids = idsParam.split(",").filter(Boolean);
    const all = await getAllProducts();
    const byId = new Map(all.map((p) => [p.id, p]));
    const items = ids
      .map((id) => byId.get(id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));
    return NextResponse.json({ data: items });
  }

  const limit = Number(sp.get("limit") ?? "0");
  const items = await filterProducts({
    query: sp.get("q") ?? undefined,
    gender: (sp.get("gender") as Gender) ?? undefined,
    categorySlug: sp.get("category") ?? undefined,
    subcategorySlug: sp.get("subcategory") ?? undefined,
    sort: (sp.get("sort") as SortOption) ?? undefined,
    flags: sp.get("flag") ? [sp.get("flag") as ProductFlag] : undefined,
  });

  const data = limit > 0 ? items.slice(0, limit) : items;
  return NextResponse.json({ data, total: items.length });
}
