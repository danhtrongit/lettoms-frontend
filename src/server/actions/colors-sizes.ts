"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireStaff } from "@/lib/auth/rbac";
import {
  upsertColor,
  deleteColor,
  upsertSize,
  deleteSize,
} from "@/lib/repos/catalog-admin.repo";
import type { ActionResult } from "./catalog";

const colorSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  hex: z.string().regex(/^#?[0-9a-fA-F]{3,8}$/, "Mã màu hex không hợp lệ"),
  chip: z.string().optional().nullable(),
});

const sizeSchema = z.object({
  code: z.string().min(1),
  label: z.string().min(1),
  sortOrder: z.coerce.number().int().default(0),
});

export async function saveColorAction(raw: unknown): Promise<ActionResult> {
  await requireStaff();
  const parsed = colorSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }
  const hex = parsed.data.hex.startsWith("#") ? parsed.data.hex : `#${parsed.data.hex}`;
  await upsertColor({ ...parsed.data, hex });
  revalidatePath("/admin/colors-sizes");
  return { ok: true };
}

export async function deleteColorAction(code: string): Promise<ActionResult> {
  await requireStaff();
  try {
    await deleteColor(code);
    revalidatePath("/admin/colors-sizes");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Lỗi không xác định" };
  }
}

export async function saveSizeAction(raw: unknown): Promise<ActionResult> {
  await requireStaff();
  const parsed = sizeSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }
  await upsertSize(parsed.data);
  revalidatePath("/admin/colors-sizes");
  return { ok: true };
}

export async function deleteSizeAction(code: string): Promise<ActionResult> {
  await requireStaff();
  try {
    await deleteSize(code);
    revalidatePath("/admin/colors-sizes");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Lỗi không xác định" };
  }
}
