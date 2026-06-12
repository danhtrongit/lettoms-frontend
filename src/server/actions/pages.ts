"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth/rbac";
import { pageInputSchema } from "@/lib/validators/cms";
import {
  createPage,
  updatePage,
  deletePage,
} from "@/lib/repos/pages.repo";
import type { ActionResult } from "./catalog";

export async function savePageAction(
  id: string | null,
  raw: unknown
): Promise<ActionResult> {
  await requireStaff();
  const parsed = pageInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }
  try {
    let pageId = id;
    if (id) {
      await updatePage(id, parsed.data);
    } else {
      pageId = await createPage(parsed.data);
    }
    revalidatePath("/admin/pages");
    revalidatePath(`/${parsed.data.slug}`);
    return { ok: true, id: pageId ?? undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Lỗi không xác định" };
  }
}

export async function deletePageAction(id: string): Promise<ActionResult> {
  await requireStaff();
  try {
    await deletePage(id);
    revalidatePath("/admin/pages");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Lỗi không xác định" };
  }
}
