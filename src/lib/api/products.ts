import type {
  PaginatedResult,
  Product,
  ProductFilter,
  SortOption,
} from "@/types";
import { getAllProducts } from "@/lib/repos/products.repo";
import { isOnSale } from "@/lib/format";

function sortProducts(list: Product[], sort?: SortOption): Product[] {
  const out = [...list];
  switch (sort) {
    case "newest":
      return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "price-asc":
      return out.sort((a, b) => a.price - b.price);
    case "price-desc":
      return out.sort((a, b) => b.price - a.price);
    case "bestselling":
      return out.sort((a, b) => b.reviewCount - a.reviewCount);
    case "recommended":
    default:
      return out.sort(
        (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount
      );
  }
}

export async function filterProducts(
  filter: ProductFilter = {}
): Promise<Product[]> {
  let list = await getAllProducts();

  if (filter.gender) list = list.filter((p) => p.gender === filter.gender);
  if (filter.categorySlug)
    list = list.filter((p) => p.categorySlug === filter.categorySlug);
  if (filter.subcategorySlug)
    list = list.filter((p) => p.subcategorySlug === filter.subcategorySlug);

  if (filter.colors?.length)
    list = list.filter((p) =>
      p.colors.some((c) => filter.colors!.includes(c.code))
    );

  if (filter.sizes?.length)
    list = list.filter((p) =>
      p.sizes.some((s) => s.inStock && filter.sizes!.includes(s.code))
    );

  if (typeof filter.minPrice === "number")
    list = list.filter((p) => p.price >= filter.minPrice!);
  if (typeof filter.maxPrice === "number")
    list = list.filter((p) => p.price <= filter.maxPrice!);

  if (filter.flags?.length)
    list = list.filter((p) =>
      filter.flags!.some((f) => (f === "sale" ? isOnSale(p) : p.flags.includes(f)))
    );

  if (filter.query) {
    const q = filter.query.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.categorySlug.includes(q) ||
        p.colors.some((c) => c.name.toLowerCase().includes(q))
    );
  }

  return sortProducts(list, filter.sort);
}

export async function getProducts(
  filter: ProductFilter = {}
): Promise<PaginatedResult<Product>> {
  const all = await filterProducts(filter);
  const page = filter.page ?? 1;
  const pageSize = filter.pageSize ?? 12;
  const start = (page - 1) * pageSize;
  const items = all.slice(start, start + pageSize);
  return {
    items,
    total: all.length,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(all.length / pageSize)),
  };
}

export async function getProductById(
  id: string
): Promise<Product | undefined> {
  const products = await getAllProducts();
  return products.find((p) => p.id === id || p.slug === id);
}

export async function getRelatedProducts(
  product: Product,
  limit = 4
): Promise<Product[]> {
  const products = await getAllProducts();
  return products
    .filter(
      (p) =>
        p.id !== product.id &&
        p.gender === product.gender &&
        p.categorySlug === product.categorySlug
    )
    .slice(0, limit);
}

export async function getFeaturedProducts(
  flag: Product["flags"][number],
  limit = 8
): Promise<Product[]> {
  const products = await getAllProducts();
  if (flag === "sale") return products.filter(isOnSale).slice(0, limit);
  return products.filter((p) => p.flags.includes(flag)).slice(0, limit);
}

export async function getRankings(
  gender?: Product["gender"],
  limit = 12
): Promise<Product[]> {
  const list = await filterProducts({ gender, sort: "bestselling" });
  return list.slice(0, limit);
}

/** Available filter facets for a given product set. */
export async function getFacets(filter: ProductFilter = {}) {
  const list = await filterProducts({
    gender: filter.gender,
    categorySlug: filter.categorySlug,
    subcategorySlug: filter.subcategorySlug,
  });
  const colorMap = new Map<string, { code: string; name: string; hex: string }>();
  const sizeMap = new Map<string, { code: string; label: string }>();
  for (const p of list) {
    for (const c of p.colors) colorMap.set(c.code, c);
    for (const s of p.sizes) sizeMap.set(s.code, { code: s.code, label: s.label });
  }
  const prices = list.map((p) => p.price);
  return {
    colors: [...colorMap.values()],
    sizes: [...sizeMap.values()],
    minPrice: prices.length ? Math.min(...prices) : 0,
    maxPrice: prices.length ? Math.max(...prices) : 0,
  };
}
