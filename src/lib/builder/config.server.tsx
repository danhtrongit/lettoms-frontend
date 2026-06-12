import type { Config } from "@puckeditor/core";
import { HeadingWidget } from "@/components/cms/widgets/heading-widget";
import { SpacerWidget } from "@/components/cms/widgets/spacer-widget";
import { DividerWidget } from "@/components/cms/widgets/divider-widget";
import { ButtonWidget } from "@/components/cms/widgets/button-widget";
import { SectionWidget } from "@/components/cms/widgets/section-widget";
import { ColumnsWidget } from "@/components/cms/widgets/columns-widget";
import { RichTextServerWidget } from "@/components/cms/widgets/rich-text-server-widget";
import { IconListWidget } from "@/components/cms/widgets/icon-list-widget";
import { FaqWidget } from "@/components/cms/widgets/faq-widget";
import { TestimonialWidget } from "@/components/cms/widgets/testimonial-widget";
import { HeroWidget } from "@/components/cms/widgets/hero-widget";
import { BannerImageWidget } from "@/components/cms/widgets/banner-image-widget";
import { ImageWidget } from "@/components/cms/widgets/image-widget";
import { GalleryWidget } from "@/components/cms/widgets/gallery-widget";
import { VideoEmbedWidget } from "@/components/cms/widgets/video-embed-widget";
import { LogoMarqueeWidget } from "@/components/cms/widgets/logo-marquee-widget";
import { ProductGridServer } from "@/components/cms/widgets/product-grid-widget";
import { ProductCarouselServer } from "@/components/cms/widgets/product-carousel-widget";
import { FeaturedCategoriesServer } from "@/components/cms/widgets/featured-categories-widget";

/**
 * Render-only config for the public site (<Render> in RSC).
 * MUST define the same component keys as config.client.tsx —
 * commerce widgets here query the DB directly instead of fetching APIs.
 */
export const serverConfig: Config = {
  components: {
    section: {
      fields: {
        content: { type: "slot" },
      },
      render: ({ background, paddingY, contained, content: Content }) => (
        <SectionWidget background={background} paddingY={paddingY} contained={contained}>
          <Content />
        </SectionWidget>
      ),
    },
    columns: {
      fields: {
        column1: { type: "slot" },
        column2: { type: "slot" },
        column3: { type: "slot" },
        column4: { type: "slot" },
      },
      render: ({ count, gap, column1, column2, column3, column4 }) => (
        <ColumnsWidget count={count} gap={gap} slots={[column1, column2, column3, column4]} />
      ),
    },
    heading: { render: ({ text, level, align }) => <HeadingWidget text={text} level={level} align={align} /> },
    spacer: { render: ({ size }) => <SpacerWidget size={size} /> },
    divider: { render: ({ spacing }) => <DividerWidget spacing={spacing} /> },
    button: { render: ({ label, href, variant, align }) => <ButtonWidget label={label} href={href} variant={variant} align={align} /> },
    richText: {
      render: ({ contentJson, contentHtml }) => (
        <RichTextServerWidget contentJson={contentJson} contentHtml={contentHtml} />
      ),
    },
    iconList: {
      render: ({ heading, items }) => <IconListWidget heading={heading} items={items} />,
    },
    faqAccordion: {
      render: ({ heading, items }) => <FaqWidget heading={heading} items={items} />,
    },
    testimonial: {
      render: ({ quote, author, role, avatar }) => (
        <TestimonialWidget quote={quote} author={author} role={role} avatar={avatar} />
      ),
    },
    hero: {
      render: ({ image, heading, subheading, ctaLabel, ctaHref, align, height }) => (
        <HeroWidget
          image={image}
          heading={heading}
          subheading={subheading}
          ctaLabel={ctaLabel}
          ctaHref={ctaHref}
          align={align}
          height={height}
        />
      ),
    },
    bannerImage: {
      render: ({ image, href, alt, ratio }) => (
        <BannerImageWidget image={image} href={href} alt={alt} ratio={ratio} />
      ),
    },
    image: {
      render: ({ src, alt, caption, width }) => (
        <ImageWidget src={src} alt={alt} caption={caption} width={width} />
      ),
    },
    gallery: {
      render: ({ images, columns }) => (
        <GalleryWidget images={images} columns={columns} />
      ),
    },
    videoEmbed: {
      render: ({ url, ratio }) => (
        <VideoEmbedWidget url={url} ratio={ratio} />
      ),
    },
    logoMarquee: {
      render: ({ heading, images }) => (
        <LogoMarqueeWidget heading={heading} images={images} />
      ),
    },
    productGrid: {
      render: ({ heading, flag, limit, href }) => (
        <ProductGridServer heading={heading} flag={flag} limit={limit} href={href} />
      ),
    },
    productCarousel: {
      render: ({ heading, flag, limit }) => (
        <ProductCarouselServer heading={heading} flag={flag} limit={limit} />
      ),
    },
    featuredCategories: {
      render: ({ heading, gender, limit }) => (
        <FeaturedCategoriesServer heading={heading} gender={gender} limit={limit} />
      ),
    },
  },
  root: {
    render: ({ children }: { children: React.ReactNode }) => <div className="py-2">{children}</div>,
  },
};
