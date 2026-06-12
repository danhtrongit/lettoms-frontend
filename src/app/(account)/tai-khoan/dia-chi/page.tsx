import { requireUser } from "@/lib/auth/rbac";
import { listAddresses } from "@/lib/repos/account.repo";
import { AddressManager } from "@/components/account/address-manager";

export const metadata = { title: "Sổ địa chỉ" };

export default async function AddressBookPage() {
  const user = await requireUser("/tai-khoan/dia-chi");
  const addresses = await listAddresses(user.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Sổ địa chỉ</h1>
      <AddressManager
        addresses={addresses.map((a) => ({
          id: a.id,
          fullName: a.fullName,
          phone: a.phone,
          line1: a.line1,
          ward: a.ward,
          wardCode: a.wardCode,
          district: a.district,
          province: a.province,
          provinceCode: a.provinceCode,
          isDefault: a.isDefault,
        }))}
      />
    </div>
  );
}
