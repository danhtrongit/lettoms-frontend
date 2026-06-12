import { requireAdmin } from "@/lib/auth/rbac";
import { getSettings } from "@/lib/repos/settings.repo";
import { SettingsForm } from "@/components/admin/settings-form";

export const metadata = { title: "Cấu hình" };

export default async function AdminSettingsPage() {
  await requireAdmin();
  const s = await getSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Cấu hình website</h1>
        <p className="text-sm text-muted-foreground">
          Logo, liên hệ, mạng xã hội, vận chuyển, quà tặng và SEO.
        </p>
      </div>
      <SettingsForm
        initial={{
          brandName: s.brandName,
          logo: s.logo ?? "",
          favicon: s.favicon ?? "",
          phone: s.phone ?? "",
          email: s.email ?? "",
          address: s.address ?? "",
          social: s.social ?? {},
          announcementBar: s.announcementBar ?? { enabled: false, text: "" },
          freeshipThreshold: s.freeshipThreshold,
          gift: s.gift,
          seoTitle: s.seoTitle ?? "",
          seoDescription: s.seoDescription ?? "",
          ogImage: s.ogImage ?? "",
          emailSettings: s.emailSettings ?? {
            enabled: false,
            host: "",
            port: 587,
            secure: false,
            user: "",
            pass: "",
            fromName: "Letom's",
            fromEmail: "",
          },
        }}
      />
    </div>
  );
}
