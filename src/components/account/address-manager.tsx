"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PlusIcon, PencilIcon, Trash2Icon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  ProvinceWardSelect,
  type AddressArea,
} from "@/components/common/province-ward-select";
import {
  saveAddressAction,
  deleteAddressAction,
} from "@/server/actions/account";

interface Address {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  ward: string | null;
  wardCode: string | null;
  district: string | null;
  province: string | null;
  provinceCode: string | null;
  isDefault: boolean;
}

export function AddressManager({ addresses }: { addresses: Address[] }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Address | null>(null);
  const [area, setArea] = React.useState<AddressArea>({});

  function openNew() {
    setEditing(null);
    setArea({});
    setOpen(true);
  }
  function openEdit(addr: Address) {
    setEditing(addr);
    setArea({
      provinceCode: addr.provinceCode ?? undefined,
      provinceName: addr.province ?? undefined,
      wardCode: addr.wardCode ?? undefined,
      wardName: addr.ward ?? undefined,
    });
    setOpen(true);
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await saveAddressAction(editing?.id ?? null, {
        fullName: fd.get("fullName"),
        phone: fd.get("phone"),
        line1: fd.get("line1"),
        ward: area.wardName || null,
        wardCode: area.wardCode || null,
        province: area.provinceName || null,
        provinceCode: area.provinceCode || null,
        isDefault: fd.get("isDefault") === "on",
      });
      if (!res.ok) {
        toast.error(res.error ?? "Lưu thất bại");
        return;
      }
      toast.success("Đã lưu địa chỉ");
      setOpen(false);
      router.refresh();
    });
  }

  function remove(id: string) {
    if (!confirm("Xóa địa chỉ này?")) return;
    startTransition(async () => {
      const res = await deleteAddressAction(id);
      if (!res.ok) {
        toast.error(res.error ?? "Xóa thất bại");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openNew} size="sm">
          <PlusIcon className="size-4" />
          Thêm địa chỉ
        </Button>
      </div>

      {addresses.length === 0 ? (
        <p className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
          Chưa có địa chỉ nào.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {addresses.map((a) => (
            <div key={a.id} className="rounded-lg border bg-background p-4 text-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">
                    {a.fullName}
                    {a.isDefault && (
                      <span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                        Mặc định
                      </span>
                    )}
                  </p>
                  <p className="text-muted-foreground">{a.phone}</p>
                  <p className="mt-1 text-muted-foreground">
                    {[a.line1, a.ward, a.district, a.province].filter(Boolean).join(", ")}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(a)} className="p-1 text-muted-foreground hover:text-foreground">
                    <PencilIcon className="size-4" />
                  </button>
                  <button onClick={() => remove(a.id)} className="p-1 text-destructive">
                    <Trash2Icon className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Sửa địa chỉ" : "Thêm địa chỉ"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Họ tên</Label>
                <Input id="fullName" name="fullName" defaultValue={editing?.fullName} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input id="phone" name="phone" defaultValue={editing?.phone} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="line1">Địa chỉ</Label>
              <Input id="line1" name="line1" defaultValue={editing?.line1} required />
            </div>
            <ProvinceWardSelect value={area} onChange={setArea} />
            <label className="flex items-center gap-2 text-sm">
              <Switch name="isDefault" defaultChecked={editing?.isDefault} />
              Đặt làm địa chỉ mặc định
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Đang lưu..." : "Lưu"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
