"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth/rbac";
import { addressInputSchema } from "@/lib/validators/commerce";
import {
  updateUserProfile,
  createAddress,
  updateAddress,
  deleteAddress,
} from "@/lib/repos/account.repo";
import type { ActionResult } from "./catalog";

const profileSchema = z.object({
  name: z.string().min(2, "Vui lòng nhập họ tên"),
  phone: z.string().optional().nullable(),
});

export async function updateProfileAction(raw: unknown): Promise<ActionResult> {
  const user = await requireUser("/tai-khoan");
  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }
  await updateUserProfile(user.id, parsed.data);
  revalidatePath("/tai-khoan");
  return { ok: true };
}

export async function saveAddressAction(
  addressId: string | null,
  raw: unknown
): Promise<ActionResult> {
  const user = await requireUser("/tai-khoan/dia-chi");
  const parsed = addressInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }
  try {
    if (addressId) {
      await updateAddress(user.id, addressId, parsed.data);
    } else {
      await createAddress(user.id, parsed.data);
    }
    revalidatePath("/tai-khoan/dia-chi");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Lỗi không xác định" };
  }
}

export async function deleteAddressAction(addressId: string): Promise<ActionResult> {
  const user = await requireUser("/tai-khoan/dia-chi");
  try {
    await deleteAddress(user.id, addressId);
    revalidatePath("/tai-khoan/dia-chi");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Lỗi không xác định" };
  }
}
