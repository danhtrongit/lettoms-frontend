import { sql } from "drizzle-orm";
import { db } from "@/db";
import {
  products,
  orders,
  users,
  articles,
  media,
} from "@/db/schema";

export interface AdminStats {
  products: number;
  orders: number;
  pendingOrders: number;
  revenue: number;
  customers: number;
  articles: number;
  media: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const [p] = await db.select({ c: sql<number>`count(*)::int` }).from(products);
  const [o] = await db.select({ c: sql<number>`count(*)::int` }).from(orders);
  const [op] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(orders)
    .where(sql`${orders.status} = 'pending'`);
  const [rev] = await db
    .select({ s: sql<number>`coalesce(sum(${orders.total}), 0)::bigint` })
    .from(orders)
    .where(sql`${orders.paymentStatus} = 'paid'`);
  const [c] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(users)
    .where(sql`${users.role} = 'customer'`);
  const [a] = await db.select({ c: sql<number>`count(*)::int` }).from(articles);
  const [m] = await db.select({ c: sql<number>`count(*)::int` }).from(media);

  return {
    products: p?.c ?? 0,
    orders: o?.c ?? 0,
    pendingOrders: op?.c ?? 0,
    revenue: Number(rev?.s ?? 0),
    customers: c?.c ?? 0,
    articles: a?.c ?? 0,
    media: m?.c ?? 0,
  };
}
