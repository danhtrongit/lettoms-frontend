"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth/rbac";
import { deletePage } from "@/lib/repos/pages.repo";
import type { ActionResult } from "./catalog";

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
