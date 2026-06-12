"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth/rbac";
import { menuItemsSchema, menuKeySchema } from "@/lib/validators/cms";
import { saveMenu } from "@/lib/repos/menus.repo";
import type { ActionResult } from "./catalog";

export async function saveMenuAction(rawKey: unknown, rawItems: unknown): Promise<ActionResult> {
  await requireStaff();
  const key = menuKeySchema.safeParse(rawKey);
  const items = menuItemsSchema.safeParse(rawItems);
  if (!key.success || !items.success) {
    return { ok: false, error: "Dữ liệu menu không hợp lệ" };
  }
  try {
    await saveMenu(key.data, items.data);
    // Header/footer render in the root layout — revalidate the whole tree.
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Lỗi không xác định" };
  }
}
