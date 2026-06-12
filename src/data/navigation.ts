import type { NavColumn, NavItem } from "@/types";
import { genders } from "./site";
import { getCategoriesByGender } from "./categories";

function buildGenderColumns(gender: NavItem["gender"]): NavColumn[] {
  if (!gender) return [];
  return getCategoriesByGender(gender).map((cat) => ({
    title: cat.name,
    items: [
      { label: `Tất cả ${cat.name}`, href: `/${gender}/${cat.slug}` },
      ...cat.subcategories.map((sub) => ({
        label: sub.name,
        href: `/${gender}/${cat.slug}/${sub.slug}`,
      })),
    ],
  }));
}

// Primary navigation: one entry per gender with a full mega-menu, plus features + news.
export const mainNav: NavItem[] = [
  ...genders.map<NavItem>((g) => ({
    label: g.name,
    href: `/${g.slug}`,
    gender: g.slug,
    columns: buildGenderColumns(g.slug),
    promo: {
      image: `/images/nav/${g.slug}.jpg`,
      title: `Bộ sưu tập ${g.name} mới`,
      href: `/uu-dai/hang-moi`,
    },
  })),
  {
    label: "Khuyến Mãi",
    href: "/uu-dai/khuyen-mai",
  },
  {
    label: "Hàng Mới",
    href: "/uu-dai/hang-moi",
  },
  {
    label: "Tin Tức",
    href: "/tin-tuc",
  },
];

// Utility links shown in the header top row / mobile drawer footer.
export const utilityNav: NavItem[] = [
  { label: "Cửa Hàng", href: "/cua-hang" },
  { label: "Trợ Giúp", href: "/ho-tro" },
  { label: "Về Letom's", href: "/gioi-thieu" },
];

// Footer link columns.
export const footerNav: NavColumn[] = [
  {
    title: "Mua Sắm",
    items: [
      { label: "Nữ", href: "/nu" },
      { label: "Nam", href: "/nam" },
      { label: "Hàng Mới", href: "/uu-dai/hang-moi" },
      { label: "Khuyến Mãi", href: "/uu-dai/khuyen-mai" },
    ],
  },
  {
    title: "Hỗ Trợ Khách Hàng",
    items: [
      { label: "Trung Tâm Trợ Giúp", href: "/ho-tro" },
      { label: "Câu Hỏi Thường Gặp", href: "/cau-hoi-thuong-gap" },
      { label: "Hướng Dẫn Chọn Size", href: "/huong-dan-size" },
      { label: "Vận Chuyển & Đổi Trả", href: "/van-chuyen-doi-tra" },
      { label: "Liên Hệ", href: "/lien-he" },
    ],
  },
  {
    title: "Về Letom's",
    items: [
      { label: "Câu Chuyện Thương Hiệu", href: "/gioi-thieu" },
      { label: "Hệ Thống Cửa Hàng", href: "/cua-hang" },
      { label: "Tin Tức", href: "/tin-tuc" },
      { label: "Tuyển Dụng", href: "/gioi-thieu#careers" },
    ],
  },
  {
    title: "Chính Sách",
    items: [
      { label: "Điều Khoản Sử Dụng", href: "/dieu-khoan" },
      { label: "Chính Sách Bảo Mật", href: "/bao-mat" },
      { label: "Vận Chuyển & Đổi Trả", href: "/van-chuyen-doi-tra" },
    ],
  },
];
