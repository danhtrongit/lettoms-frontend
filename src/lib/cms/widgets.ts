/**
 * Page-builder widget registry (Elementor-like).
 * Defines available widget types, default props, and editable fields.
 * Shared by the admin editor and the frontend renderer.
 *
 * The special `columns` widget supports nested child widgets (one level deep):
 * its props hold `{ count, columns: PageBlock[][] }`.
 */

export type FieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "image"
  | "number"
  | "select"
  | "boolean"
  | "color"
  | "list"; // repeatable items (JSON-encoded per widget)

export interface WidgetField {
  key: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface WidgetDef {
  type: string;
  label: string;
  description: string;
  category: "layout" | "basic" | "media" | "commerce" | "marketing";
  /** This widget can contain child widgets (only `columns` for now). */
  container?: boolean;
  defaultProps: Record<string, unknown>;
  fields: WidgetField[];
}

export const WIDGET_CATEGORIES: { key: WidgetDef["category"]; label: string }[] = [
  { key: "layout", label: "Bố cục" },
  { key: "basic", label: "Cơ bản" },
  { key: "media", label: "Media" },
  { key: "commerce", label: "Thương mại" },
  { key: "marketing", label: "Marketing" },
];

const flagOptions = [
  { value: "new", label: "Mới" },
  { value: "bestseller", label: "Bán chạy" },
  { value: "sale", label: "Giảm giá" },
  { value: "limited", label: "Giới hạn" },
];

export const WIDGETS: WidgetDef[] = [
  /* ----------------------------- Layout ----------------------------- */
  {
    type: "columns",
    label: "Cột (Layout)",
    description: "Chia 2-4 cột, mỗi cột chứa widget con",
    category: "layout",
    container: true,
    defaultProps: { count: 2, gap: 24, columns: [[], []] },
    fields: [
      {
        key: "count",
        label: "Số cột",
        type: "select",
        options: [
          { value: "2", label: "2 cột" },
          { value: "3", label: "3 cột" },
          { value: "4", label: "4 cột" },
        ],
      },
      { key: "gap", label: "Khoảng cách (px)", type: "number" },
    ],
  },
  {
    type: "spacer",
    label: "Khoảng trống",
    description: "Khoảng cách dọc",
    category: "layout",
    defaultProps: { size: 48 },
    fields: [{ key: "size", label: "Chiều cao (px)", type: "number" }],
  },
  {
    type: "divider",
    label: "Đường kẻ",
    description: "Đường phân cách ngang",
    category: "layout",
    defaultProps: { spacing: 24 },
    fields: [{ key: "spacing", label: "Khoảng cách trên/dưới (px)", type: "number" }],
  },

  /* ----------------------------- Basic ----------------------------- */
  {
    type: "heading",
    label: "Tiêu đề",
    description: "Tiêu đề với cấp độ tùy chọn",
    category: "basic",
    defaultProps: { text: "Tiêu đề", level: "2", align: "left" },
    fields: [
      { key: "text", label: "Nội dung", type: "text" },
      {
        key: "level",
        label: "Cấp",
        type: "select",
        options: [
          { value: "1", label: "H1" },
          { value: "2", label: "H2" },
          { value: "3", label: "H3" },
          { value: "4", label: "H4" },
        ],
      },
      {
        key: "align",
        label: "Căn lề",
        type: "select",
        options: [
          { value: "left", label: "Trái" },
          { value: "center", label: "Giữa" },
          { value: "right", label: "Phải" },
        ],
      },
    ],
  },
  {
    type: "richText",
    label: "Văn bản (WYSIWYG)",
    description: "Khối văn bản định dạng đầy đủ",
    category: "basic",
    defaultProps: { contentJson: null },
    fields: [{ key: "contentJson", label: "Nội dung", type: "richtext" }],
  },
  {
    type: "button",
    label: "Nút bấm",
    description: "Nút kêu gọi hành động",
    category: "basic",
    defaultProps: { label: "Mua ngay", href: "/nu", variant: "default", align: "left" },
    fields: [
      { key: "label", label: "Nhãn", type: "text" },
      { key: "href", label: "Liên kết", type: "text" },
      {
        key: "variant",
        label: "Kiểu",
        type: "select",
        options: [
          { value: "default", label: "Chính" },
          { value: "outline", label: "Viền" },
          { value: "secondary", label: "Phụ" },
        ],
      },
      {
        key: "align",
        label: "Căn lề",
        type: "select",
        options: [
          { value: "left", label: "Trái" },
          { value: "center", label: "Giữa" },
          { value: "right", label: "Phải" },
        ],
      },
    ],
  },
  {
    type: "iconList",
    label: "Danh sách tính năng",
    description: "Danh sách gạch đầu dòng có nhãn",
    category: "basic",
    defaultProps: {
      heading: "Cam kết của chúng tôi",
      items: ["Miễn phí vận chuyển", "Đổi trả 30 ngày", "Bảo hành chính hãng"],
    },
    fields: [
      { key: "heading", label: "Tiêu đề", type: "text" },
      { key: "items", label: "Mục (mỗi dòng 1 mục)", type: "list" },
    ],
  },
  {
    type: "faqAccordion",
    label: "FAQ / Accordion",
    description: "Câu hỏi thường gặp dạng mở rộng",
    category: "basic",
    defaultProps: {
      heading: "Câu hỏi thường gặp",
      items: [
        { q: "Thời gian giao hàng?", a: "2-5 ngày làm việc tùy khu vực." },
        { q: "Chính sách đổi trả?", a: "Đổi trả miễn phí trong 30 ngày." },
      ],
    },
    fields: [
      { key: "heading", label: "Tiêu đề", type: "text" },
      { key: "items", label: "Q&A (định dạng: Hỏi | Đáp mỗi dòng)", type: "list" },
    ],
  },
  {
    type: "testimonial",
    label: "Đánh giá khách hàng",
    description: "Trích dẫn từ khách hàng",
    category: "basic",
    defaultProps: {
      quote: "Sản phẩm chất lượng, giao hàng nhanh!",
      author: "Khách hàng",
      role: "Đã mua hàng",
      avatar: "",
    },
    fields: [
      { key: "quote", label: "Nội dung", type: "textarea" },
      { key: "author", label: "Tên", type: "text" },
      { key: "role", label: "Vai trò", type: "text" },
      { key: "avatar", label: "Ảnh đại diện", type: "image" },
    ],
  },

  /* ----------------------------- Media ----------------------------- */
  {
    type: "hero",
    label: "Hero Banner",
    description: "Ảnh lớn kèm tiêu đề và CTA",
    category: "media",
    defaultProps: {
      image: "",
      heading: "Tiêu đề nổi bật",
      subheading: "Mô tả ngắn gọn",
      ctaLabel: "Mua ngay",
      ctaHref: "/nu",
      align: "center",
      height: "large",
    },
    fields: [
      { key: "image", label: "Ảnh nền", type: "image" },
      { key: "heading", label: "Tiêu đề", type: "text" },
      { key: "subheading", label: "Phụ đề", type: "text" },
      { key: "ctaLabel", label: "Nhãn nút", type: "text" },
      { key: "ctaHref", label: "Link nút", type: "text" },
      {
        key: "align",
        label: "Căn nội dung",
        type: "select",
        options: [
          { value: "left", label: "Trái" },
          { value: "center", label: "Giữa" },
          { value: "right", label: "Phải" },
        ],
      },
      {
        key: "height",
        label: "Chiều cao",
        type: "select",
        options: [
          { value: "medium", label: "Vừa" },
          { value: "large", label: "Lớn" },
          { value: "full", label: "Toàn màn hình" },
        ],
      },
    ],
  },
  {
    type: "bannerImage",
    label: "Banner ảnh",
    description: "Một ảnh rộng có thể bấm",
    category: "media",
    defaultProps: { image: "", href: "/", alt: "", ratio: "16/6" },
    fields: [
      { key: "image", label: "Ảnh", type: "image" },
      { key: "href", label: "Link", type: "text" },
      { key: "alt", label: "Alt", type: "text" },
      {
        key: "ratio",
        label: "Tỉ lệ",
        type: "select",
        options: [
          { value: "16/6", label: "16:6 (rộng)" },
          { value: "16/9", label: "16:9" },
          { value: "21/9", label: "21:9 (siêu rộng)" },
          { value: "1/1", label: "1:1 (vuông)" },
        ],
      },
    ],
  },
  {
    type: "image",
    label: "Hình ảnh",
    description: "Một ảnh đơn có chú thích",
    category: "media",
    defaultProps: { src: "", alt: "", caption: "", width: "full" },
    fields: [
      { key: "src", label: "Ảnh", type: "image" },
      { key: "alt", label: "Alt", type: "text" },
      { key: "caption", label: "Chú thích", type: "text" },
      {
        key: "width",
        label: "Chiều rộng",
        type: "select",
        options: [
          { value: "full", label: "Toàn bộ" },
          { value: "wide", label: "Rộng" },
          { value: "normal", label: "Vừa" },
        ],
      },
    ],
  },
  {
    type: "gallery",
    label: "Thư viện ảnh",
    description: "Lưới nhiều ảnh",
    category: "media",
    defaultProps: { images: [], columns: "3" },
    fields: [
      { key: "images", label: "Ảnh (mỗi URL 1 dòng)", type: "list" },
      {
        key: "columns",
        label: "Số cột",
        type: "select",
        options: [
          { value: "2", label: "2" },
          { value: "3", label: "3" },
          { value: "4", label: "4" },
        ],
      },
    ],
  },
  {
    type: "videoEmbed",
    label: "Video nhúng",
    description: "Nhúng video YouTube/Vimeo",
    category: "media",
    defaultProps: { url: "", ratio: "16/9" },
    fields: [
      { key: "url", label: "URL video", type: "text" },
      {
        key: "ratio",
        label: "Tỉ lệ",
        type: "select",
        options: [
          { value: "16/9", label: "16:9" },
          { value: "4/3", label: "4:3" },
          { value: "1/1", label: "1:1" },
        ],
      },
    ],
  },
  {
    type: "logoMarquee",
    label: "Dải logo",
    description: "Logo thương hiệu cuộn ngang",
    category: "media",
    defaultProps: { heading: "Đối tác", images: [] },
    fields: [
      { key: "heading", label: "Tiêu đề", type: "text" },
      { key: "images", label: "Logo (mỗi URL 1 dòng)", type: "list" },
    ],
  },

  /* ----------------------------- Commerce ----------------------------- */
  {
    type: "productGrid",
    label: "Lưới sản phẩm",
    description: "Hiển thị sản phẩm theo nhãn",
    category: "commerce",
    defaultProps: { heading: "Sản phẩm nổi bật", flag: "bestseller", limit: 4, href: "" },
    fields: [
      { key: "heading", label: "Tiêu đề", type: "text" },
      { key: "flag", label: "Lọc theo nhãn", type: "select", options: flagOptions },
      { key: "limit", label: "Số lượng", type: "number" },
      { key: "href", label: "Link xem tất cả", type: "text" },
    ],
  },
  {
    type: "productCarousel",
    label: "Carousel sản phẩm",
    description: "Sản phẩm dạng cuộn ngang",
    category: "commerce",
    defaultProps: { heading: "Gợi ý cho bạn", flag: "new", limit: 8 },
    fields: [
      { key: "heading", label: "Tiêu đề", type: "text" },
      { key: "flag", label: "Lọc theo nhãn", type: "select", options: flagOptions },
      { key: "limit", label: "Số lượng", type: "number" },
    ],
  },
  {
    type: "featuredCategories",
    label: "Danh mục nổi bật",
    description: "Lưới danh mục có ảnh",
    category: "commerce",
    defaultProps: { heading: "Mua theo danh mục", gender: "nu", limit: 6 },
    fields: [
      { key: "heading", label: "Tiêu đề", type: "text" },
      {
        key: "gender",
        label: "Giới tính",
        type: "select",
        options: [
          { value: "nu", label: "Nữ" },
          { value: "nam", label: "Nam" },
          { value: "tre-em", label: "Trẻ Em" },
          { value: "em-be", label: "Em Bé" },
        ],
      },
      { key: "limit", label: "Số lượng", type: "number" },
    ],
  },

  /* ----------------------------- Marketing ----------------------------- */
  {
    type: "countdown",
    label: "Đếm ngược",
    description: "Đồng hồ đếm ngược tới mốc thời gian",
    category: "marketing",
    defaultProps: { heading: "Ưu đãi kết thúc sau", target: "", subheading: "" },
    fields: [
      { key: "heading", label: "Tiêu đề", type: "text" },
      { key: "subheading", label: "Phụ đề", type: "text" },
      { key: "target", label: "Thời điểm kết thúc (ISO: 2026-12-31T23:59)", type: "text" },
    ],
  },
  {
    type: "newsletter",
    label: "Đăng ký nhận tin",
    description: "Form thu thập email",
    category: "marketing",
    defaultProps: {
      heading: "Đăng ký nhận ưu đãi",
      subheading: "Nhận thông tin sản phẩm mới và khuyến mãi.",
      placeholder: "Email của bạn",
      buttonLabel: "Đăng ký",
    },
    fields: [
      { key: "heading", label: "Tiêu đề", type: "text" },
      { key: "subheading", label: "Phụ đề", type: "text" },
      { key: "placeholder", label: "Placeholder", type: "text" },
      { key: "buttonLabel", label: "Nhãn nút", type: "text" },
    ],
  },
];

export function getWidgetDef(type: string): WidgetDef | undefined {
  return WIDGETS.find((w) => w.type === type);
}
