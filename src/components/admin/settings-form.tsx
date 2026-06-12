"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { MediaPicker } from "@/components/admin/media-picker";
import { saveSettingsAction } from "@/server/actions/settings";
import { sendTestEmailAction } from "@/server/actions/email";

interface SettingsValue {
  brandName: string;
  logo: string;
  favicon: string;
  phone: string;
  email: string;
  address: string;
  social: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    zalo?: string;
  };
  announcementBar: { enabled: boolean; text: string; href?: string };
  freeshipThreshold: number;
  gift: { enabled: boolean; threshold: number; label: string };
  seoTitle: string;
  seoDescription: string;
  ogImage: string;
  emailSettings: {
    enabled: boolean;
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    fromName: string;
    fromEmail: string;
  };
}

export function SettingsForm({ initial }: { initial: SettingsValue }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [v, setV] = React.useState<SettingsValue>(initial);
  const [testEmail, setTestEmail] = React.useState("");
  const [testing, setTesting] = React.useState(false);

  function setEmail<K extends keyof SettingsValue["emailSettings"]>(
    key: K,
    value: SettingsValue["emailSettings"][K]
  ) {
    setV((prev) => ({ ...prev, emailSettings: { ...prev.emailSettings, [key]: value } }));
  }

  async function sendTest() {
    if (!testEmail.includes("@")) {
      toast.error("Nhập email nhận thử");
      return;
    }
    setTesting(true);
    const res = await sendTestEmailAction(v.emailSettings, testEmail);
    setTesting(false);
    if (res.ok) toast.success("Đã gửi email thử");
    else toast.error(res.error ?? "Gửi thất bại");
  }

  function set<K extends keyof SettingsValue>(key: K, value: SettingsValue[K]) {
    setV((prev) => ({ ...prev, [key]: value }));
  }

  function submit() {
    startTransition(async () => {
      const res = await saveSettingsAction(v);
      if (!res.ok) {
        toast.error(res.error ?? "Lưu thất bại");
        return;
      }
      toast.success("Đã lưu cấu hình");
      router.refresh();
    });
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Brand */}
      <section className="space-y-4 rounded-lg border bg-background p-5">
        <h2 className="font-semibold">Thương hiệu</h2>
        <div className="space-y-1.5">
          <Label>Tên thương hiệu</Label>
          <Input value={v.brandName} onChange={(e) => set("brandName", e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <LogoField label="Logo" value={v.logo} onChange={(u) => set("logo", u)} />
          <LogoField label="Favicon" value={v.favicon} onChange={(u) => set("favicon", u)} />
        </div>
      </section>

      {/* Contact */}
      <section className="space-y-4 rounded-lg border bg-background p-5">
        <h2 className="font-semibold">Liên hệ</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Điện thoại</Label>
            <Input value={v.phone} onChange={(e) => set("phone", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={v.email} onChange={(e) => set("email", e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Địa chỉ</Label>
          <Input value={v.address} onChange={(e) => set("address", e.target.value)} />
        </div>
      </section>

      {/* Social */}
      <section className="space-y-4 rounded-lg border bg-background p-5">
        <h2 className="font-semibold">Mạng xã hội</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {(["facebook", "instagram", "tiktok", "youtube", "zalo"] as const).map((k) => (
            <div key={k} className="space-y-1.5">
              <Label className="capitalize">{k}</Label>
              <Input
                value={v.social[k] ?? ""}
                onChange={(e) => set("social", { ...v.social, [k]: e.target.value })}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Announcement */}
      <section className="space-y-4 rounded-lg border bg-background p-5">
        <h2 className="font-semibold">Thanh thông báo</h2>
        <label className="flex items-center gap-2 text-sm">
          <Switch
            checked={v.announcementBar.enabled}
            onCheckedChange={(c) => set("announcementBar", { ...v.announcementBar, enabled: c })}
          />
          Hiển thị thanh thông báo
        </label>
        <div className="space-y-1.5">
          <Label>Nội dung</Label>
          <Input
            value={v.announcementBar.text}
            onChange={(e) => set("announcementBar", { ...v.announcementBar, text: e.target.value })}
          />
        </div>
      </section>

      {/* Freeship + Gift */}
      <section className="space-y-4 rounded-lg border bg-background p-5">
        <h2 className="font-semibold">Vận chuyển & Quà tặng</h2>
        <div className="space-y-1.5">
          <Label>Ngưỡng miễn phí vận chuyển (VND, 0 = tắt)</Label>
          <Input
            type="number"
            value={v.freeshipThreshold}
            onChange={(e) => set("freeshipThreshold", Number(e.target.value))}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <Switch
            checked={v.gift.enabled}
            onCheckedChange={(c) => set("gift", { ...v.gift, enabled: c })}
          />
          Bật quà tặng theo ngưỡng
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Ngưỡng quà tặng (VND)</Label>
            <Input
              type="number"
              value={v.gift.threshold}
              onChange={(e) => set("gift", { ...v.gift, threshold: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Nhãn quà tặng</Label>
            <Input
              value={v.gift.label}
              onChange={(e) => set("gift", { ...v.gift, label: e.target.value })}
            />
          </div>
        </div>
      </section>

      {/* SEO */}
      <section className="space-y-4 rounded-lg border bg-background p-5">
        <h2 className="font-semibold">SEO mặc định</h2>
        <div className="space-y-1.5">
          <Label>Tiêu đề SEO</Label>
          <Input value={v.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Mô tả SEO</Label>
          <Textarea
            rows={2}
            value={v.seoDescription}
            onChange={(e) => set("seoDescription", e.target.value)}
          />
        </div>
        <LogoField label="Ảnh OG" value={v.ogImage} onChange={(u) => set("ogImage", u)} />
      </section>

      {/* SMTP / Email */}
      <section className="space-y-4 rounded-lg border bg-background p-5">
        <h2 className="font-semibold">Email (SMTP)</h2>
        <label className="flex items-center gap-2 text-sm">
          <Switch
            checked={v.emailSettings.enabled}
            onCheckedChange={(c) => setEmail("enabled", c)}
          />
          Bật gửi email qua SMTP
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>SMTP Host</Label>
            <Input
              value={v.emailSettings.host}
              placeholder="smtp.gmail.com"
              onChange={(e) => setEmail("host", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Cổng (Port)</Label>
            <Input
              type="number"
              value={v.emailSettings.port}
              onChange={(e) => setEmail("port", Number(e.target.value))}
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <Switch
            checked={v.emailSettings.secure}
            onCheckedChange={(c) => setEmail("secure", c)}
          />
          Dùng SSL/TLS (secure — thường cổng 465)
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Tài khoản (user)</Label>
            <Input
              value={v.emailSettings.user}
              onChange={(e) => setEmail("user", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Mật khẩu (app password)</Label>
            <Input
              type="password"
              value={v.emailSettings.pass}
              onChange={(e) => setEmail("pass", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Tên người gửi</Label>
            <Input
              value={v.emailSettings.fromName}
              onChange={(e) => setEmail("fromName", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Email người gửi</Label>
            <Input
              value={v.emailSettings.fromEmail}
              placeholder="no-reply@letoms.vn"
              onChange={(e) => setEmail("fromEmail", e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 border-t pt-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1.5">
            <Label>Gửi email thử tới</Label>
            <Input
              value={testEmail}
              placeholder="ban@example.com"
              onChange={(e) => setTestEmail(e.target.value)}
            />
          </div>
          <Button type="button" variant="outline" onClick={sendTest} disabled={testing}>
            {testing ? "Đang gửi..." : "Gửi thử"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Lưu cấu hình trước, sau đó dùng nút Gửi thử để kiểm tra.
        </p>
      </section>

      <div className="flex gap-2">
        <Button onClick={submit} disabled={pending}>
          {pending ? "Đang lưu..." : "Lưu cấu hình"}
        </Button>
      </div>
    </div>
  );
}

function LogoField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        {value ? (
          <div className="relative size-16 overflow-hidden rounded-md border bg-muted">
            <Image src={value} alt="" fill sizes="64px" className="object-contain" />
          </div>
        ) : (
          <div className="grid size-16 place-items-center rounded-md border bg-muted text-xs text-muted-foreground">
            Trống
          </div>
        )}
        <div className="flex flex-col gap-1">
          <MediaPicker onSelect={(urls) => onChange(urls[0] ?? "")} />
          {value && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
              Gỡ
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
