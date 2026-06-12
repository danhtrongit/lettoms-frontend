import { PageSettingsForm } from "@/components/admin/page-settings-form";

export const metadata = { title: "Tạo trang mới" };

export default function NewPageBuilderPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Tạo trang mới</h1>
      <PageSettingsForm />
    </div>
  );
}
