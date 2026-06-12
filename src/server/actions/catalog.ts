"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth/rbac";
import {
  categoryInputSchema,
  productInputSchema,
} from "@/lib/validators/catalog";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
} from "@/lib/repos/catalog-admin.repo";

export type ActionResult = { ok: boolean; error?: string; id?: string };

/* ----------------------------- Categories ----------------------------- */

export async function saveCategoryAction(
  id: string | null,
  raw: unknown
): Promise<ActionResult> {
  await requireStaff();
  const parsed = categoryInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }
  try {
    if (id) {
      await updateCategory(id, parsed.data);
    } else {
      const newId = await createCategory(parsed.data);
      revalidatePath("/admin/categories");
      return { ok: true, id: newId };
    }
    revalidatePath("/admin/categories");
    return { ok: true, id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Lỗi không xác định" };
  }
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  await requireStaff();
  try {
    await deleteCategory(id);
    revalidatePath("/admin/categories");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Lỗi không xác định" };
  }
}

/* ----------------------------- Products ----------------------------- */

export async function saveProductAction(
  id: string | null,
  raw: unknown
): Promise<ActionResult> {
  await requireStaff();
  const parsed = productInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }
  try {
    let productId = id;
    if (id) {
      await updateProduct(id, parsed.data);
    } else {
      productId = await createProduct(parsed.data);
    }
    revalidatePath("/admin/products");
    revalidatePath("/");
    return { ok: true, id: productId ?? undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Lỗi không xác định" };
  }
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  await requireStaff();
  try {
    await deleteProduct(id);
    revalidatePath("/admin/products");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Lỗi không xác định" };
  }
}

export async function bulkDeleteProductsAction(ids: string[]): Promise<ActionResult> {
  await requireStaff();
  try {
    await bulkDeleteProducts(ids);
    revalidatePath("/admin/products");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Lỗi không xác định" };
  }
}
