import { z } from "zod";

export const genderSchema = z.enum(["nu", "nam", "tre-em", "em-be"]);
export const productFlagSchema = z.enum([
  "new",
  "sale",
  "limited",
  "online-only",
  "bestseller",
]);

// ---- Variant (SKU) ----
export const variantSchema = z.object({
  id: z.string().optional(),
  colorCode: z.string().min(1),
  sizeCode: z.string().min(1),
  sku: z.string().min(1),
  price: z.coerce.number().int().nonnegative(),
  originalPrice: z.coerce.number().int().nonnegative().optional().nullable(),
  stock: z.coerce.number().int().nonnegative().default(0),
  image: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const productImageSchema = z.object({
  src: z.string().min(1),
  alt: z.string().default(""),
  colorCode: z.string().optional().nullable(),
});

export const productInputSchema = z.object({
  name: z.string().min(1, "Tên sản phẩm là bắt buộc"),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang"),
  gender: genderSchema,
  categoryId: z.string().optional().nullable(),
  subcategoryId: z.string().optional().nullable(),
  description: z.string().default(""),
  materials: z.string().default(""),
  care: z.string().default(""),
  descriptionJson: z.record(z.string(), z.unknown()).nullable().optional(),
  materialsJson: z.record(z.string(), z.unknown()).nullable().optional(),
  careJson: z.record(z.string(), z.unknown()).nullable().optional(),
  basePrice: z.coerce.number().int().nonnegative(),
  originalPrice: z.coerce.number().int().nonnegative().optional().nullable(),
  flags: z.array(productFlagSchema).default([]),
  thumbnail: z.string().optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  ogImage: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  colorCodes: z.array(z.string()).default([]),
  sizeCodes: z.array(z.string()).default([]),
  images: z.array(productImageSchema).default([]),
  variants: z.array(variantSchema).default([]),
});

export type ProductInput = z.infer<typeof productInputSchema>;

// ---- Category ----
export const categoryInputSchema = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/),
  gender: genderSchema,
  parentId: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  heroImage: z.string().optional().nullable(),
  iconImage: z.string().optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  ogImage: z.string().optional().nullable(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;
