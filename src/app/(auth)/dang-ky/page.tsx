import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Đăng ký",
  robots: { index: false },
};

export default function RegisterPage() {
  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold">Tạo tài khoản</h1>
          <p className="text-sm text-muted-foreground">
            Mua sắm nhanh hơn và theo dõi đơn hàng của bạn
          </p>
        </div>
        <AuthForm mode="register" />
      </div>
    </div>
  );
}
