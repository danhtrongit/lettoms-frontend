import type { Category, Gender } from "@/types";
import { uniqloItemImage } from "@/lib/uniqlo-image";

const img = (id: string, color: string) => uniqloItemImage(id, color, 400);

// Category hierarchy modeled on Uniqlo VN's real taxonomy, with Vietnamese slugs.
export const categories: Category[] = [
  // ---------------- NỮ ----------------
  {
    slug: "ao",
    name: "Áo",
    gender: "nu",
    description: "Áo thun, áo sơ mi, áo kiểu và áo nỉ cơ bản cho mọi dịp.",
    iconImage: img("484421", "10"),
    subcategories: [
      { slug: "ao-thun", name: "Áo Thun", iconImage: img("484421", "10") },
      { slug: "ao-so-mi", name: "Áo Sơ Mi & Áo Kiểu" },
      { slug: "ao-len", name: "Áo Len & Áo Dệt Kim", iconImage: img("483576", "40") },
      { slug: "ao-ni-hoodie", name: "Áo Nỉ & Hoodie", iconImage: img("485025", "00") },
    ],
  },
  {
    slug: "quan",
    name: "Quần",
    gender: "nu",
    description: "Quần jeans, quần âu, quần shorts và culottes.",
    iconImage: img("473696", "32"),
    subcategories: [
      { slug: "quan-jeans", name: "Quần Jeans" },
      { slug: "quan-au", name: "Quần Âu & Quần Dài" },
      { slug: "quan-shorts", name: "Quần Shorts & Culottes", iconImage: img("473696", "32") },
      { slug: "quan-legging", name: "Quần Legging" },
    ],
  },
  {
    slug: "ao-khoac",
    name: "Áo Khoác",
    gender: "nu",
    description: "Áo khoác nhẹ, áo phao và blazer.",
    iconImage: img("484610", "38"),
    subcategories: [
      { slug: "ao-khoac-nhe", name: "Áo Khoác Nhẹ", iconImage: img("484610", "38") },
      { slug: "ao-phao", name: "Áo Phao & Áo Lông Vũ" },
      { slug: "blazer", name: "Blazer & Áo Vest" },
    ],
  },
  {
    slug: "dam-va-chan-vay",
    name: "Đầm & Chân Váy",
    gender: "nu",
    description: "Đầm liền và chân váy thanh lịch.",
    iconImage: img("485025", "40"),
    subcategories: [
      { slug: "dam", name: "Đầm" },
      { slug: "chan-vay", name: "Chân Váy" },
    ],
  },
  {
    slug: "do-mac-trong",
    name: "Đồ Mặc Trong",
    gender: "nu",
    description: "Bra top, AIRism, HEATTECH và đồ mặc trong.",
    iconImage: img("482181", "69"),
    subcategories: [
      { slug: "ao-bra-top", name: "Áo Bra Top", iconImage: img("482181", "69") },
      { slug: "airism", name: "AIRism" },
      { slug: "heattech", name: "HEATTECH" },
      { slug: "do-mac-nha", name: "Đồ Mặc Nhà" },
    ],
  },

  // ---------------- NAM ----------------
  {
    slug: "ao",
    name: "Áo",
    gender: "nam",
    description: "Áo thun, áo polo, sơ mi và áo nỉ nam.",
    iconImage: img("422992", "00"),
    subcategories: [
      { slug: "ao-thun", name: "Áo Thun", iconImage: img("422992", "00") },
      { slug: "ao-polo", name: "Áo Polo" },
      { slug: "ao-so-mi", name: "Áo Sơ Mi" },
      { slug: "ao-len", name: "Áo Len & Dệt Kim" },
      { slug: "ao-ni-hoodie", name: "Áo Nỉ & Hoodie" },
    ],
  },
  {
    slug: "quan",
    name: "Quần",
    gender: "nam",
    description: "Quần jeans, quần âu, chinos và shorts nam.",
    iconImage: img("482944", "32"),
    subcategories: [
      { slug: "quan-jeans", name: "Quần Jeans" },
      { slug: "quan-chinos", name: "Quần Chinos & Âu" },
      { slug: "quan-shorts", name: "Quần Shorts", iconImage: img("482944", "32") },
      { slug: "quan-jogger", name: "Quần Nỉ & Jogger" },
    ],
  },
  {
    slug: "ao-khoac",
    name: "Áo Khoác",
    gender: "nam",
    description: "Áo khoác, áo phao và blazer nam.",
    iconImage: img("484508", "09"),
    subcategories: [
      { slug: "ao-khoac-nhe", name: "Áo Khoác Nhẹ" },
      { slug: "ao-phao", name: "Áo Phao & Lông Vũ" },
      { slug: "blazer", name: "Áo Khoác & Blazer" },
    ],
  },
  {
    slug: "do-mac-trong",
    name: "Đồ Mặc Trong",
    gender: "nam",
    description: "AIRism, HEATTECH và đồ lót nam.",
    iconImage: img("474244", "07"),
    subcategories: [
      { slug: "airism", name: "AIRism" },
      { slug: "heattech", name: "HEATTECH" },
      { slug: "do-lot", name: "Đồ Lót" },
    ],
  },

  // ---------------- TRẺ EM ----------------
  {
    slug: "ao",
    name: "Áo",
    gender: "tre-em",
    description: "Áo thun, áo nỉ và sơ mi cho bé.",
    iconImage: img("474592", "63"),
    subcategories: [
      { slug: "ao-thun", name: "Áo Thun", iconImage: img("474592", "63") },
      { slug: "ao-ni-hoodie", name: "Áo Nỉ & Hoodie" },
      { slug: "ao-so-mi", name: "Áo Sơ Mi" },
    ],
  },
  {
    slug: "quan",
    name: "Quần",
    gender: "tre-em",
    description: "Quần dài, shorts và legging cho bé.",
    iconImage: img("483406", "30"),
    subcategories: [
      { slug: "quan-dai", name: "Quần Dài" },
      { slug: "quan-shorts", name: "Quần Shorts", iconImage: img("483406", "30") },
    ],
  },
  {
    slug: "ao-khoac",
    name: "Áo Khoác",
    gender: "tre-em",
    description: "Áo khoác và áo phao cho bé.",
    iconImage: img("483430", "09"),
    subcategories: [
      { slug: "ao-khoac", name: "Áo Khoác" },
      { slug: "ao-phao", name: "Áo Phao" },
    ],
  },

  // ---------------- EM BÉ ----------------
  {
    slug: "ao",
    name: "Áo",
    gender: "em-be",
    description: "Áo và bodysuit cho em bé.",
    iconImage: img("460776", "00"),
    subcategories: [
      { slug: "bodysuit", name: "Bodysuit" },
      { slug: "ao-thun", name: "Áo Thun" },
    ],
  },
  {
    slug: "quan",
    name: "Quần",
    gender: "em-be",
    description: "Quần legging và quần dài cho em bé.",
    iconImage: img("460776", "00"),
    subcategories: [
      { slug: "quan-legging", name: "Quần Legging", iconImage: img("460776", "00") },
      { slug: "quan-dai", name: "Quần Dài" },
    ],
  },
  {
    slug: "bo-do",
    name: "Bộ Đồ",
    gender: "em-be",
    description: "Bộ quần áo và đồ ngủ cho em bé.",
    iconImage: img("469617", "69"),
    subcategories: [
      { slug: "bo-quan-ao", name: "Bộ Quần Áo" },
      { slug: "do-ngu", name: "Đồ Ngủ" },
    ],
  },
];

export function getCategoriesByGender(gender: Gender): Category[] {
  return categories.filter((c) => c.gender === gender);
}

export function getCategory(
  gender: Gender,
  slug: string
): Category | undefined {
  return categories.find((c) => c.gender === gender && c.slug === slug);
}
