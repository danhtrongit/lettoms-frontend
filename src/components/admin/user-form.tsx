"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveUserAction } from "@/server/actions/users";

interface UserFormProps {
  id?: string;
  initial?: {
    name: string;
    email: string;
    role: "admin" | "staff" | "customer";
    phone: string;
  };
}

const ROLES = [
  { value: "admin", label: "Quản trị (Admin)" },
  { value: "staff", label: "Nhân viên (Staff)" },
  { value: "customer", label: "Khách hàng" },
] as const;

export function UserForm({ id, initial }: UserFormProps) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  const [name, setName] = React.useState(initial?.name ?? "");
  const [email, setEmail] = React.useState(initial?.email ?? "");
  const [role, setRole] = React.useState<"admin" | "staff" | "customer">(
    initial?.role ?? "customer"
  );
  const [phone, setPhone] = React.useState(initial?.phone ?? "");
  const [password, setPassword] = React.useState("");

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await saveUserAction(id ?? null, {
        name,
        email,
        role,
        phone: phone || null,
        password: password || undefined,
      });
      if (!res.ok) {
        setError(res.error ?? "Lưu thất bại");
        return;
      }
      router.push("/admin/users");
      router.refresh();
    });
  }

  return (
    <div className="max-w-md space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Họ và tên</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Vai trò</Label>
        <Select value={role} onValueChange={(v) => setRole(v as typeof role)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="phone">Số điện thoại</Label>
        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">
          {id ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu"}
        </Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button onClick={submit} disabled={pending}>
          {pending ? "Đang lưu..." : "Lưu người dùng"}
        </Button>
        <Button variant="ghost" onClick={() => router.back()}>
          Hủy
        </Button>
      </div>
    </div>
  );
}
