import type { Color, Product, ProductFlag, Size } from "@/types";
import { slugify } from "@/lib/format";
import { uniqloItemImage, uniqloSubImage, uniqloChip } from "@/lib/uniqlo-image";

// ---- Uniqlo color-code map (displayCode -> name + swatch hex fallback) ----
const COLOR_MAP: Record<string, { name: string; hex: string }> = {
  "00": { name: "Trắng", hex: "#FFFFFF" },
  "01": { name: "Trắng Ngà", hex: "#F3EFE6" },
  "02": { name: "Hồng Nhạt", hex: "#F4D7DC" },
  "03": { name: "Xám", hex: "#9A9A9A" },
  "04": { name: "Xám Nhạt", hex: "#C9C9C9" },
  "05": { name: "Xám Đậm", hex: "#5C5C5C" },
  "06": { name: "Xám Tro", hex: "#7E7E7E" },
  "07": { name: "Xám Lông Chuột", hex: "#8C8C8C" },
  "08": { name: "Nâu", hex: "#6B4F3A" },
  "09": { name: "Đen", hex: "#1A1A1A" },
  "10": { name: "Hồng", hex: "#E8A9BC" },
  "11": { name: "Hồng Pastel", hex: "#E8B4C0" },
  "12": { name: "Tím", hex: "#7A5C8E" },
  "14": { name: "Tím Nhạt", hex: "#B6A6CE" },
  "15": { name: "Đỏ Đô", hex: "#7C2230" },
  "16": { name: "Đỏ", hex: "#B0202E" },
  "17": { name: "Cam Đất", hex: "#C0623A" },
  "18": { name: "Hồng Đậm", hex: "#D46A86" },
  "19": { name: "Be Hồng", hex: "#E4CFC4" },
  "23": { name: "Cam", hex: "#E07B39" },
  "26": { name: "Vàng Nhạt", hex: "#EDE2B0" },
  "30": { name: "Be", hex: "#D8C7A8" },
  "31": { name: "Be Sáng", hex: "#E2D4B7" },
  "32": { name: "Be Đậm", hex: "#C4AE85" },
  "33": { name: "Nâu Be", hex: "#B59B73" },
  "34": { name: "Be Hồng", hex: "#E6D2C2" },
  "35": { name: "Nâu Nhạt", hex: "#A98C6B" },
  "36": { name: "Be Tím", hex: "#CBBBC6" },
  "37": { name: "Olive Nhạt", hex: "#A4A06E" },
  "38": { name: "Xanh Rêu", hex: "#5A6B4A" },
  "39": { name: "Xám Xanh", hex: "#8895A0" },
  "40": { name: "Xanh Navy", hex: "#232C66" },
  "41": { name: "Vàng", hex: "#E8C547" },
  "42": { name: "Vàng Đậm", hex: "#D9A441" },
  "50": { name: "Xanh Bạc Hà", hex: "#ABD4C4" },
  "51": { name: "Xanh Lá Nhạt", hex: "#9CBF8E" },
  "52": { name: "Xanh Lá", hex: "#4A6B4A" },
  "53": { name: "Xanh Rêu Đậm", hex: "#3F4A35" },
  "54": { name: "Xanh Ngọc", hex: "#3DA6A0" },
  "55": { name: "Xanh Lá Tươi", hex: "#6BA368" },
  "56": { name: "Xanh Olive", hex: "#6B6B3A" },
  "57": { name: "Olive", hex: "#5C5A33" },
  "58": { name: "Xanh Cổ Vịt", hex: "#2E5E5B" },
  "60": { name: "Xanh Da Trời", hex: "#9FC1DE" },
  "61": { name: "Xanh Nhạt", hex: "#B7D2E6" },
  "62": { name: "Xanh Jean", hex: "#5E7B9C" },
  "63": { name: "Xanh Dương", hex: "#4A78B0" },
  "64": { name: "Xanh Biển", hex: "#3A6EA5" },
  "65": { name: "Xanh Đậm", hex: "#2C4E78" },
  "66": { name: "Xanh Coban", hex: "#2F4C8C" },
  "67": { name: "Xanh Indigo", hex: "#36486B" },
  "68": { name: "Xanh Than", hex: "#2A3550" },
  "69": { name: "Xanh Navy Đậm", hex: "#1F2A52" },
  "70": { name: "Xanh Đen", hex: "#22262E" },
  "71": { name: "Xanh Cốm", hex: "#C2D6A0" },
  "72": { name: "Hồng Phấn", hex: "#F0D5DC" },
  "73": { name: "Xám Be", hex: "#BDB4A6" },
};

