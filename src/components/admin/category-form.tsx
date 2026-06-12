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
import { slugify } from "@/lib/format";
import { saveCategoryAction } from "@/server/actions/catalog";
import type { Gender } from "@/types";

interface ParentOption {
  id: string;
  name: string;
  gender: string;
}

interface CategoryFormProps {
  id?: string;
  parents: ParentOption[];
  initial?: {
    name: string;
    slug: string;
    gender: Gender;
    parentId: string | null;
    description: string | null;
    heroImage: string | null;
    iconImage: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
    sortOrder: number;
    isActive: boolean;
  };
}

const GENDERS: { value: Gender; label: string }[] = [
  { value: "nu", label: "Nữ" },
  { value: "nam", label: "Nam" },
  { value: "tre-em", label: "Trẻ Em" },
  { value: "em-be", label: "Em Bé" },
];

export function CategoryForm({ id, parents, initial }: CategoryFormProps) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  const [name, setName] = React.useState(initial?.name ?? "");
  const [slug, setSlug] = React.useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = React.useState(Boolean(id));
  const [gender, setGender] = React.useState<Gender>(initial?.gender ?? "nu");
  const [parentId, setParentId] = React.useState<string>(initial?.parentId ?? "none");
  const [description, setDescription] = React.useState(initial?.description ?? "");
  const [iconImage, setIconImage] = React.useState(initial?.iconImage ?? "");
  const [heroImage, setHeroImage] = React.useState(initial?.heroImage ?? "");
  const [seoTitle, setSeoTitle] = React.useState(initial?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = React.useState(initial?.seoDescription ?? "");
  const [sortOrder, setSortOrder] = React.useState(initial?.sortOrder ?? 0);
  const [isActive, setIsActive] = React.useState(initial?.isActive ?? true);

  function onNameChange(v: string) {
    setName(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await saveCategoryAction(id ?? null, {
        name,
        slug,
        gender,
        parentId: parentId === "none" ? null : parentId,
        description,
        iconImage: iconImage || null,
        heroImage: heroImage || null,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        sortOrder,
        isActive,
      });
      if (!res.ok) {
        setError(res.error ?? "Lưu thất bại");
        return;
      }
      router.push("/admin/categories");
      router.refresh();
    });
  }

  const parentOptions = parents.filter((p) => p.gender === gender && p.id !== id);

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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Giới tính</Label>
          <Select value={gender} onValueChange={(v) => setGender(v as Gender)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GENDERS.map((g) => (
                <SelectItem key={g.value} value={g.value}>
                  {g.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Danh mục cha (để trống nếu là cấp 1)</Label>
          <Select value={parentId} onValueChange={setParentId}>
            <SelectTrigger>
              <SelectValue placeholder="Không có" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Không có (cấp 1)</SelectItem>
              {parentOptions.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

      <div className="grid gap-4 sm:grid-cols-2">
        <ImageField label="Ảnh icon" value={iconImage} onChange={setIconImage} />
        <ImageField label="Ảnh hero" value={heroImage} onChange={setHeroImage} />
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

      <div className="flex items-center gap-6">
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
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={isActive} onCheckedChange={setIsActive} />
          Hiển thị
        </label>
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

function ImageField({
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
            <Image src={value} alt="" fill sizes="64px" className="object-cover" />
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
              Gỡ ảnh
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
