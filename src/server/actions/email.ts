"use server";

import { requireAdmin } from "@/lib/auth/rbac";
import { sendTestMail } from "@/lib/email/transport";
import type { EmailSettings } from "@/db/schema/cms";
import type { ActionResult } from "./catalog";

export async function sendTestEmailAction(
  cfg: EmailSettings,
  to: string
): Promise<ActionResult> {
  await requireAdmin();
  if (!to || !to.includes("@")) {
    return { ok: false, error: "Email nhận không hợp lệ" };
  }
  const res = await sendTestMail(cfg, to);
  if (!res.ok) {
    return { ok: false, error: res.error };
  }
  return { ok: true };
}
