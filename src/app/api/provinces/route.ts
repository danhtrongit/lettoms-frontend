import { NextResponse } from "next/server";

const UPSTREAM = "https://provinces.open-api.vn/api/v2/p/";

// Province list rarely changes; cache aggressively (30 days).
export const revalidate = 2592000;

export async function GET() {
  try {
    const res = await fetch(UPSTREAM, { next: { revalidate } });
    if (!res.ok) {
      return NextResponse.json({ error: "upstream_error" }, { status: 502 });
    }
    const data = (await res.json()) as { code: number; name: string }[];
    // Trim to what the UI needs.
    const provinces = data.map((p) => ({ code: p.code, name: p.name }));
    return NextResponse.json(provinces, {
      headers: { "Cache-Control": "public, max-age=86400, s-maxage=2592000" },
    });
  } catch {
    return NextResponse.json({ error: "fetch_failed" }, { status: 502 });
  }
}
