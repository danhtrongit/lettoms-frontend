"use client";

import type { Config } from "@puckeditor/core";
import { HeadingWidget } from "@/components/cms/widgets/heading-widget";
import { SpacerWidget } from "@/components/cms/widgets/spacer-widget";
import { DividerWidget } from "@/components/cms/widgets/divider-widget";
import { ButtonWidget } from "@/components/cms/widgets/button-widget";
import { SectionWidget } from "@/components/cms/widgets/section-widget";
import { ColumnsWidget } from "@/components/cms/widgets/columns-widget";
import { RichTextClientWidget } from "@/components/cms/widgets/rich-text-client-widget";
import { IconListWidget } from "@/components/cms/widgets/icon-list-widget";
import { FaqWidget } from "@/components/cms/widgets/faq-widget";
import { TestimonialWidget } from "@/components/cms/widgets/testimonial-widget";
import { HeroWidget } from "@/components/cms/widgets/hero-widget";
import { BannerImageWidget } from "@/components/cms/widgets/banner-image-widget";
import { ImageWidget } from "@/components/cms/widgets/image-widget";
import { GalleryWidget } from "@/components/cms/widgets/gallery-widget";
import { VideoEmbedWidget } from "@/components/cms/widgets/video-embed-widget";
import { LogoMarqueeWidget } from "@/components/cms/widgets/logo-marquee-widget";
import { colorField } from "@/lib/builder/fields/color-field";
import { richTextField } from "@/lib/builder/fields/richtext-field";
import { imageField } from "@/lib/builder/fields/image-field";

const ALIGN_OPTIONS = [
  { label: "Trái", value: "left" },
  { label: "Giữa", value: "center" },
  { label: "Phải", value: "right" },
];

