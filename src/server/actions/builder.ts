"use server";

import { revalidatePath } from "next/cache";
import type { Data } from "@puckeditor/core";
import { requireStaff } from "@/lib/auth/rbac";
import { puckDataSchema } from "@/lib/validators/cms";
import { pagePathsToRevalidate } from "@/lib/cms/revalidate";
import { getPageAdmin, updatePageContent } from "@/lib/repos/pages.repo";
import type { ActionResult } from "./catalog";

export async function savePageContentAction(
  id: string,
  rawData: unknown,
  status: "draft" | "published"
): Promise<ActionResult> {
  await requireStaff();
  if (status !== "draft" && status !== "published") {
    return { ok: false, error: "Trạng thái không hợp lệ" };
  }
  const parsed = puckDataSchema.safeParse(rawData);
  if (!parsed.success) {
    return { ok: false, error: "Dữ liệu trang không hợp lệ" };
  }
  try {
    const page = await getPageAdmin(id);
    if (!page) return { ok: false, error: "Trang không tồn tại" };
    await updatePageContent(id, parsed.data as Data, status);
    for (const path of pagePathsToRevalidate(page.slug, { isSystem: page.isSystem })) {
      revalidatePath(path);
    }
    return { ok: true, id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Lỗi không xác định" };
  }
}
