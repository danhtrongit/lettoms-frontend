import Link from "next/link";
import Image from "next/image";
import type { PageBlock } from "@/db/schema/cms";
import type { ProductFlag, Gender } from "@/types";
import { getFeaturedProducts } from "@/lib/api/products";
import { getCategoriesByGenderDb } from "@/lib/repos/categories.repo";
import { FeaturedCollection } from "@/components/home/featured-collection";
import { ProductGrid } from "@/components/product/product-grid";
import { RichTextContent } from "@/components/common/rich-text-content";
import { Button } from "@/components/ui/button";
import { CountdownWidget } from "@/components/cms/widgets/countdown-widget";
import { FaqWidget } from "@/components/cms/widgets/faq-widget";
import { NewsletterWidget } from "@/components/cms/widgets/newsletter-widget";
import { cn } from "@/lib/utils";

type Props = Record<string, unknown>;
const str = (p: Props, k: string) => (typeof p[k] === "string" ? (p[k] as string) : "");
const num = (p: Props, k: string, d = 0) =>
  typeof p[k] === "number" ? (p[k] as number) : typeof p[k] === "string" ? Number(p[k]) || d : d;
const arr = (p: Props, k: string): unknown[] => (Array.isArray(p[k]) ? (p[k] as unknown[]) : []);

const ALIGN: Record<string, string> = {
  left: "text-left items-start",
  center: "text-center items-center",
  right: "text-right items-end",
};

