import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "image.uniqlo.com" },
      { protocol: "https", hostname: "asset.uniqlo.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async redirects() {
    return [
      // Genders
      { source: "/women", destination: "/nu", permanent: true },
      { source: "/women/:path*", destination: "/nu/:path*", permanent: true },
      { source: "/men", destination: "/nam", permanent: true },
      { source: "/men/:path*", destination: "/nam/:path*", permanent: true },
      { source: "/kids", destination: "/tre-em", permanent: true },
      { source: "/kids/:path*", destination: "/tre-em/:path*", permanent: true },
      { source: "/baby", destination: "/em-be", permanent: true },
      { source: "/baby/:path*", destination: "/em-be/:path*", permanent: true },
      // Catalog functional
      { source: "/products/:id", destination: "/san-pham/:id", permanent: true },
      { source: "/search", destination: "/tim-kiem", permanent: true },
      { source: "/ranking/:gender", destination: "/ban-chay/:gender", permanent: true },
      { source: "/feature/new", destination: "/uu-dai/hang-moi", permanent: true },
      { source: "/feature/sale", destination: "/uu-dai/khuyen-mai", permanent: true },
      { source: "/feature/bestseller", destination: "/uu-dai/ban-chay", permanent: true },
      { source: "/feature/limited-offers", destination: "/uu-dai/uu-dai-co-han", permanent: true },
      // Content
      { source: "/news", destination: "/tin-tuc", permanent: true },
      { source: "/news/:path*", destination: "/tin-tuc/:path*", permanent: true },
      // Commerce
      { source: "/cart", destination: "/gio-hang", permanent: true },
      { source: "/wishlist", destination: "/yeu-thich", permanent: true },
      { source: "/checkout", destination: "/thanh-toan", permanent: true },
      // Info
      { source: "/about", destination: "/gioi-thieu", permanent: true },
      { source: "/stores", destination: "/cua-hang", permanent: true },
      { source: "/customer-service", destination: "/ho-tro", permanent: true },
      { source: "/faq", destination: "/cau-hoi-thuong-gap", permanent: true },
      { source: "/size-guide", destination: "/huong-dan-size", permanent: true },
      { source: "/shipping-returns", destination: "/van-chuyen-doi-tra", permanent: true },
      { source: "/terms", destination: "/dieu-khoan", permanent: true },
      { source: "/privacy", destination: "/bao-mat", permanent: true },
      { source: "/contact", destination: "/lien-he", permanent: true },
    ];
  },
};

export default nextConfig;
