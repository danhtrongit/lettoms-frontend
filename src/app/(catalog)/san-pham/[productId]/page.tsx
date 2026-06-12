import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductById, getRelatedProducts } from "@/lib/api/products";
import { getAllProducts } from "@/lib/repos/products.repo";
import { genderLabel } from "@/data/site";
import { getCategoryDb } from "@/lib/repos/categories.repo";
import { buildMetadata, productJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ProductInfo } from "@/components/product/product-info";
import { ProductTabs } from "@/components/product/product-tabs";
import { RelatedProducts } from "@/components/product/related-products";

type Params = Promise<{ productId: string }>;

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((p) => ({ productId: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { productId } = await params;
  const product = await getProductById(productId);
  if (!product) return {};
  return buildMetadata({
    title: product.name,
    description: product.description,
    path: `/san-pham/${product.id}`,
  });
}

export default async function ProductPage({ params }: { params: Params }) {
  const { productId } = await params;
  const product = await getProductById(productId);
  if (!product) notFound();

  const [related, cat] = await Promise.all([
    getRelatedProducts(product),
    getCategoryDb(product.gender, product.categorySlug),
  ]);

  const breadcrumbs = [
    { label: "Trang chủ", href: "/" },
    { label: genderLabel[product.gender], href: `/${product.gender}` },
    ...(cat
      ? [{ label: cat.name, href: `/${product.gender}/${cat.slug}` }]
      : []),
    { label: product.name },
  ];

  return (
    <div className="container-page py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd(product)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs)),
        }}
      />

      <Breadcrumbs items={breadcrumbs} />

      <div className="mt-6">
        <ProductInfo product={product} />
      </div>

      <div className="mt-12 max-w-3xl">
        <ProductTabs product={product} />
      </div>

      <RelatedProducts products={related} />
    </div>
  );
}
