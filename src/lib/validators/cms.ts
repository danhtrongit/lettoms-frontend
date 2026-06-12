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
export const pageBlockSchema = z.object({
  id: z.string(),
  type: z.string(),
  props: z.record(z.string(), z.unknown()).default({}),
});

export const pageInputSchema = z.object({
  title: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/),
  status: z.enum(["draft", "published"]).default("draft"),
  blocks: z.array(pageBlockSchema).default([]),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  ogImage: z.string().optional().nullable(),
});

export type PageInput = z.infer<typeof pageInputSchema>;

// ---- User management ----
export const userInputSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(["admin", "staff", "customer"]),
  phone: z.string().optional().nullable(),
  password: z.string().min(6).optional(),
});

export type UserInput = z.infer<typeof userInputSchema>;