async function RenderBlock({ block }: { block: PageBlock }): Promise<React.ReactElement | null> {
  const p = block.props as Props;

  switch (block.type) {
    /* ----------------------------- Layout ----------------------------- */
    case "columns": {
      const cols = (Array.isArray(p.columns) ? p.columns : []) as PageBlock[][];
      const count = num(p, "count", cols.length || 2);
      const gap = num(p, "gap", 24);
      const gridCols: Record<number, string> = {
        2: "sm:grid-cols-2",
        3: "sm:grid-cols-3",
        4: "sm:grid-cols-2 lg:grid-cols-4",
      };
      return (
        <section className="container-page py-6">
          <div
            className={cn("grid grid-cols-1", gridCols[count] ?? "sm:grid-cols-2")}
            style={{ gap }}
          >
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="space-y-4">
                {(cols[i] ?? []).map((child) => (
                  <RenderBlock key={child.id} block={child} />
                ))}
              </div>
            ))}
          </div>
        </section>
      );
    }
    case "spacer":
      return <div style={{ height: num(p, "size", 48) }} />;
    case "divider":
      return (
        <div className="container-page" style={{ paddingTop: num(p, "spacing", 24), paddingBottom: num(p, "spacing", 24) }}>
          <hr className="border-border" />
        </div>
      );

    /* ----------------------------- Basic ----------------------------- */
    case "heading": {
      const level = str(p, "level") || "2";
      const align = str(p, "align") || "left";
      const Tag = (`h${level}` as "h1" | "h2" | "h3" | "h4");
      const sizes: Record<string, string> = {
        "1": "text-4xl sm:text-5xl",
        "2": "text-3xl sm:text-4xl",
        "3": "text-2xl sm:text-3xl",
        "4": "text-xl sm:text-2xl",
      };
      return (
        <section className="container-page py-4">
          <Tag
            className={cn("font-semibold tracking-tight", sizes[level], ALIGN[align]?.split(" ")[0])}
          >
            {str(p, "text")}
          </Tag>
        </section>
      );
    }
    case "richText":
      return (
        <section className="container-page py-6">
          <RichTextContent
            html={typeof p.contentHtml === "string" ? (p.contentHtml as string) : ""}
            className="mx-auto max-w-3xl"
          />
        </section>
      );
    case "button": {
      const align = str(p, "align") || "left";
      const variant = (str(p, "variant") || "default") as
        | "default"
        | "outline"
        | "secondary";
      return (
        <section className={cn("container-page flex py-4", {
          "justify-start": align === "left",
          "justify-center": align === "center",
          "justify-end": align === "right",
        })}>
          <Button asChild variant={variant} className="rounded-full">
            <Link href={str(p, "href") || "/"}>{str(p, "label") || "Xem thêm"}</Link>
          </Button>
        </section>
      );
    }
    case "iconList": {
      const items = arr(p, "items").map(String);
      return (
        <section className="container-page py-6">
          {str(p, "heading") && (
            <h3 className="mb-3 text-xl font-semibold">{str(p, "heading")}</h3>
          )}
          <ul className="space-y-2">
            {items.map((it, i) => (
              <li key={i} className="flex items-center gap-2 text-muted-foreground">
                <span className="grid size-5 place-items-center rounded-full bg-primary/10 text-xs text-primary">
                  ✓
                </span>
                {it}
              </li>
            ))}
          </ul>
        </section>
      );
    }
    case "faqAccordion": {
      const items = arr(p, "items")
        .map((it) => it as { q?: string; a?: string })
        .filter((it) => it.q);
      return <FaqWidget heading={str(p, "heading")} items={items.map((i) => ({ q: i.q ?? "", a: i.a ?? "" }))} />;
    }
    case "testimonial":
      return (
        <section className="container-page py-8">
          <figure className="mx-auto max-w-2xl text-center">
            <blockquote className="text-xl font-medium leading-relaxed">
              “{str(p, "quote")}”
            </blockquote>
            <figcaption className="mt-4 flex items-center justify-center gap-3">
              {str(p, "avatar") && (
                <span className="relative size-10 overflow-hidden rounded-full border bg-muted">
                  <Image src={str(p, "avatar")} alt={str(p, "author")} fill sizes="40px" className="object-cover" />
                </span>
              )}
              <span className="text-sm">
                <span className="font-semibold">{str(p, "author")}</span>
                {str(p, "role") && (
                  <span className="block text-muted-foreground">{str(p, "role")}</span>
                )}
              </span>
            </figcaption>
          </figure>
        </section>
      );

    /* ----------------------------- Media ----------------------------- */
    case "hero": {
      const align = str(p, "align") || "center";
      const heights: Record<string, string> = {
        medium: "aspect-[21/9]",
        large: "aspect-[16/8] sm:aspect-[21/8]",
        full: "min-h-[80vh]",
      };
      return (
        <section className="relative overflow-hidden">
          <div className={cn("relative w-full", heights[str(p, "height") || "large"])}>
            {str(p, "image") && (
              <Image src={str(p, "image")} alt={str(p, "heading")} fill priority sizes="100vw" className="object-cover" />
            )}
            <div className="absolute inset-0 bg-black/30" />
            <div
              className={cn(
                "absolute inset-0 flex flex-col justify-center gap-3 p-8 text-white sm:p-16",
                ALIGN[align]
              )}
            >
              <h2 className="max-w-2xl text-3xl font-semibold sm:text-5xl">{str(p, "heading")}</h2>
              {str(p, "subheading") && (
                <p className="max-w-xl text-base sm:text-lg">{str(p, "subheading")}</p>
              )}
              {str(p, "ctaLabel") && (
                <Button asChild size="lg" className="mt-2 w-fit rounded-full">
                  <Link href={str(p, "ctaHref") || "/"}>{str(p, "ctaLabel")}</Link>
                </Button>
              )}
            </div>
          </div>
        </section>
      );
    }
    case "bannerImage":
      if (!str(p, "image")) return null;
      return (
        <section className="container-page py-6">
          <Link href={str(p, "href") || "/"} className="block overflow-hidden rounded-xl">
            <div className="relative w-full" style={{ aspectRatio: (str(p, "ratio") || "16/6").replace("/", " / ") }}>
              <Image src={str(p, "image")} alt={str(p, "alt")} fill sizes="100vw" className="object-cover" />
            </div>
          </Link>
        </section>
      );
    case "image": {
      if (!str(p, "src")) return null;
      const widths: Record<string, string> = {
        full: "max-w-none",
        wide: "max-w-4xl",
        normal: "max-w-2xl",
      };
      return (
        <section className="container-page py-6">
          <figure className={cn("mx-auto", widths[str(p, "width") || "full"])}>
            <Image
              src={str(p, "src")}
              alt={str(p, "alt")}
              width={1200}
              height={800}
              className="h-auto w-full rounded-lg object-cover"
            />
            {str(p, "caption") && (
              <figcaption className="mt-2 text-center text-sm text-muted-foreground">
                {str(p, "caption")}
              </figcaption>
            )}
          </figure>
        </section>
      );
    }
    case "gallery": {
      const images = arr(p, "images").map(String).filter(Boolean);
      const cols = str(p, "columns") || "3";
      const grid: Record<string, string> = {
        "2": "grid-cols-2",
        "3": "grid-cols-2 sm:grid-cols-3",
        "4": "grid-cols-2 sm:grid-cols-4",
      };
      return (
        <section className="container-page py-6">
          <div className={cn("grid gap-3", grid[cols])}>
            {images.map((src, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                <Image src={src} alt="" fill sizes="300px" className="object-cover" />
              </div>
            ))}
          </div>
        </section>
      );
    }
    case "videoEmbed": {
      const url = str(p, "url");
      if (!url) return null;
      const embed = toEmbedUrl(url);
      return (
        <section className="container-page py-6">
          <div
            className="relative mx-auto max-w-3xl overflow-hidden rounded-xl bg-black"
            style={{ aspectRatio: (str(p, "ratio") || "16/9").replace("/", " / ") }}
          >
            <iframe
              src={embed}
              className="absolute inset-0 size-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>
      );
    }
    case "logoMarquee": {
      const images = arr(p, "images").map(String).filter(Boolean);
      return (
        <section className="container-page py-8">
          {str(p, "heading") && (
            <p className="mb-4 text-center text-sm font-medium text-muted-foreground">
              {str(p, "heading")}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-70">
            {images.map((src, i) => (
              <div key={i} className="relative h-10 w-28">
                <Image src={src} alt="" fill sizes="112px" className="object-contain" />
              </div>
            ))}
          </div>
        </section>
      );
    }

    /* ----------------------------- Commerce ----------------------------- */
    case "productGrid": {
      const products = await getFeaturedProducts((str(p, "flag") || "bestseller") as ProductFlag, num(p, "limit", 4));
      return (
        <FeaturedCollection
          title={str(p, "heading") || "Sản phẩm"}
          href={str(p, "href") || undefined}
          products={products}
        />
      );
    }
    case "productCarousel": {
      const products = await getFeaturedProducts((str(p, "flag") || "new") as ProductFlag, num(p, "limit", 8));
      if (!products.length) return null;
      return (
        <section className="container-page py-8">
          {str(p, "heading") && (
            <h2 className="mb-4 text-2xl font-semibold tracking-tight">{str(p, "heading")}</h2>
          )}
          <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2">
            {products.map((prod) => (
              <div key={prod.id} className="w-44 shrink-0 snap-start sm:w-56">
                <ProductGrid products={[prod]} />
              </div>
            ))}
          </div>
        </section>
      );
    }
    case "featuredCategories": {
      const cats = await getCategoriesByGenderDb((str(p, "gender") || "nu") as Gender);
      const limit = num(p, "limit", 6);
      const shown = cats.slice(0, limit);
      return (
        <section className="container-page py-8">
          {str(p, "heading") && (
            <h2 className="mb-4 text-2xl font-semibold tracking-tight">{str(p, "heading")}</h2>
          )}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {shown.map((c) => (
              <Link
                key={c.slug}
                href={`/${str(p, "gender") || "nu"}/${c.slug}`}
                className="group flex flex-col items-center gap-2"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
                  {c.heroImage && (
                    <Image src={c.heroImage} alt={c.name} fill sizes="200px" className="object-cover transition-transform group-hover:scale-105" />
                  )}
                </div>
                <span className="text-sm font-medium">{c.name}</span>
              </Link>
            ))}
          </div>
        </section>
      );
    }

    /* ----------------------------- Marketing ----------------------------- */
    case "countdown":
      return (
        <CountdownWidget
          heading={str(p, "heading")}
          subheading={str(p, "subheading")}
          target={str(p, "target")}
        />
      );
    case "newsletter":
      return (
        <NewsletterWidget
          heading={str(p, "heading")}
          subheading={str(p, "subheading")}
          placeholder={str(p, "placeholder")}
          buttonLabel={str(p, "buttonLabel")}
        />
      );

    default:
      return null;
  }
}

function toEmbedUrl(url: string): string {
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return url;
}

export async function WidgetRenderer({ blocks }: { blocks: PageBlock[] }) {
  return (
    <>
      {blocks.map((block) => (
        <RenderBlock key={block.id} block={block} />
      ))}
    </>
  );
}
