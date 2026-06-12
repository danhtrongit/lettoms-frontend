"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/rbac";
import { userInputSchema } from "@/lib/validators/cms";
import {
  createUserAdmin,
  updateUserAdmin,
  deleteUserAdmin,
  getUserAdmin,
  countOtherAdmins,
} from "@/lib/repos/users-admin.repo";
import type { ActionResult } from "./catalog";

export async function saveUserAction(
  id: string | null,
  raw: unknown
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = userInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }
  // New users must have a password.
  if (!id && !parsed.data.password) {
    return { ok: false, error: "Vui lòng nhập mật khẩu cho người dùng mới" };
  }
  try {
    let userId = id;
    if (id) {
      // Prevent demoting the last admin.
      const existing = await getUserAdmin(id);
      if (
        existing?.role === "admin" &&
        parsed.data.role !== "admin" &&
        (await countOtherAdmins(id)) === 0
      ) {
        return { ok: false, error: "Không thể hạ quyền admin cuối cùng" };
      }
      await updateUserAdmin(id, parsed.data);
    } else {
      userId = await createUserAdmin(parsed.data);
    }
    revalidatePath("/admin/users");
    return { ok: true, id: userId ?? undefined };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Lỗi không xác định";
    // Unique email violation.
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return { ok: false, error: "Email đã tồn tại" };
    }
    return { ok: false, error: msg };
  }
}

export async function deleteUserAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    const existing = await getUserAdmin(id);
    if (existing?.role === "admin" && (await countOtherAdmins(id)) === 0) {
      return { ok: false, error: "Không thể xóa admin cuối cùng" };
    }
    await deleteUserAdmin(id);
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Lỗi không xác định" };
  }
}
