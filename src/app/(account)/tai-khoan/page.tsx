import { requireUser } from "@/lib/auth/rbac";
import { getUserProfile } from "@/lib/repos/account.repo";
import { ProfileForm } from "@/components/account/profile-form";

export const metadata = { title: "Hồ sơ" };

export default async function AccountProfilePage() {
  const user = await requireUser("/tai-khoan");
  const profile = await getUserProfile(user.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Hồ sơ của tôi</h1>
      <ProfileForm
        initial={{
          name: profile?.name ?? "",
          email: profile?.email ?? user.email ?? "",
          phone: profile?.phone ?? "",
        }}
      />
    </div>
  );
}
