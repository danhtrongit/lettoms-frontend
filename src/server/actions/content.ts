"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth/rbac";
import {
  articleInputSchema,
  articleCategoryInputSchema,
} from "@/lib/validators/content";
import {
  createArticle,
  updateArticle,
  deleteArticle,
  createArticleCategory,
  updateArticleCategory,
  deleteArticleCategory,
} from "@/lib/repos/content-admin.repo";
import type { ActionResult } from "./catalog";

/* ----------------------------- Article Categories ----------------------------- */

export async function saveArticleCategoryAction(
  id: string | null,
  raw: unknown
): Promise<ActionResult> {
  await requireStaff();
  const parsed = articleCategoryInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }
  try {
    if (id) {
      await updateArticleCategory(id, parsed.data);
    } else {
      const newId = await createArticleCategory(parsed.data);
      revalidatePath("/admin/article-categories");
      return { ok: true, id: newId };
    }
    revalidatePath("/admin/article-categories");
    return { ok: true, id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Lỗi không xác định" };
  }
}

export async function deleteArticleCategoryAction(id: string): Promise<ActionResult> {
  await requireStaff();
  try {
    await deleteArticleCategory(id);
    revalidatePath("/admin/article-categories");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Lỗi không xác định" };
  }
}

/* ----------------------------- Articles ----------------------------- */

export async function saveArticleAction(
  id: string | null,
  raw: unknown
): Promise<ActionResult> {
  await requireStaff();
  const parsed = articleInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }
  try {
    let articleId = id;
    if (id) {
      await updateArticle(id, parsed.data);
    } else {
      articleId = await createArticle(parsed.data);
    }
    revalidatePath("/admin/articles");
    revalidatePath("/tin-tuc");
    return { ok: true, id: articleId ?? undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Lỗi không xác định" };
  }
}

export async function deleteArticleAction(id: string): Promise<ActionResult> {
  await requireStaff();
  try {
    await deleteArticle(id);
    revalidatePath("/admin/articles");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Lỗi không xác định" };
  }
}