function color(code: string, id: string): Color {
  const meta = COLOR_MAP[code] ?? { name: `Màu ${code}`, hex: "#CCCCCC" };
  return { code, name: meta.name, hex: meta.hex, chip: uniqloChip(id, code) };
}

const APPAREL_SIZES: Size[] = [
  { code: "001", label: "XS", inStock: true },
  { code: "002", label: "S", inStock: true },
  { code: "003", label: "M", inStock: true },
  { code: "004", label: "L", inStock: true },
  { code: "005", label: "XL", inStock: true },
  { code: "006", label: "XXL", inStock: false },
];

const KIDS_SIZES: Size[] = [
  { code: "k1", label: "100", inStock: true },
  { code: "k2", label: "110", inStock: true },
  { code: "k3", label: "120", inStock: true },
  { code: "k4", label: "130", inStock: true },
  { code: "k5", label: "140", inStock: false },
];

const BABY_SIZES: Size[] = [
  { code: "b1", label: "70", inStock: true },
  { code: "b2", label: "80", inStock: true },
  { code: "b3", label: "90", inStock: true },
];

// Real Uniqlo VN product seed: id, name, price, promo, color codes, rating, reviews.
interface Seed {
  id: string; // real 6-digit Uniqlo id
  name: string;
  gender: Product["gender"];
  categorySlug: string;
  subcategorySlug: string;
  price: number;
  originalPrice?: number;
  colorCodes: string[];
  rating: number;
  reviewCount: number;
  flags?: ProductFlag[];
  createdAt?: string;
}

const DESC =
  "Thiết kế tối giản, phom dáng tôn dáng cùng chất liệu cao cấp mang lại sự thoải mái cả ngày dài. Dễ phối đồ cho nhiều dịp khác nhau.";

function makeProduct(seed: Seed): Product {
  const sizes =
    seed.gender === "em-be"
      ? BABY_SIZES
      : seed.gender === "tre-em"
        ? KIDS_SIZES
        : APPAREL_SIZES;

  const colors = seed.colorCodes.map((c) => color(c, seed.id));

  // Main image per color + a couple of shared sub shots.
  const images = [
    ...colors.map((c) => ({
      src: uniqloItemImage(seed.id, c.code),
      alt: `${seed.name} - ${c.name}`,
      colorCode: c.code,
    })),
    { src: uniqloSubImage(seed.id, 3), alt: `${seed.name} - chi tiết` },
    { src: uniqloSubImage(seed.id, 4), alt: `${seed.name} - phối đồ` },
  ];

  const flags: ProductFlag[] = seed.flags ? [...seed.flags] : [];
  if (seed.originalPrice && !flags.includes("sale")) flags.push("sale");

  return {
    id: seed.id,
    slug: slugify(seed.name) + "-" + seed.id,
    name: seed.name,
    gender: seed.gender,
    categorySlug: seed.categorySlug,
    subcategorySlug: seed.subcategorySlug,
    price: seed.price,
    originalPrice: seed.originalPrice,
    description: DESC,
    materials: "Chất liệu cao cấp. Một số phối màu có thể khác biệt về thành phần.",
    care: "Giặt máy ở nhiệt độ thường. Không dùng chất tẩy. Ủi ở nhiệt độ thấp.",
    colors,
    sizes,
    images,
    flags,
    rating: seed.rating,
    reviewCount: seed.reviewCount,
    createdAt: seed.createdAt ?? "2026-05-01",
  };
}

