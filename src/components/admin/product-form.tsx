"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { XIcon } from "lucide-react";
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
import type { JSONContent } from "@tiptap/core";
import { slugify, formatVND } from "@/lib/format";
import { saveProductAction } from "@/server/actions/catalog";
import type { Gender, ProductFlag } from "@/types";

export interface ColorOption {
  code: string;
  name: string;
  hex: string;
}
export interface SizeOption {
  code: string;
  label: string;
}
export interface CategoryOption {
  id: string;
  name: string;
  gender: string;
  parentId: string | null;
}

interface VariantState {
  colorCode: string;
  sizeCode: string;
  sku: string;
  price: number;
  stock: number;
  image: string | null;
  isActive: boolean;
}

interface ImageState {
  src: string;
  alt: string;
  colorCode: string | null;
}

interface ProductFormProps {
  id?: string;
  colors: ColorOption[];
  sizes: SizeOption[];
  categories: CategoryOption[];
  initial?: {
    name: string;
    slug: string;
    gender: Gender;
    categoryId: string | null;
    subcategoryId: string | null;
    descriptionJson: JSONContent | null;
    materialsJson: JSONContent | null;
    careJson: JSONContent | null;
    basePrice: number;
    originalPrice: number | null;
    flags: string[];
    thumbnail: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
    colorCodes: string[];
    sizeCodes: string[];
    images: ImageState[];
    variants: VariantState[];
  };
}

const GENDERS: { value: Gender; label: string }[] = [
  { value: "nu", label: "Nữ" },
  { value: "nam", label: "Nam" },
  { value: "tre-em", label: "Trẻ Em" },
  { value: "em-be", label: "Em Bé" },
];

const FLAGS: { value: ProductFlag; label: string }[] = [
  { value: "new", label: "Mới" },
  { value: "sale", label: "Giảm giá" },
  { value: "limited", label: "Giới hạn" },
  { value: "online-only", label: "Chỉ online" },
  { value: "bestseller", label: "Bán chạy" },
];

