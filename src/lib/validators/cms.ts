import { z } from "zod";

export const siteSettingsSchema = z.object({
  brandName: z.string().min(1),
  logo: z.string().optional().nullable(),
  logoDark: z.string().optional().nullable(),
  favicon: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().or(z.literal("")).nullable(),
  address: z.string().optional().nullable(),
  social: z
    .object({
      facebook: z.string().optional(),
      instagram: z.string().optional(),
      tiktok: z.string().optional(),
      youtube: z.string().optional(),
      zalo: z.string().optional(),
    })
    .default({}),
  announcementBar: z
    .object({
      enabled: z.boolean().default(false),
      text: z.string().default(""),
      href: z.string().optional(),
    })
    .optional(),
  freeshipThreshold: z.coerce.number().int().nonnegative().default(0),
  gift: z
    .object({
      enabled: z.boolean().default(false),
      threshold: z.coerce.number().int().nonnegative().default(0),
      label: z.string().default(""),
    })
    .default({ enabled: false, threshold: 0, label: "" }),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  ogImage: z.string().optional().nullable(),
  emailSettings: z
    .object({
      enabled: z.boolean().default(false),
      host: z.string().default(""),
      port: z.coerce.number().int().nonnegative().default(587),
      secure: z.boolean().default(false),
      user: z.string().default(""),
      pass: z.string().default(""),
      fromName: z.string().default("Letom's"),
      fromEmail: z.string().default(""),
    })
    .optional(),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;

// ---- Page builder ----
export const pageSettingsSchema = z.object({
  title: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/),
  status: z.enum(["draft", "published"]).default("draft"),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  ogImage: z.string().optional().nullable(),
});

export type PageSettingsInput = z.infer<typeof pageSettingsSchema>;

const componentDataSchema = z.looseObject({
  type: z.string(),
  props: z.looseObject({ id: z.string() }),
});

export const puckDataSchema = z.looseObject({
  root: z.looseObject({}).default({}),
  content: z.array(componentDataSchema).default([]),
  zones: z.record(z.string(), z.array(componentDataSchema)).optional(),
});

export type PuckDataInput = z.infer<typeof puckDataSchema>;

// ---- Menus ----
const menuLeafSchema = z.strictObject({
  label: z.string().min(1),
  href: z.string().min(1),
});

export const menuItemsSchema = z.array(
  menuLeafSchema.extend({
    children: z.array(menuLeafSchema).optional(),
  })
);

export const menuKeySchema = z.enum(["header", "footer"]);
export type MenuItemsInput = z.infer<typeof menuItemsSchema>;

// ---- User management ----
export const userInputSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(["admin", "staff", "customer"]),
  phone: z.string().optional().nullable(),
  password: z.string().min(6).optional(),
});

export type UserInput = z.infer<typeof userInputSchema>;
