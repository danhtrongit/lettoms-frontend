"use client";

import * as React from "react";
import Image from "next/image";
import {
  TypeIcon,
  PilcrowIcon,
  ImageIcon,
  QuoteIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  Trash2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MediaPicker } from "@/components/admin/media-picker";

export type ArticleBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "quote"; text: string; cite?: string };

interface BodyBuilderProps {
  value: ArticleBlock[];
  onChange: (blocks: ArticleBlock[]) => void;
}

export function ArticleBodyBuilder({ value, onChange }: BodyBuilderProps) {
  function add(type: ArticleBlock["type"]) {
    const block: ArticleBlock =
      type === "image"
        ? { type: "image", src: "", alt: "" }
        : type === "quote"
          ? { type: "quote", text: "" }
          : type === "heading"
            ? { type: "heading", text: "" }
            : { type: "paragraph", text: "" };
    onChange([...value, block]);
  }

  function update(idx: number, patch: Partial<ArticleBlock>) {
    onChange(
      value.map((b, i) => (i === idx ? ({ ...b, ...patch } as ArticleBlock) : b))
    );
  }

  function remove(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  function move(idx: number, dir: -1 | 1) {
    const next = [...value];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {value.map((block, idx) => (
          <div key={idx} className="rounded-lg border bg-background p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium uppercase text-muted-foreground">
                {block.type === "heading"
                  ? "Tiêu đề"
                  : block.type === "paragraph"
                    ? "Đoạn văn"
                    : block.type === "image"
                      ? "Hình ảnh"
                      : "Trích dẫn"}
              </span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => move(idx, -1)} className="p-1 text-muted-foreground hover:text-foreground">
                  <ArrowUpIcon className="size-4" />
                </button>
                <button type="button" onClick={() => move(idx, 1)} className="p-1 text-muted-foreground hover:text-foreground">
                  <ArrowDownIcon className="size-4" />
                </button>
                <button type="button" onClick={() => remove(idx)} className="p-1 text-destructive">
                  <Trash2Icon className="size-4" />
                </button>
              </div>
            </div>

            {block.type === "heading" && (
              <Input
                placeholder="Nhập tiêu đề..."
                value={block.text}
                onChange={(e) => update(idx, { text: e.target.value })}
              />
            )}
            {block.type === "paragraph" && (
              <Textarea
                rows={3}
                placeholder="Nhập nội dung đoạn văn..."
                value={block.text}
                onChange={(e) => update(idx, { text: e.target.value })}
              />
            )}
            {block.type === "quote" && (
              <div className="space-y-2">
                <Textarea
                  rows={2}
                  placeholder="Nội dung trích dẫn..."
                  value={block.text}
                  onChange={(e) => update(idx, { text: e.target.value })}
                />
                <Input
                  placeholder="Nguồn (tùy chọn)"
                  value={block.cite ?? ""}
                  onChange={(e) => update(idx, { cite: e.target.value })}
                />
              </div>
            )}
            {block.type === "image" && (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  {block.src ? (
                    <div className="relative h-24 w-32 overflow-hidden rounded-md border bg-muted">
                      <Image src={block.src} alt={block.alt} fill sizes="128px" className="object-cover" />
                    </div>
                  ) : (
                    <div className="grid h-24 w-32 place-items-center rounded-md border bg-muted text-xs text-muted-foreground">
                      Chưa có ảnh
                    </div>
                  )}
                  <MediaPicker onSelect={(urls) => update(idx, { src: urls[0] ?? "" })} />
                </div>
                <Input
                  placeholder="Alt text"
                  value={block.alt}
                  onChange={(e) => update(idx, { alt: e.target.value })}
                />
                <Input
                  placeholder="Chú thích (tùy chọn)"
                  value={block.caption ?? ""}
                  onChange={(e) => update(idx, { caption: e.target.value })}
                />
              </div>
            )}
          </div>
        ))}
        {value.length === 0 && (
          <p className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
            Chưa có nội dung. Thêm khối đầu tiên bên dưới.
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => add("heading")}>
          <TypeIcon className="size-4" /> Tiêu đề
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => add("paragraph")}>
          <PilcrowIcon className="size-4" /> Đoạn văn
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => add("image")}>
          <ImageIcon className="size-4" /> Hình ảnh
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => add("quote")}>
          <QuoteIcon className="size-4" /> Trích dẫn
        </Button>
      </div>
    </div>
  );
}
