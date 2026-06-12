import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPublishedPageBySlug,
  listPublishedPageSlugs,
} from "@/lib/repos/pages.repo";
import { WidgetRenderer } from "@/components/cms/widget-renderer";
import { buildMetadata } from "@/lib/seo";
import { Render } from "@puckeditor/core/rsc";
import { serverConfig } from "@/lib/builder/config.server";

export async function generateStaticParams() {
  const slugs = await listPublishedPageSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPublishedPageBySlug(slug);
  if (!page) return {};
  return buildMetadata({
    title: page.seoTitle || page.title,
    description: page.seoDescription ?? undefined,
    path: `/trang/${slug}`,
    image: page.ogImage ?? undefined,
  });
}

export default async function CmsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getPublishedPageBySlug(slug);
  if (!page) notFound();

  if (page.content) {
    return <Render config={serverConfig} data={page.content} />;
  }
  // Legacy pages not yet migrated
  return (
    <div className="py-2">
      <WidgetRenderer blocks={page.blocks} />
    </div>
  );
}
