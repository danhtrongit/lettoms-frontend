"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PaletteIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageFieldUi } from "@/lib/builder/fields/image-field";
import { slugify } from "@/lib/format";
import { createPageAction, savePageSettingsAction } from "@/server/actions/builder";

interface PageSettingsFormProps {
  id?: string;
  isSystem?: boolean;
  initial?: {
    title: string;
    slug: string;
    status: "draft" | "published";
    seoTitle: string | null;
    seoDescription: string | null;
    ogImage: string | null;
  };
}

export function PageSettingsForm({ id, isSystem, initial }: PageSettingsFormProps) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  const [title, setTitle] = React.useState(initial?.title ?? "");
  const [slug, setSlug] = React.useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = React.useState(Boolean(id));
  const [status, setStatus] = React.useState<"draft" | "published">(
    initial?.status ?? "draft"
  );
  const [seoTitle, setSeoTitle] = React.useState(initial?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = React.useState(
    initial?.seoDescription ?? ""
  );
  const [ogImage, setOgImage] = React.useState(initial?.ogImage ?? "");

  function onTitleChange(v: string) {
    setTitle(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  function submit() {
    setError(null);
    const payload = {
      title,
      slug,
      status,
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
      ogImage: ogImage || null,
    };

    startTransition(async () => {
      if (!id) {
        // Create mode
        const res = await createPageAction(payload);
        if (!res.ok) {
          setError(res.error ?? "Lưu thất bại");
          return;
        }
        router.push(`/admin/pages/${res.id}/builder`);
      } else {
        // Edit mode
        const res = await savePageSettingsAction(id, payload);
        if (!res.ok) {
          setError(res.error ?? "Lưu thất bại");
          return;
        }
        toast.success("Đã lưu cài đặt trang");
        router.refresh();
      }
    });
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Design button — edit mode only */}
      {id && (
        <div className="flex">
          <Button asChild variant="default" size="sm">
            <Link href={`/admin/pages/${id}/builder`}>
              <PaletteIcon className="size-4" />
              Mở trình thiết kế
            </Link>
          </Button>
        </div>
      )}

      {/* Basic info */}
      <section className="space-y-4 rounded-lg border bg-background p-5">
        <h2 className="font-semibold">Thông tin trang</h2>

        <div className="space-y-1.5">
          <Label htmlFor="page-title">Tiêu đề</Label>
          <Input
            id="page-title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Ví dụ: Giới thiệu"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="page-slug">
            Slug
            {isSystem && (
              <span className="ml-2 text-xs text-muted-foreground">(trang hệ thống — không thể đổi)</span>
            )}
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">/trang/</span>
            <Input
              id="page-slug"
              value={slug}
              disabled={isSystem}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
              placeholder="vi-du-slug"
              className="flex-1"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Trạng thái</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as "draft" | "published")}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Nháp</SelectItem>
              <SelectItem value="published">Xuất bản</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* SEO */}
      <section className="space-y-4 rounded-lg border bg-background p-5">
        <h2 className="font-semibold">SEO</h2>

        <div className="space-y-1.5">
          <Label htmlFor="seo-title">Tiêu đề SEO</Label>
          <Input
            id="seo-title"
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            placeholder="Để trống dùng tiêu đề trang"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="seo-desc">Mô tả SEO</Label>
          <Textarea
            id="seo-desc"
            rows={3}
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
            placeholder="Mô tả ngắn hiển thị trên kết quả tìm kiếm"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Ảnh OG</Label>
          <ImageFieldUi
            value={ogImage || undefined}
            onChange={(v) => setOgImage(v)}
          />
        </div>
      </section>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button onClick={submit} disabled={pending}>
          {pending ? "Đang lưu..." : "Lưu"}
        </Button>
      </div>
    </div>
  );
}
