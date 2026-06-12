"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/rbac";
import { siteSettingsSchema } from "@/lib/validators/cms";
import { saveSettings } from "@/lib/repos/settings.repo";
import type { SiteSettings } from "@/db/schema/cms";
import type { ActionResult } from "./catalog";

export async function saveSettingsAction(raw: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = siteSettingsSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }
  try {
    await saveSettings(parsed.data as SiteSettings);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Lỗi không xác định" };
  }
}
