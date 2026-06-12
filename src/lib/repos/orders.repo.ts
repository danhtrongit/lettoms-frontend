import { eq, desc, and, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  orders,
  orderItems,
  productVariants,
} from "@/db/schema";
import type { Order, OrderItem } from "@/db/schema/commerce";
import type { CheckoutInput } from "@/lib/validators/commerce";
import { getSettings } from "@/lib/repos/settings.repo";
import { sendMail } from "@/lib/email/transport";
import {
  orderConfirmationEmail,
  orderStatusEmail,
} from "@/lib/email/templates";

function genOrderCode(): string {
  const ts = Date.now().toString(36).toUpperCase().slice(-6);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `LT${ts}${rand}`;
}

export interface CreatedOrder {
  id: string;
  code: string;
  total: number;
  paymentMethod: "cod" | "sepay";
}

/**
 * Create an order from a checkout payload.
 * Runs in a transaction: validates variant stock, decrements it, writes order + items.
 */
export async function createOrder(
  input: CheckoutInput,
  userId: string | null,
  source: "storefront" | "admin" = "storefront"
): Promise<CreatedOrder> {
  const settings = await getSettings();

  const subtotal = input.items.reduce(
    (sum, it) => sum + it.unitPrice * it.quantity,
    0
  );
  const freeshipThreshold = settings.freeshipThreshold || 0;
  const shippingFee =
    freeshipThreshold > 0 && subtotal >= freeshipThreshold ? 0 : 30000;
  const discount = 0;
  const total = subtotal + shippingFee - discount;

  const created = await db.transaction(async (tx) => {
    // Resolve variant + validate/decrement stock for each item.
    const resolved: {
      productId: string;
      variantId: string;
      sku: string;
      name: string;
      image: string | null;
      colorName: string | null;
      sizeLabel: string | null;
      unitPrice: number;
      quantity: number;
    }[] = [];

    for (const item of input.items) {
      const [variant] = await tx
        .select()
        .from(productVariants)
        .where(
          and(
            eq(productVariants.productId, item.productId),
            eq(productVariants.colorCode, item.colorCode),
            eq(productVariants.sizeCode, item.sizeCode)
          )
        )
        .for("update");
      if (!variant) {
        throw new Error(`Không tìm thấy biến thể cho "${item.name}".`);
      }
      if (variant.stock < item.quantity) {
        throw new Error(`Sản phẩm "${item.name}" không đủ tồn kho.`);
      }
      await tx
        .update(productVariants)
        .set({ stock: variant.stock - item.quantity })
        .where(eq(productVariants.id, variant.id));

      resolved.push({
        productId: item.productId,
        variantId: variant.id,
        sku: variant.sku,
        name: item.name,
        image: item.image ?? null,
        colorName: item.colorName ?? null,
        sizeLabel: item.sizeLabel ?? null,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
      });
    }

    const code = genOrderCode();
    const [order] = await tx
      .insert(orders)
      .values({
        code,
        userId: userId ?? null,
        status: "pending",
        source,
        paymentMethod: input.paymentMethod,
        paymentStatus: "unpaid",
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerEmail: input.customerEmail || null,
        shippingAddress: input.shippingAddress,
        note: input.note ?? null,
        subtotal,
        shippingFee,
        discount,
        total,
      })
      .returning({ id: orders.id, code: orders.code });

    await tx.insert(orderItems).values(
      resolved.map((it) => ({
        orderId: order.id,
        productId: it.productId,
        variantId: it.variantId,
        sku: it.sku,
        nameSnapshot: it.name,
        image: it.image,
        colorName: it.colorName,
        sizeLabel: it.sizeLabel,
        unitPrice: it.unitPrice,
        quantity: it.quantity,
        lineTotal: it.unitPrice * it.quantity,
      }))
    );

    return { id: order.id, code: order.code, total, paymentMethod: input.paymentMethod };
  });

  // Send confirmation email (best-effort, outside the transaction).
  if (input.customerEmail) {
    const { subject, html } = orderConfirmationEmail({
      code: created.code,
      customerName: input.customerName,
      total: created.total,
      paymentMethod: created.paymentMethod,
      items: input.items.map((it) => ({
        name: it.name,
        quantity: it.quantity,
        lineTotal: it.unitPrice * it.quantity,
      })),
    });
    void sendMail({ to: input.customerEmail, subject, html });
  }

  return created;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export async function getOrderByCode(code: string): Promise<OrderWithItems | undefined> {
  const order = await db.query.orders.findFirst({
    where: eq(orders.code, code),
    with: { items: true },
  });
  return order as OrderWithItems | undefined;
}

export async function getOrderById(id: string): Promise<OrderWithItems | undefined> {
  const order = await db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: { items: true },
  });
  return order as OrderWithItems | undefined;
}