export function ProductForm({ id, colors, sizes, categories, initial }: ProductFormProps) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  const [name, setName] = React.useState(initial?.name ?? "");
  const [slug, setSlug] = React.useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = React.useState(Boolean(id));
  const [gender, setGender] = React.useState<Gender>(initial?.gender ?? "nu");
  const [categoryId, setCategoryId] = React.useState(initial?.categoryId ?? "none");
  const [subcategoryId, setSubcategoryId] = React.useState(initial?.subcategoryId ?? "none");
  const [descriptionJson, setDescriptionJson] = React.useState<JSONContent | null>(
    initial?.descriptionJson ?? null
  );
  const [materialsJson, setMaterialsJson] = React.useState<JSONContent | null>(
    initial?.materialsJson ?? null
  );
  const [careJson, setCareJson] = React.useState<JSONContent | null>(
    initial?.careJson ?? null
  );
  const [basePrice, setBasePrice] = React.useState(initial?.basePrice ?? 0);
  const [originalPrice, setOriginalPrice] = React.useState(initial?.originalPrice ?? 0);
  const [flags, setFlags] = React.useState<string[]>(initial?.flags ?? []);
  const [thumbnail, setThumbnail] = React.useState(initial?.thumbnail ?? "");
  const [seoTitle, setSeoTitle] = React.useState(initial?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = React.useState(initial?.seoDescription ?? "");
  const [isActive, setIsActive] = React.useState(true);

  const [colorCodes, setColorCodes] = React.useState<string[]>(initial?.colorCodes ?? []);
  const [sizeCodes, setSizeCodes] = React.useState<string[]>(initial?.sizeCodes ?? []);
  const [images, setImages] = React.useState<ImageState[]>(initial?.images ?? []);
  const [variants, setVariants] = React.useState<VariantState[]>(initial?.variants ?? []);

  function onNameChange(v: string) {
    setName(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  function toggleFlag(f: string) {
    setFlags((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));
  }

  function toggleColor(code: string) {
    setColorCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  }
  function toggleSize(code: string) {
    setSizeCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  }

  /** Build the variant matrix from selected colors × sizes, preserving existing rows. */
  function regenerateVariants() {
    const existing = new Map(variants.map((v) => [`${v.colorCode}-${v.sizeCode}`, v]));
    const next: VariantState[] = [];
    for (const c of colorCodes) {
      for (const s of sizeCodes) {
        const key = `${c}-${s}`;
        const prev = existing.get(key);
        next.push(
          prev ?? {
            colorCode: c,
            sizeCode: s,
            sku: `${slug || "sp"}-${c}-${s}`.toUpperCase(),
            price: basePrice,
            stock: 0,
            image: null,
            isActive: true,
          }
        );
      }
    }
    setVariants(next);
  }

  function updateVariant(idx: number, patch: Partial<VariantState>) {
    setVariants((prev) => prev.map((v, i) => (i === idx ? { ...v, ...patch } : v)));
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await saveProductAction(id ?? null, {
        name,
        slug,
        gender,
        categoryId: categoryId === "none" ? null : categoryId,
        subcategoryId: subcategoryId === "none" ? null : subcategoryId,
        description: "",
        materials: "",
        care: "",
        descriptionJson,
        materialsJson,
        careJson,
        basePrice,
        originalPrice: originalPrice > 0 ? originalPrice : null,
        flags,
        thumbnail: thumbnail || null,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        isActive,
        colorCodes,
        sizeCodes,
        images,
        variants,
      });
      if (!res.ok) {
        setError(res.error ?? "Lưu thất bại");
        return;
      }
      router.push("/admin/products");
      router.refresh();
    });
  }

  const parentCats = categories.filter((c) => c.gender === gender && !c.parentId);
  const subCats = categories.filter(
    (c) => c.gender === gender && c.parentId === (categoryId === "none" ? null : categoryId)
  );
  const colorName = (code: string) => colors.find((c) => c.code === code)?.name ?? code;
  const sizeLabel = (code: string) => sizes.find((s) => s.code === code)?.label ?? code;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Basic info */}
      <section className="space-y-4 rounded-lg border bg-background p-5">
        <h2 className="font-semibold">Thông tin cơ bản</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Tên sản phẩm</Label>
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

        <div className="grid gap-4 sm:grid-cols-3">
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
            <Label>Danh mục</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— Không —</SelectItem>
                {parentCats.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Danh mục con</Label>
            <Select value={subcategoryId} onValueChange={setSubcategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— Không —</SelectItem>
                {subCats.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="basePrice">Giá bán (VND)</Label>
            <Input
              id="basePrice"
              type="number"
              value={basePrice}
              onChange={(e) => setBasePrice(Number(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="originalPrice">Giá gốc (để 0 nếu không giảm)</Label>
            <Input
              id="originalPrice"
              type="number"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Nhãn</Label>
          <div className="flex flex-wrap gap-2">
            {FLAGS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => toggleFlag(f.value)}
                className={
                  flags.includes(f.value)
                    ? "rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground"
                    : "rounded-full border px-3 py-1 text-xs text-muted-foreground"
                }
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <Switch checked={isActive} onCheckedChange={setIsActive} />
          Hiển thị sản phẩm
        </label>
      </section>

      {/* Description */}
      <section className="space-y-4 rounded-lg border bg-background p-5">
        <h2 className="font-semibold">Mô tả & chất liệu</h2>
        <div className="space-y-1.5">
          <Label>Mô tả</Label>
          <RichTextEditor
            value={descriptionJson}
            onChange={setDescriptionJson}
            placeholder="Mô tả sản phẩm..."
          />
        </div>
        <div className="space-y-1.5">
          <Label>Chất liệu</Label>
          <RichTextEditor
            value={materialsJson}
            onChange={setMaterialsJson}
            placeholder="Chất liệu sản phẩm..."
          />
        </div>
        <div className="space-y-1.5">
          <Label>Hướng dẫn bảo quản</Label>
          <RichTextEditor
            value={careJson}
            onChange={setCareJson}
            placeholder="Hướng dẫn bảo quản..."
          />
        </div>
      </section>

      {/* Colors & sizes */}
      <section className="space-y-4 rounded-lg border bg-background p-5">
        <h2 className="font-semibold">Màu & Kích cỡ</h2>
        <div className="space-y-2">
          <Label>Màu sắc</Label>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => toggleColor(c.code)}
                className={
                  colorCodes.includes(c.code)
                    ? "flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground"
                    : "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs"
                }
              >
                <span
                  className="size-3 rounded-full border"
                  style={{ backgroundColor: c.hex }}
                />
                {c.name}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label>Kích cỡ</Label>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s.code}
                type="button"
                onClick={() => toggleSize(s.code)}
                className={
                  sizeCodes.includes(s.code)
                    ? "rounded-md bg-primary px-3 py-1 text-xs text-primary-foreground"
                    : "rounded-md border px-3 py-1 text-xs"
                }
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={regenerateVariants}
          disabled={!colorCodes.length || !sizeCodes.length}
        >
          Tạo {colorCodes.length * sizeCodes.length} biến thể (SKU)
        </Button>
      </section>

      {/* Variant manager */}
      {variants.length > 0 && (
        <section className="space-y-4 rounded-lg border bg-background p-5">
          <h2 className="font-semibold">Biến thể / Tồn kho ({variants.length} SKU)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr>
                  <th className="py-2 pr-3 font-medium">Màu</th>
                  <th className="py-2 pr-3 font-medium">Cỡ</th>
                  <th className="py-2 pr-3 font-medium">Ảnh</th>
                  <th className="py-2 pr-3 font-medium">SKU</th>
                  <th className="py-2 pr-3 font-medium">Giá</th>
                  <th className="py-2 pr-3 font-medium">Tồn</th>
                  <th className="py-2 font-medium">Bán</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((v, i) => (
                  <tr key={`${v.colorCode}-${v.sizeCode}`} className="border-t">
                    <td className="py-1.5 pr-3">{colorName(v.colorCode)}</td>
                    <td className="py-1.5 pr-3">{sizeLabel(v.sizeCode)}</td>
                    <td className="py-1.5 pr-3">
                      <div className="flex items-center gap-1">
                        {v.image && (
                          <span className="relative size-8 overflow-hidden rounded border bg-muted">
                            <Image src={v.image} alt="" fill sizes="32px" className="object-cover" />
                          </span>
                        )}
                        <MediaPicker
                          trigger={
                            <button
                              type="button"
                              className="rounded border px-2 py-1 text-xs text-muted-foreground hover:border-primary"
                            >
                              {v.image ? "Đổi" : "Ảnh"}
                            </button>
                          }
                          onSelect={(urls) => updateVariant(i, { image: urls[0] ?? null })}
                        />
                      </div>
                    </td>
                    <td className="py-1.5 pr-3">
                      <Input
                        className="h-8 w-40"
                        value={v.sku}
                        onChange={(e) => updateVariant(i, { sku: e.target.value })}
                      />
                    </td>
                    <td className="py-1.5 pr-3">
                      <Input
                        className="h-8 w-28"
                        type="number"
                        value={v.price}
                        onChange={(e) => updateVariant(i, { price: Number(e.target.value) })}
                      />
                    </td>
                    <td className="py-1.5 pr-3">
                      <Input
                        className="h-8 w-20"
                        type="number"
                        value={v.stock}
                        onChange={(e) => updateVariant(i, { stock: Number(e.target.value) })}
                      />
                    </td>
                    <td className="py-1.5">
                      <Switch
                        checked={v.isActive}
                        onCheckedChange={(c) => updateVariant(i, { isActive: c })}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Images */}
      <section className="space-y-4 rounded-lg border bg-background p-5">
        <h2 className="font-semibold">Hình ảnh</h2>
        <div className="space-y-2">
          <Label>Ảnh đại diện (thumbnail)</Label>
          <div className="flex items-center gap-3">
            {thumbnail ? (
              <div className="relative size-20 overflow-hidden rounded-md border bg-muted">
                <Image src={thumbnail} alt="" fill sizes="80px" className="object-cover" />
              </div>
            ) : (
              <div className="grid size-20 place-items-center rounded-md border bg-muted text-xs text-muted-foreground">
                Trống
              </div>
            )}
            <MediaPicker onSelect={(urls) => setThumbnail(urls[0] ?? "")} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Thư viện ảnh</Label>
          <div className="flex flex-wrap gap-3">
            {images.map((img, i) => (
              <div
                key={img.src + i}
                className="relative size-20 overflow-hidden rounded-md border bg-muted"
              >
                <Image src={img.src} alt={img.alt} fill sizes="80px" className="object-cover" />
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                  className="absolute right-0.5 top-0.5 grid size-5 place-items-center rounded-full bg-background/90 text-destructive"
                >
                  <XIcon className="size-3" />
                </button>
              </div>
            ))}
            <MediaPicker
              multiple
              trigger={
                <button
                  type="button"
                  className="grid size-20 place-items-center rounded-md border border-dashed text-xs text-muted-foreground hover:border-primary"
                >
                  + Thêm
                </button>
              }
              onSelect={(urls) =>
                setImages((prev) => [
                  ...prev,
                  ...urls.map((src) => ({ src, alt: name, colorCode: null })),
                ])
              }
            />
          </div>
        </div>
      </section>

      {/* SEO */}
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
          {pending ? "Đang lưu..." : "Lưu sản phẩm"}
        </Button>
        <Button variant="ghost" onClick={() => router.back()}>
          Hủy
        </Button>
        {basePrice > 0 && (
          <span className="ml-auto self-center text-sm text-muted-foreground">
            Giá: {formatVND(basePrice)}
          </span>
        )}
      </div>
    </div>
  );
}
