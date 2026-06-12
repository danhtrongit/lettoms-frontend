import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { listMedia, createMedia } from "@/lib/repos/media.repo";
import { storage } from "@/lib/storage";
import { requireStaff } from "@/lib/auth/rbac";
import { getCurrentUser } from "@/lib/auth/rbac";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

/** GET /api/media — list (staff only). */
export async function GET(req: NextRequest) {
  await requireStaff();
  const sp = req.nextUrl.searchParams;
  const search = sp.get("search") ?? undefined;
  const limit = Number(sp.get("limit") ?? "60");
  const offset = Number(sp.get("offset") ?? "0");
  const { items, total } = await listMedia({ search, limit, offset });
  return NextResponse.json({ data: items, total });
}

/** POST /api/media — multipart upload (staff only). */
export async function POST(req: NextRequest) {
  await requireStaff();
  const user = await getCurrentUser();

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Thiếu tệp tải lên" }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Định dạng ảnh không hỗ trợ" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Ảnh vượt quá 8MB" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Probe dimensions (best-effort).
  let width: number | null = null;
  let height: number | null = null;
  try {
    const meta = await sharp(buffer).metadata();
    width = meta.width ?? null;
    height = meta.height ?? null;
  } catch {
    /* non-image or unreadable */
  }

  const stored = await storage.save({
    buffer,
    filename: file.name,
    mime: file.type,
  });

  const row = await createMedia({
    filename: file.name,
    url: stored.url,
    mime: file.type,
    width,
    height,
    sizeBytes: file.size,
    alt: "",
    title: file.name,
    createdBy: user?.id ?? null,
  });

  return NextResponse.json({ data: row }, { status: 201 });
}
