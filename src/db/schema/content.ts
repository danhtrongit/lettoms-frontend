import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

export const articleCategories = pgTable("article_categories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  thumbnail: text("thumbnail"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  ogImage: text("og_image"),
  sortOrder: integer("sort_order").notNull().default(0),
});

// Article body is an ordered array of blocks (heading/paragraph/image/quote)
export type ArticleBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "quote"; text: string; cite?: string };

export const articles = pgTable(
  "articles",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull().default(""),
    categoryId: text("category_id").references(() => articleCategories.id, {
      onDelete: "set null",
    }),
    coverImage: text("cover_image"),
    author: text("author").notNull().default("Letom's"),
    publishedAt: timestamp("published_at").notNull().defaultNow(),
    readingMinutes: integer("reading_minutes").notNull().default(3),
    // Legacy block body (kept for back-compat); new content uses Tiptap.
    body: jsonb("body").$type<ArticleBlock[]>().notNull().default([]),
    contentJson: jsonb("content_json"), // Tiptap doc (source of truth)
    contentHtml: text("content_html"), // cached sanitized HTML for render
    featured: boolean("featured").notNull().default(false),
    isPublished: boolean("is_published").notNull().default(true),
    relatedProductIds: text("related_product_ids").array().notNull().default([]),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    ogImage: text("og_image"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("articles_category_idx").on(t.categoryId),
    index("articles_published_idx").on(t.isPublished, t.publishedAt),
  ]
);

export type Article = typeof articles.$inferSelect;
export type ArticleCategory = typeof articleCategories.$inferSelect;
