import { z } from "zod";

export const articleBlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("heading"), text: z.string() }),
  z.object({ type: z.literal("paragraph"), text: z.string() }),
  z.object({
    type: z.literal("image"),
    src: z.string(),
    alt: z.string().default(""),
    caption: z.string().optional(),
  }),
  z.object({ type: z.literal("quote"), text: z.string(), cite: z.string().optional() }),
]);

export const articleInputSchema = z.object({
  title: z.string().min(1, "Tiêu đề là bắt buộc"),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/),
  excerpt: z.string().default(""),
  categoryId: z.string().optional().nullable(),
  coverImage: z.string().optional().nullable(),
  author: z.string().default("Letom's"),
  publishedAt: z.coerce.date().optional(),
  readingMinutes: z.coerce.number().int().positive().default(3),
  body: z.array(articleBlockSchema).default([]),
  contentJson: z.record(z.string(), z.unknown()).nullable().optional(),
  featured: z.boolean().default(false),
  isPublished: z.boolean().default(true),
  relatedProductIds: z.array(z.string()).default([]),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  ogImage: z.string().optional().nullable(),
});

export type ArticleInput = z.infer<typeof articleInputSchema>;

export const articleCategoryInputSchema = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().default(""),
  thumbnail: z.string().optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  ogImage: z.string().optional().nullable(),
  sortOrder: z.coerce.number().int().default(0),
});

export type ArticleCategoryInput = z.infer<typeof articleCategoryInputSchema>;
