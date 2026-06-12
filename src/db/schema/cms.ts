import {
  pgTable,
  text,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

// ---- Site settings (single row, key="site") ----
export type SocialLinks = {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  zalo?: string;
};

export type GiftConfig = {
  enabled: boolean;
  threshold: number; // VND
  label: string; // e.g. "Tặng túi tote"
};

export type EmailSettings = {
  enabled: boolean;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
};

export type SiteSettings = {
  logo?: string;
  logoDark?: string;
  favicon?: string;
  brandName: string;
  phone?: string;
  email?: string;
  address?: string;
  social: SocialLinks;
  announcementBar?: { enabled: boolean; text: string; href?: string };
  freeshipThreshold: number; // VND, 0 = disabled
  gift: GiftConfig;
  emailSettings?: EmailSettings;
  // default SEO
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
};

export const settings = pgTable("settings", {
  key: text("key").primaryKey(), // "site"
  value: jsonb("value").$type<SiteSettings>().notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---- Menus (header / footer navigation as JSON) ----
export type MenuNode = {
  label: string;
  href: string;
  children?: MenuNode[];
};

export const menus = pgTable("menus", {
  key: text("key").primaryKey(), // "header" | "footer"
  items: jsonb("items").$type<MenuNode[]>().notNull().default([]),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---- Pages (drag-and-drop widget builder) ----
export const pageStatus = pgEnum("page_status", ["draft", "published"]);

// A widget block: type + arbitrary props (validated per-type in app code)
export type PageBlock = {
  id: string;
  type: string; // "hero" | "productGrid" | "bannerImage" | ...
  props: Record<string, unknown>;
};

export const pages = pgTable("pages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  status: pageStatus("status").notNull().default("draft"),
  blocks: jsonb("blocks").$type<PageBlock[]>().notNull().default([]),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  ogImage: text("og_image"),
  isSystem: boolean("is_system").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Page = typeof pages.$inferSelect;
export type Setting = typeof settings.$inferSelect;
