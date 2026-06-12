"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfileAction } from "@/server/actions/account";

export function ProfileForm({
  initial,
}: {
  initial: { name: string; email: string; phone: string };
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [name, setName] = React.useState(initial.name);
  const [phone, setPhone] = React.useState(initial.phone);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateProfileAction({ name, phone });
      if (!res.ok) {
        toast.error(res.error ?? "Cập nhật thất bại");
        return;
      }
      toast.success("Đã cập nhật hồ sơ");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="max-w-md space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={initial.email} disabled />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="name">Họ và tên</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="phone">Số điện thoại</Label>
        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Đang lưu..." : "Lưu thay đổi"}
      </Button>
    </form>
  );
}
