import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";
import type { SiteSettings } from "@/db/schema/cms";

const DEFAULTS: SiteSettings = {
  brandName: "Letom's",
  logo: "/logo.png",
  favicon: "/icon.png",
  phone: "1800 1000",
  email: "cskh@letoms.vn",
  address: "129/66/20 Liên Khu 5-6, Bình Hưng Hòa B, Bình Tân, TP. Hồ Chí Minh",
  social: {},
  announcementBar: {
    enabled: true,
    text: "Miễn phí giao hàng cho đơn từ 499.000 VND · Đổi trả trong 30 ngày",
  },
  freeshipThreshold: 499000,
  gift: { enabled: false, threshold: 0, label: "" },
};

export const getSettings = cache(async (): Promise<SiteSettings> => {
  const row = await db.query.settings.findFirst({
    where: eq(settings.key, "site"),
  });
  if (!row) return DEFAULTS;
  return { ...DEFAULTS, ...row.value };
});

export async function saveSettings(value: SiteSettings): Promise<void> {
  await db
    .insert(settings)
    .values({ key: "site", value, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value, updatedAt: new Date() },
    });
}
