import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getMedia, updateMedia, deleteMedia } from "@/lib/repos/media.repo";
import { storage } from "@/lib/storage";
import { requireStaff } from "@/lib/auth/rbac";

const patchSchema = z.object({
  alt: z.string().optional(),
  title: z.string().optional(),
});

/** PATCH /api/media/[id] — edit alt/title (staff only). */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireStaff();
  const { id } = await params;
  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }
  const existing = await getMedia(id);
  if (!existing) {
    return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  }
  await updateMedia(id, parsed.data);
  return NextResponse.json({ ok: true });
}

/** DELETE /api/media/[id] — remove DB row + physical file (staff only). */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireStaff();
  const { id } = await params;
  const row = await deleteMedia(id);
  if (row) {
    // Derive the storage key from the public url (/uploads/<key>).
    const key = row.url.replace(/^\/uploads\//, "");
    await storage.delete(key);
  }
  return NextResponse.json({ ok: true });
}
