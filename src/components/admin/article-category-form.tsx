"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { MediaPicker } from "@/components/admin/media-picker";
import { slugify } from "@/lib/format";
import { saveArticleCategoryAction } from "@/server/actions/content";

interface ArticleCategoryFormProps {
  id?: string;
  initial?: {
    name: string;
    slug: string;
    description: string;
    thumbnail: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
    sortOrder: number;
  };
}

export function ArticleCategoryForm({ id, initial }: ArticleCategoryFormProps) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  const [name, setName] = React.useState(initial?.name ?? "");
  const [slug, setSlug] = React.useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = React.useState(Boolean(id));
  const [description, setDescription] = React.useState(initial?.description ?? "");
  const [thumbnail, setThumbnail] = React.useState(initial?.thumbnail ?? "");
  const [seoTitle, setSeoTitle] = React.useState(initial?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = React.useState(initial?.seoDescription ?? "");
  const [sortOrder, setSortOrder] = React.useState(initial?.sortOrder ?? 0);

  function onNameChange(v: string) {
    setName(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await saveArticleCategoryAction(id ?? null, {
        name,
        slug,
        description,
        thumbnail: thumbnail || null,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        sortOrder,
      });
      if (!res.ok) {
        setError(res.error ?? "Lưu thất bại");
        return;
      }
      router.push("/admin/article-categories");
      router.refresh();
    });
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Tên danh mục</Label>
          <Input id="name" value={name} onChange={(e) => onNameChange(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Mô tả</Label>
        <Textarea
          id="description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Ảnh thumbnail</Label>
        <div className="flex items-center gap-3">
          {thumbnail ? (
            <div className="relative h-24 w-40 overflow-hidden rounded-md border bg-muted">
              <Image src={thumbnail} alt="" fill sizes="160px" className="object-cover" />
            </div>
          ) : (
            <div className="grid h-24 w-40 place-items-center rounded-md border bg-muted text-xs text-muted-foreground">
              Trống
            </div>
          )}
          <MediaPicker onSelect={(urls) => setThumbnail(urls[0] ?? "")} />
        </div>
      </div>

      <div className="space-y-3 rounded-lg border p-4">
        <p className="text-sm font-medium">SEO</p>
        <div className="space-y-1.5">
          <Label htmlFor="seoTitle">Tiêu đề SEO</Label>
          <Input id="seoTitle" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="seoDescription">Mô tả SEO</Label>
          <Textarea
            id="seoDescription"
            rows={2}
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="sortOrder">Thứ tự</Label>
        <Input
          id="sortOrder"
          type="number"
          className="w-24"
          value={sortOrder}
          onChange={(e) => setSortOrder(Number(e.target.value))}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button onClick={submit} disabled={pending}>
          {pending ? "Đang lưu..." : "Lưu danh mục"}
        </Button>
        <Button variant="ghost" onClick={() => router.back()}>
          Hủy
        </Button>
      </div>
    </div>
  );
}
