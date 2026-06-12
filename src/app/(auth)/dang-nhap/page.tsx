import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Đăng nhập",
  robots: { index: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold">Đăng nhập</h1>
          <p className="text-sm text-muted-foreground">
            Chào mừng trở lại với Letom&apos;s
          </p>
        </div>
        <AuthForm mode="login" callbackUrl={callbackUrl ?? "/"} />
      </div>
    </div>
  );
}
