import type { Article, ArticleCategory } from "@/types";

export const articleCategories: ArticleCategory[] = [
  { slug: "phong-cach", name: "Phong Cách", description: "Gợi ý phối đồ và xu hướng theo mùa." },
  { slug: "cau-chuyen", name: "Câu Chuyện", description: "Câu chuyện đằng sau sản phẩm và con người Letom's." },
  { slug: "ben-vung", name: "Bền Vững", description: "Cam kết của chúng tôi với môi trường." },
  { slug: "hop-tac", name: "Hợp Tác", description: "Các bộ sưu tập hợp tác đặc biệt." },
  { slug: "tin-tuc", name: "Tin Tức", description: "Thông báo và sự kiện mới nhất." },
];

function body(paras: string[]): Article["body"] {
  return paras.map((text) => ({ type: "paragraph" as const, text }));
}

const P1 =
  "Tại Letom's, chúng tôi tin rằng quần áo tốt là quần áo bạn mặc mỗi ngày. Triết lý LifeWear hướng tới sự đơn giản, chất lượng và bền bỉ.";
const P2 =
  "Mỗi sản phẩm đều được thiết kế để dễ phối, thoải mái và phù hợp với nhịp sống hiện đại. Đó là lý do chúng tôi tập trung vào chi tiết nhỏ nhất.";
const P3 =
  "Từ chất liệu đến phom dáng, chúng tôi không ngừng cải tiến để mang lại trải nghiệm tốt nhất cho khách hàng Việt Nam.";

export const articles: Article[] = [
  {
    slug: "lifewear-la-gi",
    title: "LifeWear Là Gì? Triết Lý Đằng Sau Letom's",
    excerpt: "Khám phá triết lý LifeWear và cách nó định hình từng sản phẩm của chúng tôi.",
    category: "cau-chuyen",
    coverImage: "/images/articles/lifewear.jpg",
    author: "Đội Ngũ Letom's",
    publishedAt: "2026-05-20",
    readingMinutes: 5,
    featured: true,
    body: body([P1, P2, P3]),
    relatedProductIds: ["422992", "482181", "474244"],
  },
  {
    slug: "phoi-do-mua-he-2026",
    title: "5 Cách Phối Đồ Mùa Hè 2026",
    excerpt: "Linen, màu trung tính và phom rộng — công thức cho mùa hè mát mẻ.",
    category: "phong-cach",
    coverImage: "/images/articles/summer-style.jpg",
    author: "Stylist Letom's",
    publishedAt: "2026-05-15",
    readingMinutes: 4,
    featured: true,
    body: body([P2, P1]),
    relatedProductIds: ["473696", "485251", "484508"],
  },
  {
    slug: "cau-chuyen-airism",
    title: "AIRism: Công Nghệ Vải Mát Lạnh",
    excerpt: "Tại sao AIRism trở thành lựa chọn hàng đầu cho thời tiết nóng ẩm.",
    category: "cau-chuyen",
    coverImage: "/images/articles/airism.jpg",
    author: "Đội Ngũ Letom's",
    publishedAt: "2026-05-10",
    readingMinutes: 6,
    body: body([P3, P2]),
    relatedProductIds: ["482181", "465707"],
  },
  {
    slug: "cam-ket-ben-vung",
    title: "Hành Trình Bền Vững Của Letom's",
    excerpt: "Cách chúng tôi giảm thiểu tác động môi trường trong sản xuất.",
    category: "ben-vung",
    coverImage: "/images/articles/sustainability.jpg",
    author: "Đội Ngũ Letom's",
    publishedAt: "2026-05-05",
    readingMinutes: 7,
    body: body([P1, P3]),
  },
  {
    slug: "bo-suu-tap-thu-dong",
    title: "Ra Mắt Bộ Sưu Tập Thu Đông 2026",
    excerpt: "HEATTECH, áo phao lông vũ và những lớp giữ ấm thông minh.",
    category: "tin-tuc",
    coverImage: "/images/articles/fall-winter.jpg",
    author: "Đội Ngũ Letom's",
    publishedAt: "2026-04-28",
    readingMinutes: 3,
    body: body([P2, P3]),
    relatedProductIds: ["483430", "484610", "455533"],
  },
  {
    slug: "hop-tac-nghe-si",
    title: "Letom's x Nghệ Sĩ Địa Phương",
    excerpt: "Bộ sưu tập áo thun in họa tiết giới hạn từ các nghệ sĩ Việt.",
    category: "hop-tac",
    coverImage: "/images/articles/collab.jpg",
    author: "Đội Ngũ Letom's",
    publishedAt: "2026-04-20",
    readingMinutes: 4,
    body: body([P1, P2]),
    relatedProductIds: ["484421", "474592"],
  },
  {
    slug: "huong-dan-chon-jeans",
    title: "Hướng Dẫn Chọn Quần Jeans Hoàn Hảo",
    excerpt: "Từ slim đến ống suông — tìm phom jeans phù hợp với bạn.",
    category: "phong-cach",
    coverImage: "/images/articles/jeans-guide.jpg",
    author: "Stylist Letom's",
    publishedAt: "2026-04-12",
    readingMinutes: 5,
    body: body([P3, P1]),
    relatedProductIds: ["482172", "482944"],
  },
  {
    slug: "cham-soc-do-len",
    title: "Cách Chăm Sóc Áo Len Đúng Cách",
    excerpt: "Giữ áo len mềm mại và bền đẹp qua nhiều mùa.",
    category: "phong-cach",
    coverImage: "/images/articles/knitwear-care.jpg",
    author: "Đội Ngũ Letom's",
    publishedAt: "2026-04-05",
    readingMinutes: 3,
    body: body([P2]),
    relatedProductIds: ["483576", "465193"],
  },
];
