import { NextResponse } from "next/server";
import { getArticles } from "@/lib/api/articles";
import type { ArticleCategorySlug } from "@/types";

/** GET /api/articles — published articles (optionally by category, limit). */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category") as ArticleCategorySlug | null;
  const limit = Number(url.searchParams.get("limit") ?? "0");

  const list = await getArticles(category ?? undefined);
  const data = limit > 0 ? list.slice(0, limit) : list;
  return NextResponse.json({ data, total: list.length });
}
