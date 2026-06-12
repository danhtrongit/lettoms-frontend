"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth/rbac";
import { pageInputSchema } from "@/lib/validators/cms";
import { pagePathsToRevalidate } from "@/lib/cms/revalidate";
import {
  createPage,
  updatePage,
  deletePage,
  getPageAdmin,
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
    let previousSlug: string | undefined;
    let isSystem = false;
    if (id) {
      const existing = await getPageAdmin(id);
      if (!existing) return { ok: false, error: "Trang không tồn tại" };
      previousSlug = existing.slug;
      isSystem = existing.isSystem;
      await updatePage(id, parsed.data);
    } else {
      pageId = await createPage(parsed.data);
    }
    for (const path of pagePathsToRevalidate(parsed.data.slug, { isSystem, previousSlug })) {
      revalidatePath(path);
    }
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
