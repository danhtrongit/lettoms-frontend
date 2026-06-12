import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Newsletter() {
  return (
    <section className="border-y bg-muted/40">
      <div className="container-page flex flex-col items-center gap-4 py-14 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">
          Đăng Ký Nhận Tin
        </h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Nhận thông tin về bộ sưu tập mới, ưu đãi độc quyền và mẹo phối đồ từ Letom&apos;s.
        </p>
        <form className="flex w-full max-w-md gap-2">
          <Input
            type="email"
            required
            placeholder="Nhập email của bạn"
            aria-label="Email đăng ký nhận tin"
          />
          <Button type="submit" className="shrink-0 rounded-full">
            Đăng ký
          </Button>
        </form>
      </div>
    </section>
  );
}
