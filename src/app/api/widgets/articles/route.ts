import { NextResponse } from "next/server";
import { getArticles } from "@/lib/api/articles";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit")) || 3, 12);
  const articles = await getArticles();
  return NextResponse.json({ data: articles.slice(0, limit) });
}
