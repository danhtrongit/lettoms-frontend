import { z } from "zod";

export const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  image: z.string().optional().nullable(),
  colorCode: z.string().min(1),
  colorName: z.string().optional().nullable(),
  sizeCode: z.string().min(1),
  sizeLabel: z.string().optional().nullable(),
  unitPrice: z.coerce.number().int().nonnegative(),
  quantity: z.coerce.number().int().positive(),
});

export const checkoutSchema = z.object({
  customerName: z.string().min(2, "Vui lòng nhập họ tên"),
  customerPhone: z
    .string()
    .min(8, "Số điện thoại không hợp lệ")
    .regex(/^[0-9+\s.-]+$/, "Số điện thoại không hợp lệ"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  shippingAddress: z.object({
    fullName: z.string().min(2),
    phone: z.string().min(8),
    email: z.string().email().optional(),
    line1: z.string().min(3, "Vui lòng nhập địa chỉ"),
    ward: z.string().optional(),
    wardCode: z.string().optional(),
    district: z.string().optional(),
    province: z.string().optional(),
    provinceCode: z.string().optional(),
  }),
  note: z.string().optional(),
  paymentMethod: z.enum(["cod", "sepay"]),
  items: z.array(checkoutItemSchema).min(1, "Giỏ hàng trống"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const orderStatusSchema = z.enum([
  "pending",
  "paid",
  "processing",
  "shipped",
  "completed",
  "cancelled",
  "refunded",
]);

export const addressInputSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(8),
  line1: z.string().min(3),
  ward: z.string().optional().nullable(),
  wardCode: z.string().optional().nullable(),
  district: z.string().optional().nullable(),
  province: z.string().optional().nullable(),
  provinceCode: z.string().optional().nullable(),
  isDefault: z.boolean().default(false),
});

export type AddressInput = z.infer<typeof addressInputSchema>;
