/**
 * Seed the database from the existing static data files.
 * Idempotent: clears domain tables then re-inserts.
 * Run: npm run db:seed
 */
import { db } from "@/db";
import * as s from "@/db/schema";
import hash from "argon2";

import { products as staticProducts } from "@/data/products";
import { categories as staticCategories } from "@/data/categories";
import {
  articles as staticArticles,
  articleCategories as staticArticleCategories,
} from "@/data/articles";
import { mainNav, footerNav } from "@/data/navigation";
import { siteConfig } from "@/data/site";
import type { SiteSettings } from "@/db/schema/cms";
import type { PageBlock } from "@/db/schema/cms";
import { legacyBlocksToPuckData } from "@/lib/builder/migrate-legacy";

async function clear() {
  // Delete in FK-safe order (children first).
  await db.delete(s.orderItems);
  await db.delete(s.orders);
  await db.delete(s.addresses);
  await db.delete(s.productImages);
  await db.delete(s.productVariants);
  await db.delete(s.productColors);
  await db.delete(s.productSizes);
  await db.delete(s.products);
  await db.delete(s.categories);
  await db.delete(s.articles);
  await db.delete(s.articleCategories);
  await db.delete(s.colors);
  await db.delete(s.sizes);
  await db.delete(s.media);
  await db.delete(s.mediaFolders);
  await db.delete(s.pages);
  await db.delete(s.settings);
  await db.delete(s.menus);
  await db.delete(s.sessions);
  await db.delete(s.accounts);
  await db.delete(s.users);
}

async function seedColorsAndSizes() {
  const colorMap = new Map<string, { code: string; name: string; hex: string; chip?: string }>();
  const sizeMap = new Map<string, { code: string; label: string }>();

  for (const p of staticProducts) {
    for (const c of p.colors) {
      if (!colorMap.has(c.code))
        colorMap.set(c.code, { code: c.code, name: c.name, hex: c.hex, chip: c.chip });
    }
    for (const sz of p.sizes) {
      if (!sizeMap.has(sz.code)) sizeMap.set(sz.code, { code: sz.code, label: sz.label });
    }
  }

  if (colorMap.size)
    await db.insert(s.colors).values(
      [...colorMap.values()].map((c) => ({
        code: c.code,
        name: c.name,
        hex: c.hex,
        chip: c.chip ?? null,
      }))
    );

  if (sizeMap.size)
    await db.insert(s.sizes).values(
      [...sizeMap.values()].map((sz, i) => ({
        code: sz.code,
        label: sz.label,
        sortOrder: i,
      }))
    );

  return { colorCount: colorMap.size, sizeCount: sizeMap.size };
}

// Maps for product → category linking
type CatKey = string; // `${gender}:${slug}`
type SubKey = string; // `${gender}:${parentSlug}:${slug}`

async function seedCategories() {
  const parentByKey = new Map<CatKey, string>();
  const subByKey = new Map<SubKey, string>();

  let order = 0;
  for (const cat of staticCategories) {
    const [parent] = await db
      .insert(s.categories)
      .values({
        slug: cat.slug,
        name: cat.name,
        gender: cat.gender,
        description: cat.description,
        heroImage: cat.heroImage ?? null,
        iconImage: cat.iconImage ?? null,
        sortOrder: order++,
      })
      .returning({ id: s.categories.id });

    parentByKey.set(`${cat.gender}:${cat.slug}`, parent.id);

    let subOrder = 0;
    for (const sub of cat.subcategories) {
      const [subRow] = await db
        .insert(s.categories)
        .values({
          slug: sub.slug,
          name: sub.name,
          gender: cat.gender,
          parentId: parent.id,
          iconImage: sub.iconImage ?? null,
          sortOrder: subOrder++,
        })
        .returning({ id: s.categories.id });
      subByKey.set(`${cat.gender}:${cat.slug}:${sub.slug}`, subRow.id);
    }
  }

  return { parentByKey, subByKey };
}

