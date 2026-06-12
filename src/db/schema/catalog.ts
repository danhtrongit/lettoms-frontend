import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
  real,
  jsonb,
  primaryKey,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

export const genderEnum = pgEnum("gender", ["nu", "nam"]);

// ---- Reference tables ----
export const colors = pgTable("colors", {
  code: text("code").primaryKey(), // e.g. "00"
  name: text("name").notNull(),
  hex: text("hex").notNull(),
  chip: text("chip"), // swatch image url
});

export const sizes = pgTable("sizes", {
  code: text("code").primaryKey(), // e.g. "003"
  label: text("label").notNull(), // M, L, 110...
  sortOrder: integer("sort_order").notNull().default(0),
});

// ---- Categories (self-referencing tree: category -> subcategory) ----
export const categories = pgTable(
  "categories",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    gender: genderEnum("gender").notNull(),
    parentId: text("parent_id"),
    description: text("description"),
    heroImage: text("hero_image"),
    iconImage: text("icon_image"),
    // SEO
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    ogImage: text("og_image"),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("categories_gender_slug_idx").on(t.gender, t.slug),
    index("categories_parent_idx").on(t.parentId),
  ]
);

// ---- Products ----
export const products = pgTable(
  "products",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    gender: genderEnum("gender").notNull(),
    categoryId: text("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    subcategoryId: text("subcategory_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    description: text("description").notNull().default(""),
    materials: text("materials").notNull().default(""),
    care: text("care").notNull().default(""),
    // Rich content (Tiptap JSON source of truth + cached HTML for render)
    descriptionJson: jsonb("description_json"),
    descriptionHtml: text("description_html"),
    materialsJson: jsonb("materials_json"),
    materialsHtml: text("materials_html"),
    careJson: jsonb("care_json"),
    careHtml: text("care_html"),
    basePrice: integer("base_price").notNull(), // VND
    originalPrice: integer("original_price"),
    flags: text("flags").array().notNull().default([]),
    rating: real("rating").notNull().default(0),
    reviewCount: integer("review_count").notNull().default(0),
    thumbnail: text("thumbnail"),
    // SEO
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    ogImage: text("og_image"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("products_gender_idx").on(t.gender),
    index("products_category_idx").on(t.categoryId),
    index("products_active_idx").on(t.isActive),
  ]
);

// ---- Product variants = real SKUs (color x size) ----
export const productVariants = pgTable(
  "product_variants",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    colorCode: text("color_code")
      .notNull()
      .references(() => colors.code),
    sizeCode: text("size_code")
      .notNull()
      .references(() => sizes.code),
    sku: text("sku").notNull().unique(),
    price: integer("price").notNull(),
    originalPrice: integer("original_price"),
    stock: integer("stock").notNull().default(0),
    image: text("image"), // optional per-variant thumbnail (falls back to product/color image)
    isActive: boolean("is_active").notNull().default(true),
  },
  (t) => [
    uniqueIndex("variant_product_color_size_idx").on(
      t.productId,
      t.colorCode,
      t.sizeCode
    ),
    index("variant_product_idx").on(t.productId),
  ]
);

// ---- Product images (optionally tied to a color) ----
export const productImages = pgTable(
  "product_images",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    src: text("src").notNull(),
    alt: text("alt").notNull().default(""),
    colorCode: text("color_code"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("product_images_product_idx").on(t.productId)]
);

// ---- Join tables: which colors/sizes a product offers (with order) ----
export const productColors = pgTable(
  "product_colors",
  {
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    colorCode: text("color_code")
      .notNull()
      .references(() => colors.code),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.productId, t.colorCode] })]
);

export const productSizes = pgTable(
  "product_sizes",
  {
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    sizeCode: text("size_code")
      .notNull()
      .references(() => sizes.code),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.productId, t.sizeCode] })]
);

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductVariant = typeof productVariants.$inferSelect;
export type Category = typeof categories.$inferSelect;
