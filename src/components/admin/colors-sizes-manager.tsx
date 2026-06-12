"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  saveColorAction,
  deleteColorAction,
  saveSizeAction,
  deleteSizeAction,
} from "@/server/actions/colors-sizes";

interface Color {
  code: string;
  name: string;
  hex: string;
}
interface Size {
  code: string;
  label: string;
  sortOrder: number;
}

export function ColorsSizesManager({
  colors,
  sizes,
}: {
  colors: Color[];
  sizes: Size[];
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  // Color form
  const [cCode, setCCode] = React.useState("");
  const [cName, setCName] = React.useState("");
  const [cHex, setCHex] = React.useState("#000000");

  // Size form
  const [sCode, setSCode] = React.useState("");
  const [sLabel, setSLabel] = React.useState("");
  const [sOrder, setSOrder] = React.useState(0);

  function addColor() {
    startTransition(async () => {
      const res = await saveColorAction({ code: cCode, name: cName, hex: cHex });
      if (!res.ok) return alert(res.error);
      setCCode("");
      setCName("");
      setCHex("#000000");
      router.refresh();
    });
  }
  function removeColor(code: string) {
    if (!confirm(`Xóa màu ${code}?`)) return;
    startTransition(async () => {
      const res = await deleteColorAction(code);
      if (!res.ok) return alert(res.error);
      router.refresh();
    });
  }
  function addSize() {
    startTransition(async () => {
      const res = await saveSizeAction({ code: sCode, label: sLabel, sortOrder: sOrder });
      if (!res.ok) return alert(res.error);
      setSCode("");
      setSLabel("");
      setSOrder(0);
      router.refresh();
    });
  }
  function removeSize(code: string) {
    if (!confirm(`Xóa cỡ ${code}?`)) return;
    startTransition(async () => {
      const res = await deleteSizeAction(code);
      if (!res.ok) return alert(res.error);
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Colors */}
      <section className="space-y-4 rounded-lg border bg-background p-5">
        <h2 className="font-semibold">Màu sắc ({colors.length})</h2>
        <div className="flex flex-wrap items-end gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Mã</Label>
            <Input className="w-20" value={cCode} onChange={(e) => setCCode(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Tên</Label>
            <Input className="w-32" value={cName} onChange={(e) => setCName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Màu</Label>
            <input
              type="color"
              value={cHex}
              onChange={(e) => setCHex(e.target.value)}
              className="h-9 w-12 rounded border"
            />
          </div>
          <Button size="sm" onClick={addColor} disabled={pending || !cCode || !cName}>
            Thêm
          </Button>
        </div>
        <div className="max-h-80 space-y-1 overflow-y-auto">
          {colors.map((c) => (
            <div
              key={c.code}
              className="flex items-center gap-3 rounded-md border px-3 py-1.5 text-sm"
            >
              <span className="size-4 rounded-full border" style={{ backgroundColor: c.hex }} />
              <span className="font-medium">{c.name}</span>
              <span className="text-xs text-muted-foreground">{c.code}</span>
              <button
                type="button"
                onClick={() => removeColor(c.code)}
                className="ml-auto text-destructive"
              >
                <Trash2Icon className="size-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Sizes */}
      <section className="space-y-4 rounded-lg border bg-background p-5">
        <h2 className="font-semibold">Kích cỡ ({sizes.length})</h2>
        <div className="flex flex-wrap items-end gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Mã</Label>
            <Input className="w-20" value={sCode} onChange={(e) => setSCode(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Nhãn</Label>
            <Input className="w-24" value={sLabel} onChange={(e) => setSLabel(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Thứ tự</Label>
            <Input
              type="number"
              className="w-20"
              value={sOrder}
              onChange={(e) => setSOrder(Number(e.target.value))}
            />
          </div>
          <Button size="sm" onClick={addSize} disabled={pending || !sCode || !sLabel}>
            Thêm
          </Button>
        </div>
        <div className="max-h-80 space-y-1 overflow-y-auto">
          {sizes.map((s) => (
            <div
              key={s.code}
              className="flex items-center gap-3 rounded-md border px-3 py-1.5 text-sm"
            >
              <span className="font-medium">{s.label}</span>
              <span className="text-xs text-muted-foreground">{s.code}</span>
              <button
                type="button"
                onClick={() => removeSize(s.code)}
                className="ml-auto text-destructive"
              >
                <Trash2Icon className="size-4" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