async function seedProducts(
  parentByKey: Map<CatKey, string>,
  subByKey: Map<SubKey, string>
) {
  const seenIds = new Set<string>();
  let variantCount = 0;

  for (const p of staticProducts) {
    // Ensure a unique primary key (static data has a duplicate id).
    let id = p.id;
    if (seenIds.has(id)) {
      let n = 2;
      while (seenIds.has(`${p.id}-${n}`)) n++;
      id = `${p.id}-${n}`;
    }
    seenIds.add(id);

    const categoryId = parentByKey.get(`${p.gender}:${p.categorySlug}`) ?? null;
    const subcategoryId = p.subcategorySlug
      ? subByKey.get(`${p.gender}:${p.categorySlug}:${p.subcategorySlug}`) ?? null
      : null;

    await db.insert(s.products).values({
      id,
      slug: p.slug,
      name: p.name,
      gender: p.gender,
      categoryId,
      subcategoryId,
      description: p.description,
      materials: p.materials,
      care: p.care,
      basePrice: p.price,
      originalPrice: p.originalPrice ?? null,
      flags: p.flags,
      rating: p.rating,
      reviewCount: p.reviewCount,
      thumbnail: p.images[0]?.src ?? null,
      seoTitle: p.name,
      seoDescription: p.description.slice(0, 160),
    });

    // colors offered
    if (p.colors.length)
      await db.insert(s.productColors).values(
        p.colors.map((c, i) => ({
          productId: id,
          colorCode: c.code,
          sortOrder: i,
        }))
      );

    // sizes offered
    if (p.sizes.length)
      await db.insert(s.productSizes).values(
        p.sizes.map((sz, i) => ({
          productId: id,
          sizeCode: sz.code,
          sortOrder: i,
        }))
      );

    // images
    if (p.images.length)
      await db.insert(s.productImages).values(
        p.images.map((img, i) => ({
          productId: id,
          src: img.src,
          alt: img.alt,
          colorCode: img.colorCode ?? null,
          sortOrder: i,
        }))
      );

    // variants = color x size (real SKUs)
    const variantRows = [];
    for (const c of p.colors) {
      for (const sz of p.sizes) {
        variantRows.push({
          productId: id,
          colorCode: c.code,
          sizeCode: sz.code,
          sku: `${id}-${c.code}-${sz.code}`,
          price: p.price,
          originalPrice: p.originalPrice ?? null,
          stock: sz.inStock ? 50 : 0,
          isActive: true,
        });
      }
    }
    if (variantRows.length) {
      await db.insert(s.productVariants).values(variantRows);
      variantCount += variantRows.length;
    }
  }

  return { productCount: seenIds.size, variantCount };
}

async function seedArticles() {
  const catBySlug = new Map<string, string>();
  for (const ac of staticArticleCategories) {
    const [row] = await db
      .insert(s.articleCategories)
      .values({
        slug: ac.slug,
        name: ac.name,
        description: ac.description,
      })
      .returning({ id: s.articleCategories.id });
    catBySlug.set(ac.slug, row.id);
  }

  for (const a of staticArticles) {
    await db.insert(s.articles).values({
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt,
      categoryId: catBySlug.get(a.category) ?? null,
      coverImage: a.coverImage,
      author: a.author,
      publishedAt: new Date(a.publishedAt),
      readingMinutes: a.readingMinutes,
      body: a.body,
      featured: a.featured ?? false,
      isPublished: true,
      relatedProductIds: a.relatedProductIds ?? [],
      seoTitle: a.title,
      seoDescription: a.excerpt,
    });
  }

  return { articleCount: staticArticles.length };
}

async function seedUsers() {
  const password = await hash.hash("Letoms@2026");
  await db.insert(s.users).values([
    { name: "Letom's Admin", email: "admin@letoms.vn", passwordHash: password, role: "admin" },
    { name: "Letom's Staff", email: "staff@letoms.vn", passwordHash: password, role: "staff" },
    { name: "Khách Hàng Demo", email: "customer@letoms.vn", passwordHash: password, role: "customer" },
  ]);
}

