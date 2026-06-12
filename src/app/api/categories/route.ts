import { NextResponse } from "next/server";
import { getAllCategories } from "@/lib/repos/categories.repo";

/** GET /api/categories — full category tree (optionally filter by gender). */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const gender = url.searchParams.get("gender");
  const all = await getAllCategories();
  const data = gender ? all.filter((c) => c.gender === gender) : all;
  return NextResponse.json({ data });
}
