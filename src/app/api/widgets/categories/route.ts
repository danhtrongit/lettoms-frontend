import { NextResponse } from "next/server";
import { getCategoriesByGenderDb } from "@/lib/repos/categories.repo";
import type { Gender } from "@/types";

const GENDERS: Gender[] = ["nu", "nam", "tre-em", "em-be"];

export async function GET(req: Request) {
  const url = new URL(req.url);
  const genderParam = url.searchParams.get("gender") ?? "nu";
  const gender = (GENDERS.includes(genderParam as Gender) ? genderParam : "nu") as Gender;
  const cats = await getCategoriesByGenderDb(gender);
  return NextResponse.json({ data: cats });
}
