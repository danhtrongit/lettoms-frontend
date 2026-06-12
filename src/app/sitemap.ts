import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site";
import { genders } from "@/data/site";
import { getAllCategories } from "@/lib/repos/categories.repo";
import { getAllProducts } from "@/lib/repos/products.repo";
import { getAllArticles, getAllArticleCategories } from "@/lib/repos/articles.repo";
import { listPublishedPagesForSitemap } from "@/lib/repos/pages.repo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const now = new Date();

  const [categories, products, articles, articleCategories, cmsPages] = await Promise.all([
    getAllCategories(),
    getAllProducts(),
    getAllArticles(),
    getAllArticleCategories(),
    listPublishedPagesForSitemap(),
  ]);

  const staticRoutes = [
    "",
    "/tin-tuc",
    "/gioi-thieu",
    "/cua-hang",
    "/ho-tro",
    "/cau-hoi-thuong-gap",
    "/huong-dan-size",
    "/van-chuyen-doi-tra",
    "/dieu-khoan",
    "/bao-mat",
    "/lien-he",
    "/uu-dai/hang-moi",
    "/uu-dai/khuyen-mai",
    "/uu-dai/ban-chay",
    "/uu-dai/uu-dai-co-han",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const genderRoutes = genders.map((g) => ({
    url: `${base}/${g.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const rankingRoutes = genders.map((g) => ({
    url: `${base}/ban-chay/${g.slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  const categoryRoutes = categories.flatMap((c) => [
    {
      url: `${base}/${c.gender}/${c.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    ...c.subcategories.map((s) => ({
      url: `${base}/${c.gender}/${c.slug}/${s.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ]);

  const productRoutes = products.map((p) => ({
    url: `${base}/san-pham/${p.id}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const articleCategoryRoutes = articleCategories.map((c) => ({
    url: `${base}/tin-tuc/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  const articleRoutes = articles.map((a) => ({
    url: `${base}/tin-tuc/${a.category}/${a.slug}`,
    lastModified: new Date(a.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  const cmsPageRoutes = cmsPages
    .filter((p) => !p.isSystem) // home đã có ở staticRoutes ("")
    .map((p) => ({
      url: `${base}/trang/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));

  return [
    ...staticRoutes,
    ...genderRoutes,
    ...rankingRoutes,
    ...categoryRoutes,
    ...productRoutes,
    ...articleCategoryRoutes,
    ...articleRoutes,
    ...cmsPageRoutes,
  ];
}
