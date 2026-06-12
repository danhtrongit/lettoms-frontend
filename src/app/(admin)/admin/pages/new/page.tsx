import { PageBuilder } from "@/components/admin/page-builder";

export const metadata = { title: "Tạo trang" };

export default function NewPageBuilderPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Tạo trang mới</h1>
      <PageBuilder />
    </div>
  );
}
