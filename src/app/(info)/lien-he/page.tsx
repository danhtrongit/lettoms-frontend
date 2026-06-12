"use client";

import * as React from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/common/page-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/data/site";

export default function ContactPage() {
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    toast.success("Đã gửi liên hệ", {
      description: "Cảm ơn bạn! Chúng tôi sẽ phản hồi sớm nhất. (demo)",
    });
    e.currentTarget.reset();
  }

  return (
    <PageShell
      title="Liên Hệ"
      description={`Gọi ${siteConfig.phone} hoặc gửi email tới ${siteConfig.email}, hoặc điền biểu mẫu dưới đây.`}
      breadcrumbs={[
        { label: "Trang chủ", href: "/" },
        { label: "Trợ giúp", href: "/ho-tro" },
        { label: "Liên hệ" },
      ]}
      narrow
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Họ và tên</Label>
            <Input id="name" required autoComplete="name" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required autoComplete="email" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="subject">Chủ đề</Label>
          <Input id="subject" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="message">Nội dung</Label>
          <Textarea id="message" rows={6} required />
        </div>
        <Button type="submit" className="rounded-full">
          Gửi liên hệ
        </Button>
      </form>
    </PageShell>
  );
}
