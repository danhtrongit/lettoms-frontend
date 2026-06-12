import { cache } from "react";
import { db } from "@/db";
import type { Category, Gender } from "@/types";

/**
 * Rebuild the nested Category[] shape (parent category + subcategories)
 * from the flat self-referencing categories table.
 */
export const getAllCategories = cache(async (): Promise<Category[]> => {
  const rows = await db.query.categories.findMany({
    where: (c, { eq }) => eq(c.isActive, true),
    orderBy: (c, { asc }) => asc(c.sortOrder),
  });

  const parents = rows.filter((r) => !r.parentId);
  const childrenByParent = new Map<string, typeof rows>();
  for (const r of rows) {
    if (r.parentId) {
      const arr = childrenByParent.get(r.parentId) ?? [];
      arr.push(r);
      childrenByParent.set(r.parentId, arr);
    }
  }

  return parents.map((p) => ({
    slug: p.slug,
    name: p.name,
    gender: p.gender as Gender,
    description: p.description ?? undefined,
    heroImage: p.heroImage ?? undefined,
    iconImage: p.iconImage ?? undefined,
    subcategories: (childrenByParent.get(p.id) ?? [])
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((s) => ({
        slug: s.slug,
        name: s.name,
        iconImage: s.iconImage ?? undefined,
      })),
  }));
});

export async function getCategoriesByGenderDb(
  gender: Gender
): Promise<Category[]> {
  const all = await getAllCategories();
  return all.filter((c) => c.gender === gender);
}

export async function getCategoryDb(
  gender: Gender,
  slug: string
): Promise<Category | undefined> {
  const all = await getAllCategories();
  return all.find((c) => c.gender === gender && c.slug === slug);
}