export async function listOrdersByUser(userId: string): Promise<Order[]> {
  return db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));
}

export interface AdminOrderRow {
  id: string;
  code: string;
  customerName: string;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: Date;
}

export async function listOrdersAdmin(statusFilter?: string): Promise<AdminOrderRow[]> {
  const where = statusFilter
    ? eq(orders.status, statusFilter as Order["status"])
    : undefined;
  const rows = await db
    .select()
    .from(orders)
    .where(where)
    .orderBy(desc(orders.createdAt));
  return rows.map((r) => ({
    id: r.id,
    code: r.code,
    customerName: r.customerName,
    total: r.total,
    status: r.status,
    paymentMethod: r.paymentMethod,
    paymentStatus: r.paymentStatus,
    createdAt: r.createdAt,
  }));
}

export async function updateOrderStatus(
  id: string,
  status: Order["status"]
): Promise<void> {
  const [updated] = await db
    .update(orders)
    .set({ status, updatedAt: new Date() })
    .where(eq(orders.id, id))
    .returning({
      code: orders.code,
      customerName: orders.customerName,
      customerEmail: orders.customerEmail,
    });

  // Notify customer of the status change (best-effort).
  if (updated?.customerEmail) {
    const { subject, html } = orderStatusEmail({
      code: updated.code,
      customerName: updated.customerName,
      status,
    });
    void sendMail({ to: updated.customerEmail, subject, html });
  }
}

/** List pending sepay order codes for webhook matching. */
export async function listUnpaidSepayCodes(): Promise<string[]> {
  const rows = await db
    .select({ code: orders.code })
    .from(orders)
    .where(
      and(eq(orders.paymentMethod, "sepay"), eq(orders.paymentStatus, "unpaid"))
    );
  return rows.map((r) => r.code);
}

/**
 * Mark an order paid from a SePay webhook. Idempotent via sepayRef:
 * if the same reference was already recorded, do nothing.
 */
export async function markOrderPaidBySepay(params: {
  code: string;
  sepayRef: string;
  amount: number;
}): Promise<{ updated: boolean; reason?: string }> {
  return db.transaction(async (tx) => {
    const [order] = await tx
      .select()
      .from(orders)
      .where(eq(orders.code, params.code))
      .for("update");
    if (!order) return { updated: false, reason: "order_not_found" };
    if (order.paymentStatus === "paid") return { updated: false, reason: "already_paid" };
    if (order.sepayRef === params.sepayRef)
      return { updated: false, reason: "duplicate_ref" };
    if (params.amount < order.total) return { updated: false, reason: "amount_mismatch" };

    await tx
      .update(orders)
      .set({
        paymentStatus: "paid",
        status: "paid",
        sepayRef: params.sepayRef,
        paidAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(orders.id, order.id));
    return { updated: true };
  });
}

export async function getOrderStats(): Promise<{ count: number }> {
  const [r] = await db.select({ c: sql<number>`count(*)::int` }).from(orders);
  return { count: r?.c ?? 0 };
}