async function seedSettings() {
  const value: SiteSettings = {
    brandName: siteConfig.name,
    logo: "/logo.png",
    favicon: "/icon.png",
    phone: siteConfig.phone,
    email: siteConfig.email,
    address: "129/66/20 Liên Khu 5-6, Bình Hưng Hòa B, Bình Tân, TP. Hồ Chí Minh",
    social: {
      facebook: siteConfig.social.facebook,
      instagram: siteConfig.social.instagram,
      youtube: siteConfig.social.youtube,
      tiktok: siteConfig.social.tiktok,
    },
    announcementBar: {
      enabled: true,
      text: "Miễn phí giao hàng cho đơn từ 499.000 VND · Đổi trả trong 30 ngày",
    },
    freeshipThreshold: 499000,
    gift: { enabled: false, threshold: 0, label: "" },
    seoTitle: `${siteConfig.name} — ${siteConfig.tagline}`,
    seoDescription: siteConfig.description,
    ogImage: siteConfig.ogImage,
  };
  await db.insert(s.settings).values({ key: "site", value });
}

async function seedPages() {
  // System homepage built from widgets (editable in admin, not deletable).
  const blocks: PageBlock[] = [
    {
      id: "home-hero",
      type: "hero",
      props: {
        image:
          "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=80",
        heading: "Bộ Sưu Tập Mùa Mới",
        subheading: "Thiết kế tinh tế cho cả gia đình.",
        ctaLabel: "Mua ngay",
        ctaHref: "/nu",
        align: "center",
        height: "large",
      },
    },
    {
      id: "home-cats",
      type: "featuredCategories",
      props: { heading: "Tìm Theo Danh Mục", gender: "nu", limit: 6 },
    },
    {
      id: "home-new",
      type: "productGrid",
      props: { heading: "Hàng Mới Về", flag: "new", limit: 4, href: "/uu-dai/hang-moi" },
    },
    {
      id: "home-banner",
      type: "hero",
      props: {
        image:
          "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&q=80",
        heading: "Ưu Đãi Giá Mới",
        subheading: "Giảm đến 40% cho các sản phẩm chọn lọc.",
        ctaLabel: "Xem khuyến mãi",
        ctaHref: "/uu-dai/khuyen-mai",
        align: "center",
        height: "medium",
      },
    },
    {
      id: "home-best",
      type: "productGrid",
      props: { heading: "Sản Phẩm Bán Chạy", flag: "bestseller", limit: 4, href: "/uu-dai/ban-chay" },
    },
    {
      id: "home-sale",
      type: "productGrid",
      props: { heading: "Đang Giảm Giá", flag: "sale", limit: 4, href: "/uu-dai/khuyen-mai" },
    },
  ];

  await db.insert(s.pages).values({
    slug: "home",
    title: "Trang chủ",
    status: "published",
    blocks,
    content: legacyBlocksToPuckData(blocks),
    isSystem: true,
    seoTitle: `${siteConfig.name} — ${siteConfig.tagline}`,
    seoDescription: siteConfig.description,
  });
}

async function seedMenus() {
  // Header: the static non-gender tail links; Footer: converted from footerNav.
  const headerItems = mainNav
    .filter((i) => !i.gender)
    .map((i) => ({ label: i.label, href: i.href }));
  const footerItems = footerNav.map((col) => ({
    label: col.title,
    href: "#",
    children: col.items.map((it) => ({ label: it.label, href: it.href })),
  }));
  await db.insert(s.menus).values([
    { key: "header", items: headerItems },
    { key: "footer", items: footerItems },
  ]);
}

async function main() {
  console.log("🌱 Seeding Letom's database...");
  await clear();
  console.log("  cleared existing rows");

  const cs = await seedColorsAndSizes();
  console.log(`  colors=${cs.colorCount} sizes=${cs.sizeCount}`);

  const { parentByKey, subByKey } = await seedCategories();
  console.log(`  categories (incl. subcategories) seeded`);

  const ps = await seedProducts(parentByKey, subByKey);
  console.log(`  products=${ps.productCount} variants=${ps.variantCount}`);

  const ar = await seedArticles();
  console.log(`  articles=${ar.articleCount}`);

  await seedUsers();
  console.log("  users: admin/staff/customer (pw: Letoms@2026)");

  await seedSettings();
  console.log("  settings: site");

  await seedPages();
  console.log("  pages: home (system)");

  await seedMenus();
  console.log("  menus: header (tail links) + footer (columns)");

  console.log("✅ Seed complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
