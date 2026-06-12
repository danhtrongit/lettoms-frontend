import { MediaManager } from "@/components/admin/media-manager";

export const metadata = { title: "Thư viện ảnh" };

export default function AdminMediaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Thư viện ảnh</h1>
        <p className="text-sm text-muted-foreground">
          Quản lý toàn bộ ảnh dùng cho sản phẩm, bài viết và trang.
        </p>
      </div>
      <MediaManager />
    </div>
  );
}
