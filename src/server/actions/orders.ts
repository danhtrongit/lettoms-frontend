"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth/rbac";
import { checkoutSchema, orderStatusSchema } from "@/lib/validators/commerce";
import { createOrder, updateOrderStatus } from "@/lib/repos/orders.repo";
import type { ActionResult } from "./catalog";

export interface CreateOrderResult extends ActionResult {
  code?: string;
}

export async function createAdminOrderAction(
  raw: unknown
): Promise<CreateOrderResult> {
  await requireStaff();
  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }
  try {
    const order = await createOrder(parsed.data, null, "admin");
    revalidatePath("/admin/orders");
    return { ok: true, code: order.code };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Lỗi không xác định" };
  }
}

export async function updateOrderStatusAction(
  id: string,
  status: string
): Promise<ActionResult> {
  await requireStaff();
  const parsed = orderStatusSchema.safeParse(status);
  if (!parsed.success) {
    return { ok: false, error: "Trạng thái không hợp lệ" };
  }
  try {
    await updateOrderStatus(id, parsed.data);
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Lỗi không xác định" };
  }
}