const seeds: Seed[] = [
  // ===================== NỮ =====================
  // --- nu / ao / ao-thun ---
  { id: "484421", name: "Áo Thun In Họa Tiết", gender: "nu", categorySlug: "ao", subcategorySlug: "ao-thun", price: 391000, colorCodes: ["10", "00", "03", "09"], rating: 5, reviewCount: 14, flags: ["bestseller"] },
  { id: "483268", name: "Áo Thun In Họa Tiết Dáng Boxy", gender: "nu", categorySlug: "ao", subcategorySlug: "ao-thun", price: 391000, colorCodes: ["00", "03", "09"], rating: 5, reviewCount: 19, flags: ["new"] },
  { id: "435193", name: "Áo Thun Cổ Tròn", gender: "nu", categorySlug: "ao", subcategorySlug: "ao-thun", price: 293000, colorCodes: ["15", "00", "09", "10", "37", "40", "53", "64", "69", "70"], rating: 4.9, reviewCount: 8968, flags: ["bestseller"] },
  { id: "483576", name: "Áo Thun Slub Jersey Cổ V", gender: "nu", categorySlug: "ao", subcategorySlug: "ao-thun", price: 293000, colorCodes: ["40", "00", "03", "09", "10", "58", "60", "69"], rating: 4.8, reviewCount: 524 },
  { id: "485025", name: "Áo Thun Mini Vải Pointelle Cổ Tròn", gender: "nu", categorySlug: "ao", subcategorySlug: "ao-thun", price: 293000, colorCodes: ["00", "09", "18", "40"], rating: 4.8, reviewCount: 88, flags: ["new"] },
  { id: "484457", name: "Áo Thun Mini", gender: "nu", categorySlug: "ao", subcategorySlug: "ao-thun", price: 293000, colorCodes: ["50", "01", "09", "38"], rating: 4.8, reviewCount: 198 },
  { id: "484266", name: "Áo Thun Mini Kẻ Sọc", gender: "nu", categorySlug: "ao", subcategorySlug: "ao-thun", price: 293000, colorCodes: ["41", "60", "31"], rating: 4.9, reviewCount: 167 },
  { id: "465187", name: "Áo Thun Dry Nhiều Màu", gender: "nu", categorySlug: "ao", subcategorySlug: "ao-thun", price: 126000, colorCodes: ["26", "00", "03", "06", "09", "38", "58", "66", "69"], rating: 4.8, reviewCount: 2087, flags: ["bestseller"] },

  // --- nu / ao / ao-len ---
  { id: "483576", name: "Áo Len Cổ V Sợi Mịn", gender: "nu", categorySlug: "ao", subcategorySlug: "ao-len", price: 599000, originalPrice: 799000, colorCodes: ["40", "00", "58", "60"], rating: 4.8, reviewCount: 524 },

  // --- nu / quan / quan-shorts ---
  { id: "482172", name: "Quần Shorts Vải Linen Cotton Kẻ Sọc", gender: "nu", categorySlug: "quan", subcategorySlug: "quan-shorts", price: 489000, originalPrice: 588000, colorCodes: ["52", "64"], rating: 4.8, reviewCount: 49 },
  { id: "485575", name: "Quần Easy Shorts Vải Pha Linen Kẻ Sọc", gender: "nu", categorySlug: "quan", subcategorySlug: "quan-shorts", price: 391000, colorCodes: ["63", "11"], rating: 4.7, reviewCount: 38, flags: ["new"] },
  { id: "485251", name: "Quần Easy Shorts Vải Pha Linen", gender: "nu", categorySlug: "quan", subcategorySlug: "quan-shorts", price: 391000, colorCodes: ["30", "37", "61", "69"], rating: 4.8, reviewCount: 126 },
  { id: "473696", name: "Quần Shorts Vải Linen Cotton", gender: "nu", categorySlug: "quan", subcategorySlug: "quan-shorts", price: 489000, originalPrice: 588000, colorCodes: ["32", "01", "09", "38", "53"], rating: 4.8, reviewCount: 651 },
  { id: "483913", name: "Quần Easy Shorts Vải Cotton Kẻ Sọc", gender: "nu", categorySlug: "quan", subcategorySlug: "quan-shorts", price: 391000, colorCodes: ["30", "68"], rating: 4.9, reviewCount: 111 },
  { id: "483912", name: "Quần Easy Shorts Vải Cotton Denim", gender: "nu", categorySlug: "quan", subcategorySlug: "quan-shorts", price: 391000, colorCodes: ["65", "67"], rating: 4.9, reviewCount: 136 },

  // --- nu / ao-khoac ---
  { id: "484610", name: "Áo Khoác Harrington", gender: "nu", categorySlug: "ao-khoac", subcategorySlug: "ao-khoac-nhe", price: 1275000, colorCodes: ["38", "09", "32", "69"], rating: 4.9, reviewCount: 146, flags: ["bestseller"] },

  // --- nu / do-mac-trong / ao-bra-top ---
  { id: "482197", name: "Áo Bra Top Vải Gân Dáng Ngắn", gender: "nu", categorySlug: "do-mac-trong", subcategorySlug: "ao-bra-top", price: 391000, originalPrice: 489000, colorCodes: ["18", "00", "09", "31", "60"], rating: 4.9, reviewCount: 146 },
  { id: "473985", name: "Áo Bra Top Vải Gân Dáng Ngắn", gender: "nu", categorySlug: "do-mac-trong", subcategorySlug: "ao-bra-top", price: 391000, originalPrice: 489000, colorCodes: ["00"], rating: 4.8, reviewCount: 539 },
  { id: "482181", name: "AIRism Áo Bra Top Không Tay", gender: "nu", categorySlug: "do-mac-trong", subcategorySlug: "ao-bra-top", price: 489000, colorCodes: ["69", "00", "02", "39", "63"], rating: 4.9, reviewCount: 219, flags: ["bestseller"] },
  { id: "465707", name: "AIRism Áo Bra Top Hai Dây", gender: "nu", categorySlug: "do-mac-trong", subcategorySlug: "ao-bra-top", price: 489000, colorCodes: ["34", "00", "09", "12"], rating: 4.9, reviewCount: 690 },
  { id: "484603", name: "Áo Bra Top Hai Dây Vải Nhún", gender: "nu", categorySlug: "do-mac-trong", subcategorySlug: "ao-bra-top", price: 391000, originalPrice: 489000, colorCodes: ["09", "34", "52"], rating: 4.9, reviewCount: 45, flags: ["new"] },
  { id: "482329", name: "Áo Bra Top Lưng Chéo", gender: "nu", categorySlug: "do-mac-trong", subcategorySlug: "ao-bra-top", price: 489000, colorCodes: ["10", "00", "02", "09", "57"], rating: 4.8, reviewCount: 192 },

  // ===================== NAM =====================
  // --- nam / ao / ao-thun ---
  { id: "484508", name: "AIRism Cotton Áo Thun Dáng Rộng Kẻ Sọc", gender: "nam", categorySlug: "ao", subcategorySlug: "ao-thun", price: 391000, colorCodes: ["00", "04", "09", "69"], rating: 4.8, reviewCount: 113, flags: ["new"] },
  { id: "465185", name: "AIRism Cotton Áo Thun Dáng Rộng Tay Lỡ", gender: "nam", categorySlug: "ao", subcategorySlug: "ao-thun", price: 293000, originalPrice: 391000, colorCodes: ["50", "00", "02", "07", "09", "17", "58", "69"], rating: 4.8, reviewCount: 4907, flags: ["bestseller"] },
  { id: "487505", name: "AIRism Cotton Áo Thun Dài Tay", gender: "nam", categorySlug: "ao", subcategorySlug: "ao-thun", price: 391000, colorCodes: ["00", "09"], rating: 5, reviewCount: 14, flags: ["new"] },
  { id: "465193", name: "AIRism Cotton Áo Thun", gender: "nam", categorySlug: "ao", subcategorySlug: "ao-thun", price: 391000, colorCodes: ["68", "00", "09", "30", "39", "52"], rating: 4.8, reviewCount: 837 },
  { id: "422992", name: "Áo Thun Cổ Tròn Supima Cotton", gender: "nam", categorySlug: "ao", subcategorySlug: "ao-thun", price: 293000, colorCodes: ["40", "00", "03", "07", "09", "16", "23", "32", "38", "53", "66", "73"], rating: 4.8, reviewCount: 6228, flags: ["bestseller"] },
  { id: "474244", name: "AIRism Cotton Áo Thun Cổ Tròn", gender: "nam", categorySlug: "ao", subcategorySlug: "ao-thun", price: 244000, colorCodes: ["07", "00", "09", "69"], rating: 4.8, reviewCount: 360 },

  // --- nam / quan / quan-shorts ---
  { id: "478265", name: "Quần Short Co Giãn Dáng Ôm", gender: "nam", categorySlug: "quan", subcategorySlug: "quan-shorts", price: 588000, colorCodes: ["09"], rating: 4.8, reviewCount: 51 },
  { id: "455533", name: "Quần Shorts Co Giãn Dáng Ôm", gender: "nam", categorySlug: "quan", subcategorySlug: "quan-shorts", price: 588000, colorCodes: ["05", "00", "32", "57", "69"], rating: 4.8, reviewCount: 617, flags: ["bestseller"] },
  { id: "482944", name: "Quần Shorts Chino", gender: "nam", categorySlug: "quan", subcategorySlug: "quan-shorts", price: 588000, colorCodes: ["32", "01", "08", "55", "66", "69"], rating: 4.8, reviewCount: 71 },
  { id: "482952", name: "AirSense Quần Shorts", gender: "nam", categorySlug: "quan", subcategorySlug: "quan-shorts", price: 588000, colorCodes: ["32", "00", "09", "56"], rating: 5, reviewCount: 26, flags: ["new"] },

  // ===================== TRẺ EM =====================
  // --- tre-em / ao / ao-thun ---
  { id: "483430", name: "DRY-EX Áo Thun Trẻ Em", gender: "tre-em", categorySlug: "ao", subcategorySlug: "ao-thun", price: 244000, colorCodes: ["09", "67"], rating: 5, reviewCount: 10, flags: ["new"] },
  { id: "483428", name: "DRY-EX Áo Thun Trẻ Em", gender: "tre-em", categorySlug: "ao", subcategorySlug: "ao-thun", price: 244000, colorCodes: ["61", "71"], rating: 4.9, reviewCount: 30 },
  { id: "483418", name: "AIRism Cotton Áo Thun In Họa Tiết Ringer", gender: "tre-em", categorySlug: "ao", subcategorySlug: "ao-thun", price: 195000, colorCodes: ["01"], rating: 4.9, reviewCount: 406 },
  { id: "474592", name: "AIRism Cotton Áo Thun Trẻ Em", gender: "tre-em", categorySlug: "ao", subcategorySlug: "ao-thun", price: 195000, colorCodes: ["63", "00", "09", "11", "41"], rating: 4.9, reviewCount: 1000, flags: ["bestseller"] },
  { id: "483426", name: "AIRism Cotton Áo Thun Kẻ Sọc", gender: "tre-em", categorySlug: "ao", subcategorySlug: "ao-thun", price: 195000, colorCodes: ["61", "11", "69"], rating: 4.9, reviewCount: 175 },

  // --- tre-em / quan / quan-shorts ---
  { id: "488197", name: "Quần Shorts Jeans Dáng Baggy", gender: "tre-em", categorySlug: "quan", subcategorySlug: "quan-shorts", price: 391000, colorCodes: ["62", "65"], rating: 4.8, reviewCount: 49, flags: ["new"] },
  { id: "483406", name: "Quần Shorts Geared", gender: "tre-em", categorySlug: "quan", subcategorySlug: "quan-shorts", price: 293000, colorCodes: ["30", "09", "15", "34", "41", "51", "57"], rating: 4.9, reviewCount: 97, flags: ["bestseller"] },
  { id: "465112", name: "Quần Easy Short Trẻ Em", gender: "tre-em", categorySlug: "quan", subcategorySlug: "quan-shorts", price: 293000, colorCodes: ["31", "56", "69"], rating: 4.9, reviewCount: 209 },

  // ===================== EM BÉ =====================
  // --- em-be / quan / quan-legging ---
  { id: "460776", name: "Quần Leggings Vải Gân Em Bé", gender: "em-be", categorySlug: "quan", subcategorySlug: "quan-legging", price: 146000, colorCodes: ["00", "72"], rating: 4.8, reviewCount: 89, flags: ["bestseller"] },
  { id: "481881", name: "Quần Leggings Họa Tiết Vải Gân", gender: "em-be", categorySlug: "quan", subcategorySlug: "quan-legging", price: 146000, colorCodes: ["10"], rating: 4.9, reviewCount: 15, flags: ["new"] },
  { id: "469617", name: "Quần Leggings Vải Denim-like Dáng Relax", gender: "em-be", categorySlug: "quan", subcategorySlug: "quan-legging", price: 146000, colorCodes: ["69"], rating: 4.9, reviewCount: 34 },
];

export const products: Product[] = seeds.map(makeProduct);
