import { requireStaff } from "@/lib/auth/rbac";

export const metadata = {
  title: "Trình thiết kế trang",
  robots: { index: false, follow: false },
};

export default async function BuilderLayout({ children }: { children: React.ReactNode }) {
  await requireStaff();
  return <>{children}</>;
}