export const clientConfig: Config = {
  categories: {
    layout: { title: "Bố cục", components: ["section", "columns", "spacer", "divider"] },
    basic: { title: "Cơ bản", components: ["heading", "richText", "button", "iconList", "faqAccordion", "testimonial"] },
    media: { title: "Media", components: ["hero", "bannerImage", "image", "gallery", "videoEmbed", "logoMarquee"] },
    commerce: { title: "Thương mại", components: [] },
    marketing: { title: "Marketing", components: [] },
  },
  components: {
    section: {
      label: "Section",
      fields: {
        background: colorField("Màu nền"),
        paddingY: {
          type: "select",
          label: "Đệm trên/dưới",
          options: [
            { label: "Không", value: "none" },
            { label: "Nhỏ", value: "small" },
            { label: "Vừa", value: "medium" },
            { label: "Lớn", value: "large" },
          ],
        },
        contained: {
          type: "radio",
          label: "Bề rộng",
          options: [
            { label: "Theo khung trang", value: true },
            { label: "Tràn viền", value: false },
          ],
        },
        content: { type: "slot" },
      },
      defaultProps: { background: "", paddingY: "medium", contained: true, content: [] },
      render: ({ background, paddingY, contained, content: Content }) => (
        <SectionWidget background={background} paddingY={paddingY} contained={contained}>
          <Content />
        </SectionWidget>
      ),
    },
    columns: {
      label: "Cột (Layout)",
      fields: {
        count: {
          type: "select",
          label: "Số cột",
          options: [
            { label: "2 cột", value: 2 },
            { label: "3 cột", value: 3 },
            { label: "4 cột", value: 4 },
          ],
        },
        gap: { type: "number", label: "Khoảng cách (px)", min: 0 },
        column1: { type: "slot" },
        column2: { type: "slot" },
        column3: { type: "slot" },
        column4: { type: "slot" },
      },
      defaultProps: { count: 2, gap: 24, column1: [], column2: [], column3: [], column4: [] },
      render: ({ count, gap, column1, column2, column3, column4 }) => (
        <ColumnsWidget count={count} gap={gap} slots={[column1, column2, column3, column4]} />
      ),
    },
    heading: {
      label: "Tiêu đề",
      fields: {
        text: { type: "text", label: "Nội dung", contentEditable: true },
        level: {
          type: "select",
          label: "Cấp",
          options: [
            { label: "H1", value: "1" },
            { label: "H2", value: "2" },
            { label: "H3", value: "3" },
            { label: "H4", value: "4" },
          ],
        },
        align: { type: "select", label: "Căn lề", options: ALIGN_OPTIONS },
      },
      defaultProps: { text: "Tiêu đề", level: "2", align: "left" },
      render: ({ text, level, align }) => (
        <HeadingWidget text={text} level={level} align={align} />
      ),
    },
    spacer: {
      label: "Khoảng trống",
      fields: { size: { type: "number", label: "Chiều cao (px)", min: 0 } },
      defaultProps: { size: 48 },
      render: ({ size }) => <SpacerWidget size={size} />,
    },
    divider: {
      label: "Đường kẻ",
      fields: { spacing: { type: "number", label: "Khoảng cách trên/dưới (px)", min: 0 } },
      defaultProps: { spacing: 24 },
      render: ({ spacing }) => <DividerWidget spacing={spacing} />,
    },
    button: {
      label: "Nút bấm",
      fields: {
        label: { type: "text", label: "Nhãn" },
        href: { type: "text", label: "Liên kết" },
        variant: {
          type: "select",
          label: "Kiểu",
          options: [
            { label: "Chính", value: "default" },
            { label: "Viền", value: "outline" },
            { label: "Phụ", value: "secondary" },
          ],
        },
        align: { type: "select", label: "Căn lề", options: ALIGN_OPTIONS },
      },
      defaultProps: { label: "Mua ngay", href: "/nu", variant: "default", align: "left" },
      render: ({ label, href, variant, align }) => (
        <ButtonWidget label={label} href={href} variant={variant} align={align} />
      ),
    },
    richText: {
      label: "Văn bản (WYSIWYG)",
      fields: { contentJson: richTextField("Nội dung") },
      defaultProps: { contentJson: null },
      render: ({ contentJson }) => <RichTextClientWidget contentJson={contentJson} />,
    },
    iconList: {
      label: "Danh sách tính năng",
      fields: {
        heading: { type: "text", label: "Tiêu đề" },
        items: {
          type: "array",
          label: "Mục",
          arrayFields: { text: { type: "text", label: "Nội dung" } },
          defaultItemProps: { text: "Mục mới" },
          getItemSummary: (item: { text?: string }) => item.text || "Mục",
        },
      },
      defaultProps: {
        heading: "Cam kết của chúng tôi",
        items: [
          { text: "Miễn phí vận chuyển" },
          { text: "Đổi trả 30 ngày" },
          { text: "Bảo hành chính hãng" },
        ],
      },
      render: ({ heading, items }) => <IconListWidget heading={heading} items={items} />,
    },
    faqAccordion: {
      label: "FAQ / Accordion",
      fields: {
        heading: { type: "text", label: "Tiêu đề" },
        items: {
          type: "array",
          label: "Câu hỏi",
          arrayFields: {
            q: { type: "text", label: "Câu hỏi" },
            a: { type: "textarea", label: "Trả lời" },
          },
          defaultItemProps: { q: "Câu hỏi mới?", a: "" },
          getItemSummary: (item: { q?: string }) => item.q || "Câu hỏi",
        },
      },
      defaultProps: {
        heading: "Câu hỏi thường gặp",
        items: [
          { q: "Thời gian giao hàng?", a: "2-5 ngày làm việc tùy khu vực." },
          { q: "Chính sách đổi trả?", a: "Đổi trả miễn phí trong 30 ngày." },
        ],
      },
      render: ({ heading, items }) => <FaqWidget heading={heading} items={items} />,
    },
    testimonial: {
      label: "Đánh giá khách hàng",
      fields: {
        quote: { type: "textarea", label: "Nội dung" },
        author: { type: "text", label: "Tên" },
        role: { type: "text", label: "Vai trò" },
        avatar: imageField("Ảnh đại diện"),
      },
      defaultProps: {
        quote: "Sản phẩm chất lượng, giao hàng nhanh!",
        author: "Khách hàng",
        role: "Đã mua hàng",
        avatar: "",
      },
      render: ({ quote, author, role, avatar }) => (
        <TestimonialWidget quote={quote} author={author} role={role} avatar={avatar} />
      ),
    },
    hero: {
      label: "Hero Banner",
      fields: {
        image: imageField("Ảnh nền"),
        heading: { type: "text", label: "Tiêu đề" },
        subheading: { type: "text", label: "Phụ đề" },
        ctaLabel: { type: "text", label: "Nhãn nút" },
        ctaHref: { type: "text", label: "Link nút" },
        align: {
          type: "select",
          label: "Căn nội dung",
          options: [
            { value: "left", label: "Trái" },
            { value: "center", label: "Giữa" },
            { value: "right", label: "Phải" },
          ],
        },
        height: {
          type: "select",
          label: "Chiều cao",
          options: [
            { value: "medium", label: "Vừa" },
            { value: "large", label: "Lớn" },
            { value: "full", label: "Toàn màn hình" },
          ],
        },
      },
      defaultProps: {
        image: "",
        heading: "Tiêu đề nổi bật",
        subheading: "Mô tả ngắn gọn",
        ctaLabel: "Mua ngay",
        ctaHref: "/nu",
        align: "center",
        height: "large",
      },
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
      label: "Banner ảnh",
      fields: {
        image: imageField("Ảnh"),
        href: { type: "text", label: "Link" },
        alt: { type: "text", label: "Alt" },
        ratio: {
          type: "select",
          label: "Tỉ lệ",
          options: [
            { value: "16/6", label: "16:6 (rộng)" },
            { value: "16/9", label: "16:9" },
            { value: "21/9", label: "21:9 (siêu rộng)" },
            { value: "1/1", label: "1:1 (vuông)" },
          ],
        },
      },
      defaultProps: { image: "", href: "/", alt: "", ratio: "16/6" },
      render: ({ image, href, alt, ratio }) => (
        <BannerImageWidget image={image} href={href} alt={alt} ratio={ratio} />
      ),
    },
    image: {
      label: "Hình ảnh",
      fields: {
        src: imageField("Ảnh"),
        alt: { type: "text", label: "Alt" },
        caption: { type: "text", label: "Chú thích" },
        width: {
          type: "select",
          label: "Chiều rộng",
          options: [
            { value: "full", label: "Toàn bộ" },
            { value: "wide", label: "Rộng" },
            { value: "normal", label: "Vừa" },
          ],
        },
      },
      defaultProps: { src: "", alt: "", caption: "", width: "full" },
      render: ({ src, alt, caption, width }) => (
        <ImageWidget src={src} alt={alt} caption={caption} width={width} />
      ),
    },
    gallery: {
      label: "Thư viện ảnh",
      fields: {
        images: {
          type: "array",
          label: "Ảnh",
          arrayFields: { src: imageField("Ảnh") },
          defaultItemProps: { src: "" },
          getItemSummary: (_item: { src?: string }, i?: number) => `Ảnh ${(i ?? 0) + 1}`,
        },
        columns: {
          type: "select",
          label: "Số cột",
          options: [
            { value: "2", label: "2" },
            { value: "3", label: "3" },
            { value: "4", label: "4" },
          ],
        },
      },
      defaultProps: { images: [], columns: "3" },
      render: ({ images, columns }) => (
        <GalleryWidget images={images} columns={columns} />
      ),
    },
    videoEmbed: {
      label: "Video nhúng",
      fields: {
        url: { type: "text", label: "URL video" },
        ratio: {
          type: "select",
          label: "Tỉ lệ",
          options: [
            { value: "16/9", label: "16:9" },
            { value: "4/3", label: "4:3" },
            { value: "1/1", label: "1:1" },
          ],
        },
      },
      defaultProps: { url: "", ratio: "16/9" },
      render: ({ url, ratio }) => (
        <VideoEmbedWidget url={url} ratio={ratio} />
      ),
    },
    logoMarquee: {
      label: "Dải logo",
      fields: {
        heading: { type: "text", label: "Tiêu đề" },
        images: {
          type: "array",
          label: "Ảnh",
          arrayFields: { src: imageField("Ảnh") },
          defaultItemProps: { src: "" },
          getItemSummary: (_item: { src?: string }, i?: number) => `Ảnh ${(i ?? 0) + 1}`,
        },
      },
      defaultProps: { heading: "Đối tác", images: [] },
      render: ({ heading, images }) => (
        <LogoMarqueeWidget heading={heading} images={images} />
      ),
    },
  },
  root: {
    render: ({ children }: { children: React.ReactNode }) => <div className="py-2">{children}</div>,
  },
};
