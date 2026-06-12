// Core domain types for the Letom's storefront

export type Gender = "nu" | "nam";

export type ProductFlag = "new" | "sale" | "limited" | "online-only" | "bestseller";

export interface Color {
  /** display code, e.g. "10" */
  code: string;
  name: string;
  /** hex used as the swatch chip fallback */
  hex: string;
  /** Uniqlo chip image url for the swatch (preferred over hex) */
  chip?: string;
}

export interface Size {
  code: string;
  label: string; // XS, S, M...
  inStock: boolean;
}

export interface ProductImage {
  src: string;
  alt: string;
  /** color code this image belongs to (optional) */
  colorCode?: string;
}

export interface Product {
  id: string; // e.g. "E484421-000"
  slug: string;
  name: string;
  gender: Gender;
  categorySlug: string;
  subcategorySlug?: string;
  /** current price in VND */
  price: number;
  /** original price in VND when on sale */
  originalPrice?: number;
  description: string;
  materials: string;
  care: string;
  /** cached sanitized HTML from Tiptap (preferred over plain text when present) */
  descriptionHtml?: string | null;
  materialsHtml?: string | null;
  careHtml?: string | null;
  colors: Color[];
  sizes: Size[];
  images: ProductImage[];
  flags: ProductFlag[];
  rating: number; // 0-5
  reviewCount: number;
  createdAt: string; // ISO date
}

export interface Subcategory {
  slug: string;
  name: string;
  /** representative product image for icon grids */
  iconImage?: string;
}

export interface Category {
  slug: string;
  name: string;
  gender: Gender;
  description?: string;
  heroImage?: string;
  /** representative product image for icon grids */
  iconImage?: string;
  subcategories: Subcategory[];
}

export interface NavColumn {
  title: string;
  items: { label: string; href: string }[];
}

export interface NavItem {
  label: string;
  href: string;
  gender?: Gender;
  /** mega-menu columns */
  columns?: NavColumn[];
  /** optional promo image in the mega-menu */
  promo?: { image: string; title: string; href: string };
}

export interface Breadcrumb {
  label: string;
  href?: string;
}

export type ArticleCategorySlug =
  | "phong-cach"
  | "cau-chuyen"
  | "ben-vung"
  | "hop-tac"
  | "tin-tuc";

export interface ArticleCategory {
  slug: ArticleCategorySlug;
  name: string;
  description: string;
}

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: ArticleCategorySlug;
  coverImage: string;
  author: string;
  publishedAt: string; // ISO
  readingMinutes: number;
  /** rich body as ordered blocks (legacy) */
  body: ArticleBlock[];
  /** cached sanitized HTML from Tiptap (preferred) */
  contentHtml?: string | null;
  featured?: boolean;
  relatedProductIds?: string[];
}

export type ArticleBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "quote"; text: string; cite?: string };

export interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  hours: string;
}

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  colorCode: string;
  colorName: string;
  sizeCode: string;
  sizeLabel: string;
  quantity: number;
}

export interface WishlistItem {
  productId: string;
}

export type SortOption =
  | "recommended"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "bestselling";

export interface ProductFilter {
  gender?: Gender;
  categorySlug?: string;
  subcategorySlug?: string;
  colors?: string[];
  sizes?: string[];
  minPrice?: number;
  maxPrice?: number;
  flags?: ProductFlag[];
  query?: string;
  sort?: SortOption;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
