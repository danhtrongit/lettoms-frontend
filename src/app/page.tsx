import { HeroCarousel } from "@/components/home/hero-carousel";
import { CategoryTiles } from "@/components/home/category-tiles";
import { FeaturedCollection } from "@/components/home/featured-collection";
import { PromoBanner } from "@/components/home/promo-banner";
import { StoryStrip } from "@/components/home/story-strip";
import { SectionHeading } from "@/components/common/section-heading";
import { getFeaturedProducts } from "@/lib/api/products";
import { getArticles } from "@/lib/api/articles";
import { getPublishedPageBySlug } from "@/lib/repos/pages.repo";
import { WidgetRenderer } from "@/components/cms/widget-renderer";
import { Render } from "@puckeditor/core/rsc";
import { serverConfig } from "@/lib/builder/config.server";

export default async function HomePage() {
  // Prefer the widget-built system page; fall back to the static layout.
  const homePage = await getPublishedPageBySlug("home");
  if (homePage?.content) {
    return <Render config={serverConfig} data={homePage.content} />;
  }
  if (homePage && homePage.blocks.length > 0) {
    return (
      <div className="py-2">
        <WidgetRenderer blocks={homePage.blocks} />
      </div>
    );
  }

  const [newProducts, bestsellers, onSale, articles] = await Promise.all([
    getFeaturedProducts("new", 4),
    getFeaturedProducts("bestseller", 4),
    getFeaturedProducts("sale", 4),
    getArticles(),
  ]);

  return (
    <>
      <HeroCarousel />

      <section className="container-page py-12">
        <SectionHeading
          title="Tìm Theo Danh Mục"
          description="Khám phá bộ sưu tập cho cả gia đình."
          align="center"
        />
        <CategoryTiles />
      </section>

      <FeaturedCollection
        title="Hàng Mới Về"
        description="Những thiết kế mới nhất của mùa này."
        href="/uu-dai/hang-moi"
        products={newProducts}
      />

      <PromoBanner
        title="Ưu Đãi Giá Mới"
        subtitle="Giảm đến 40% cho các sản phẩm chọn lọc. Số lượng có hạn."
        cta="Xem khuyến mãi"
        href="/uu-dai/khuyen-mai"
        from="#B0202E"
        to="#7a1620"
      />

      <FeaturedCollection
        title="Sản Phẩm Bán Chạy"
        description="Được khách hàng yêu thích nhất."
        href="/uu-dai/ban-chay"
        products={bestsellers}
      />

      <FeaturedCollection
        title="Đang Giảm Giá"
        description="Ưu đãi không thể bỏ lỡ."
        href="/uu-dai/khuyen-mai"
        products={onSale}
      />

      <StoryStrip articles={articles} />
    </>
  );
}
