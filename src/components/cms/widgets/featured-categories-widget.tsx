import { getCategoriesByGenderDb } from "@/lib/repos/categories.repo";
import type { Gender } from "@/types";
import { FeaturedCategoriesView, type FeaturedCategoriesWidgetProps } from "./featured-categories-view";

export type { FeaturedCategoriesWidgetProps };

export async function FeaturedCategoriesServer({ heading, gender, limit }: FeaturedCategoriesWidgetProps) {
  const categories = await getCategoriesByGenderDb((gender || "nu") as Gender);
  return (
    <FeaturedCategoriesView
      heading={heading}
      gender={gender}
      categories={categories}
      limit={limit}
    />
  );
}
