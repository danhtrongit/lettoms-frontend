import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { users } from "./auth";
import { products, productVariants } from "./catalog";

export const orderStatus = pgEnum("order_status", [
  "pending",
  "paid",
  "processing",
  "shipped",
  "completed",
  "cancelled",
  "refunded",
]);

export const paymentMethod = pgEnum("payment_method", ["cod", "sepay"]);
export const paymentStatus = pgEnum("payment_status", [
  "unpaid",
  "paid",
  "failed",
]);
export const orderSource = pgEnum("order_source", ["storefront", "admin"]);

// ---- Customer addresses ----
export const addresses = pgTable(
  "addresses",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    fullName: text("full_name").notNull(),
    phone: text("phone").notNull(),
    line1: text("line1").notNull(),
    ward: text("ward"),
    wardCode: text("ward_code"),
    district: text("district"),
    province: text("province"),
    provinceCode: text("province_code"),
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("addresses_user_idx").on(t.userId)]
);

// ---- Orders ----
export type ShippingSnapshot = {
  fullName: string;
  phone: string;
  email?: string;
  line1: string;
  ward?: string;
  wardCode?: string;
  district?: string;
  province?: string;
  provinceCode?: string;
};

export const orders = pgTable(
  "orders",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    code: text("code").notNull().unique(), // e.g. LT-XXXXXX
    userId: text("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    status: orderStatus("status").notNull().default("pending"),
    source: orderSource("source").notNull().default("storefront"),
    paymentMethod: paymentMethod("payment_method").notNull().default("cod"),
    paymentStatus: paymentStatus("payment_status").notNull().default("unpaid"),
    // customer snapshot
    customerName: text("customer_name").notNull(),
    customerPhone: text("customer_phone").notNull(),
    customerEmail: text("customer_email"),
    shippingAddress: jsonb("shipping_address").$type<ShippingSnapshot>().notNull(),
    note: text("note"),
    // money (VND)
    subtotal: integer("subtotal").notNull(),
    shippingFee: integer("shipping_fee").notNull().default(0),
    discount: integer("discount").notNull().default(0),
    total: integer("total").notNull(),
    // payment refs
    sepayRef: text("sepay_ref"),
    paidAt: timestamp("paid_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("orders_user_idx").on(t.userId),
    index("orders_status_idx").on(t.status),
    index("orders_created_idx").on(t.createdAt),
  ]
);

export const orderItems = pgTable(
  "order_items",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: text("product_id").references(() => products.id, {
      onDelete: "set null",
    }),
    variantId: text("variant_id").references(() => productVariants.id, {
      onDelete: "set null",
    }),
    sku: text("sku").notNull(),
    nameSnapshot: text("name_snapshot").notNull(),
    image: text("image"),
    colorName: text("color_name"),
    sizeLabel: text("size_label"),
    unitPrice: integer("unit_price").notNull(),
    quantity: integer("quantity").notNull(),
    lineTotal: integer("line_total").notNull(),
  },
  (t) => [index("order_items_order_idx").on(t.orderId)]
);

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type Address = typeof addresses.$inferSelect;
