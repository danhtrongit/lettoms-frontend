import type { Gender } from "@/types";

export const siteConfig = {
  name: "Letom's",
  legalName: "Letom's®",
  tagline: "Thời trang cơ bản, chất lượng cao cho mọi ngày",
  description:
    "Letom's — thương hiệu thời trang LifeWear mang đến quần áo cơ bản, chất lượng cao với thiết kế tối giản, bền bỉ cho nam, nữ và trẻ em.",
  url: "https://letoms.vn",
  locale: "vi-VN",
  currency: "VND",
  email: "cskh@letoms.vn",
  phone: "1800 1000",
  keywords: [
    "Letom's",
    "thời trang",
    "quần áo cơ bản",
    "lifewear",
    "thời trang nam",
    "thời trang nữ",
    "áo thun",
    "quần áo trẻ em",
  ],
  social: {
    facebook: "https://facebook.com/letoms",
    instagram: "https://instagram.com/letoms",
    youtube: "https://youtube.com/@letoms",
    tiktok: "https://tiktok.com/@letoms",
  },
  ogImage: "/og-image.png",
} as const;

export const genders: { slug: Gender; name: string }[] = [
  { slug: "nu", name: "Nữ" },
  { slug: "nam", name: "Nam" },
];

export const genderLabel: Record<Gender, string> = {
  "nu": "Nữ",
  "nam": "Nam",
};
