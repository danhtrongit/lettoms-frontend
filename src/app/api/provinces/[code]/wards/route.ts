import { NextResponse } from "next/server";

// Fetch a province with its wards (depth=2 returns nested wards in v2).
export const revalidate = 2592000;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  try {
    const res = await fetch(
      `https://provinces.open-api.vn/api/v2/p/${code}?depth=2`,
      { next: { revalidate } }
    );
    if (!res.ok) {
      return NextResponse.json({ error: "upstream_error" }, { status: 502 });
    }
    const data = (await res.json()) as {
      wards?: { code: number; name: string }[];
    };
    const wards = (data.wards ?? []).map((w) => ({ code: w.code, name: w.name }));
    return NextResponse.json(wards, {
      headers: { "Cache-Control": "public, max-age=86400, s-maxage=2592000" },
    });
  } catch {
    return NextResponse.json({ error: "fetch_failed" }, { status: 502 });
  }
}
