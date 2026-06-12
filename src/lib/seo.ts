import type { Metadata } from "next";
import type { Article, Breadcrumb, Product } from "@/types";
import { siteConfig } from "@/data/site";
import { formatVND } from "@/lib/format";

interface MetaInput {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}

/** Build per-page Next.js Metadata with sensible Letom's defaults. */
export function buildMetadata({
  title,
  description,
  path = "",
  image,
  noIndex,
}: MetaInput = {}): Metadata {
  const url = siteConfig.url + path;
  const desc = description ?? siteConfig.description;
  const ogImage = image ?? siteConfig.ogImage;
  return {
    title: title ?? undefined,
    description: desc,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title: title ?? siteConfig.name,
      description: desc,
      url,
      locale: "vi_VN",
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: title ?? siteConfig.name,
      description: desc,
      images: [ogImage],
    },
  };
}

// ---- JSON-LD generators ----

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    url: siteConfig.url,
    logo: siteConfig.url + "/logo.png",
    sameAs: Object.values(siteConfig.social),
    contactPoint: {
      "@type": "ContactPoint",
      telephone: siteConfig.phone,
      email: siteConfig.email,
      contactType: "customer service",
      areaServed: "VN",
      availableLanguage: ["Vietnamese"],
    },
  };
}

export function breadcrumbJsonLd(items: Breadcrumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: b.label,
      item: b.href ? siteConfig.url + b.href : undefined,
    })),
  };
}

export function productJsonLd(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.id,
    brand: { "@type": "Brand", name: siteConfig.name },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "VND",
      price: product.price,
      availability: "https://schema.org/InStock",
      url: `${siteConfig.url}/san-pham/${product.id}`,
    },
    // human-readable price for previews
    description_price: formatVND(product.price),
  };
}

export function articleJsonLd(article: Article) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    author: { "@type": "Organization", name: article.author },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: { "@type": "ImageObject", url: siteConfig.url + "/logo.png" },
    },
    datePublished: article.publishedAt,
    image: siteConfig.url + article.coverImage,
  };
}
