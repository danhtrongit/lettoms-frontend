import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-6xl font-semibold tracking-tight text-primary">404</p>
      <h1 className="text-2xl font-semibold">Không tìm thấy trang</h1>
      <p className="max-w-md text-muted-foreground">
        Trang bạn tìm kiếm không tồn tại hoặc đã được di chuyển. Hãy kiểm tra lại
        đường dẫn hoặc quay về trang chủ.
      </p>
      <div className="mt-2 flex gap-3">
        <Button asChild className="rounded-full">
          <Link href="/">Về trang chủ</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/women">Mua sắm</Link>
        </Button>
      </div>
    </div>
  );
}
