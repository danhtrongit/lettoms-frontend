import { NextResponse } from "next/server";
import { getFeaturedProducts } from "@/lib/api/products";
import type { ProductFlag } from "@/types";

const FLAGS: ProductFlag[] = ["new", "bestseller", "sale", "limited", "online-only"];

export async function GET(req: Request) {
  const url = new URL(req.url);
  const flagParam = url.searchParams.get("flag") ?? "bestseller";
  const flag = (FLAGS.includes(flagParam as ProductFlag) ? flagParam : "bestseller") as ProductFlag;
  const limit = Math.max(1, Math.min(Number(url.searchParams.get("limit")) || 4, 24));
  const products = await getFeaturedProducts(flag, limit);
  return NextResponse.json({ data: products });
}
