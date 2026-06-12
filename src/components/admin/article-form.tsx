"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MediaPicker } from "@/components/admin/media-picker";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { ProductMultiSelect } from "@/components/admin/product-multi-select";
import type { JSONContent } from "@tiptap/core";
import { slugify } from "@/lib/format";
import { saveArticleAction } from "@/server/actions/content";

interface CategoryOption {
  id: string;
  name: string;
}

interface ArticleFormProps {
  id?: string;
  categories: CategoryOption[];
  initial?: {
    title: string;
    slug: string;
    excerpt: string;
    categoryId: string | null;
    coverImage: string | null;
    author: string;
    readingMinutes: number;
    contentJson: JSONContent | null;
    featured: boolean;
    isPublished: boolean;
    relatedProductIds: string[];
    seoTitle: string | null;
    seoDescription: string | null;
  };
}

export function ArticleForm({ id, categories, initial }: ArticleFormProps) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  const [title, setTitle] = React.useState(initial?.title ?? "");
  const [slug, setSlug] = React.useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = React.useState(Boolean(id));
  const [excerpt, setExcerpt] = React.useState(initial?.excerpt ?? "");
  const [categoryId, setCategoryId] = React.useState(initial?.categoryId ?? "none");
  const [coverImage, setCoverImage] = React.useState(initial?.coverImage ?? "");
  const [author, setAuthor] = React.useState(initial?.author ?? "Letom's");
  const [readingMinutes, setReadingMinutes] = React.useState(initial?.readingMinutes ?? 3);
  const [contentJson, setContentJson] = React.useState<JSONContent | null>(
    initial?.contentJson ?? null
  );
  const [featured, setFeatured] = React.useState(initial?.featured ?? false);
  const [isPublished, setIsPublished] = React.useState(initial?.isPublished ?? true);
  const [relatedIds, setRelatedIds] = React.useState<string[]>(
    initial?.relatedProductIds ?? []
  );
  const [seoTitle, setSeoTitle] = React.useState(initial?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = React.useState(initial?.seoDescription ?? "");

  function onTitleChange(v: string) {
    setTitle(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await saveArticleAction(id ?? null, {
        title,
        slug,
        excerpt,
        categoryId: categoryId === "none" ? null : categoryId,
        coverImage: coverImage || null,
        author,
        readingMinutes,
        contentJson,
        featured,
        isPublished,
        relatedProductIds: relatedIds,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
      });
      if (!res.ok) {
        setError(res.error ?? "Lưu thất bại");
        return;
      }
      router.push("/admin/articles");
      router.refresh();
    });
  }

  return (
    <div className="max-w-3xl space-y-6">
      <section className="space-y-4 rounded-lg border bg-background p-5">
        <h2 className="font-semibold">Thông tin bài viết</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="title">Tiêu đề</Label>
            <Input id="title" value={title} onChange={(e) => onTitleChange(e.target.value)} />
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
          <Label htmlFor="excerpt">Tóm tắt</Label>
          <Textarea
            id="excerpt"
            rows={2}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Danh mục</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— Không —</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="author">Tác giả</Label>
            <Input id="author" value={author} onChange={(e) => setAuthor(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reading">Phút đọc</Label>
            <Input
              id="reading"
              type="number"
              value={readingMinutes}
              onChange={(e) => setReadingMinutes(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Ảnh bìa</Label>
          <div className="flex items-center gap-3">
            {coverImage ? (
              <div className="relative h-24 w-40 overflow-hidden rounded-md border bg-muted">
                <Image src={coverImage} alt="" fill sizes="160px" className="object-cover" />
              </div>
            ) : (
              <div className="grid h-24 w-40 place-items-center rounded-md border bg-muted text-xs text-muted-foreground">
                Trống
              </div>
            )}
            <MediaPicker onSelect={(urls) => setCoverImage(urls[0] ?? "")} />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={featured} onCheckedChange={setFeatured} />
            Nổi bật
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={isPublished} onCheckedChange={setIsPublished} />
            Xuất bản
          </label>
        </div>
      </section>

      <section className="space-y-4 rounded-lg border bg-background p-5">
        <h2 className="font-semibold">Nội dung bài viết</h2>
        <RichTextEditor
          value={contentJson}
          onChange={setContentJson}
          placeholder="Soạn nội dung bài viết..."
        />
      </section>

      <section className="space-y-4 rounded-lg border bg-background p-5">
        <h2 className="font-semibold">Sản phẩm liên quan</h2>
        <ProductMultiSelect value={relatedIds} onChange={setRelatedIds} />
      </section>

      <section className="space-y-4 rounded-lg border bg-background p-5">
        <h2 className="font-semibold">SEO</h2>
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
      </section>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button onClick={submit} disabled={pending}>
          {pending ? "Đang lưu..." : "Lưu bài viết"}
        </Button>
        <Button variant="ghost" onClick={() => router.back()}>
          Hủy
        </Button>
      </div>
    </div>
  );
}
