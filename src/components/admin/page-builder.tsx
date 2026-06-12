"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVerticalIcon,
  Trash2Icon,
  PlusIcon,
  ChevronDownIcon,
} from "lucide-react";
import { nanoid } from "nanoid";
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
import { slugify } from "@/lib/format";
import {
  WIDGETS,
  WIDGET_CATEGORIES,
  getWidgetDef,
  type WidgetField,
} from "@/lib/cms/widgets";
import { savePageAction } from "@/server/actions/pages";

interface Block {
  id: string;
  type: string;
  props: Record<string, unknown>;
}

interface PageBuilderProps {
  id?: string;
  initial?: {
    title: string;
    slug: string;
    status: "draft" | "published";
    blocks: Block[];
    seoTitle: string | null;
    seoDescription: string | null;
  };
}

export function PageBuilder({ id, initial }: PageBuilderProps) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  const [title, setTitle] = React.useState(initial?.title ?? "");
  const [slug, setSlug] = React.useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = React.useState(Boolean(id));
  const [status, setStatus] = React.useState<"draft" | "published">(
    initial?.status ?? "draft"
  );
  const [blocks, setBlocks] = React.useState<Block[]>(initial?.blocks ?? []);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [seoTitle, setSeoTitle] = React.useState(initial?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = React.useState(
    initial?.seoDescription ?? ""
  );

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function onTitleChange(v: string) {
    setTitle(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  function addWidget(type: string) {
    const def = getWidgetDef(type);
    if (!def) return;
    const block: Block = {
      id: nanoid(),
      type,
      props: { ...def.defaultProps },
    };
    setBlocks((prev) => [...prev, block]);
    setSelectedId(block.id);
  }

  function removeBlock(blockId: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
    if (selectedId === blockId) setSelectedId(null);
  }

  function updateProps(blockId: string, key: string, value: unknown) {
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId ? { ...b, props: { ...b.props, [key]: value } } : b
      )
    );
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setBlocks((prev) => {
      const oldIndex = prev.findIndex((b) => b.id === active.id);
      const newIndex = prev.findIndex((b) => b.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await savePageAction(id ?? null, {
        title,
        slug,
        status,
        blocks,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
      });
      if (!res.ok) {
        setError(res.error ?? "Lưu thất bại");
        return;
      }
      toast.success("Đã lưu trang");
      router.push("/admin/pages");
      router.refresh();
    });
  }

  const selected = blocks.find((b) => b.id === selectedId);
  const selectedDef = selected ? getWidgetDef(selected.type) : undefined;

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-background p-4">
        <div className="space-y-1.5">
          <Label htmlFor="title">Tên trang</Label>
          <Input
            id="title"
            className="w-56"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug (/trang/...)</Label>
          <Input
            id="slug"
            className="w-48"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Trạng thái</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as "draft" | "published")}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Nháp</SelectItem>
              <SelectItem value="published">Xuất bản</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="ml-auto flex gap-2">
          <Button onClick={submit} disabled={pending}>
            {pending ? "Đang lưu..." : "Lưu trang"}
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid gap-5 lg:grid-cols-[200px_1fr_300px]">
        {/* Palette */}
        <div className="space-y-3 rounded-lg border bg-background p-3">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Widget</p>
          {WIDGET_CATEGORIES.map((cat) => {
            const items = WIDGETS.filter((w) => w.category === cat.key);
            if (!items.length) return null;
            return (
              <div key={cat.key} className="space-y-1.5">
                <p className="text-[11px] font-medium text-muted-foreground/80">{cat.label}</p>
                {items.map((w) => (
                  <button
                    key={w.type}
                    type="button"
                    onClick={() => addWidget(w.type)}
                    className="flex w-full items-center gap-2 rounded-md border px-2.5 py-1.5 text-left text-sm hover:border-primary"
                  >
                    <PlusIcon className="size-3.5 shrink-0" />
                    {w.label}
                  </button>
                ))}
              </div>
            );
          })}
        </div>

        {/* Canvas */}
        <div className="min-h-[400px] rounded-lg border bg-muted/20 p-3">
          {blocks.length === 0 ? (
            <p className="grid h-full place-items-center py-20 text-center text-sm text-muted-foreground">
              Thêm widget từ cột trái để bắt đầu.
            </p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {blocks.map((b) => (
                    <SortableBlock
                      key={b.id}
                      block={b}
                      selected={b.id === selectedId}
                      onSelect={() => setSelectedId(b.id)}
                      onRemove={() => removeBlock(b.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Inspector */}
        <div className="rounded-lg border bg-background p-3">
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            Thuộc tính
          </p>
          {selected && selectedDef ? (
            <div className="mt-3 space-y-3">
              {selectedDef.fields.map((field) => (
                <FieldEditor
                  key={field.key}
                  field={field}
                  value={selected.props[field.key]}
                  onChange={(v) => updateProps(selected.id, field.key, v)}
                />
              ))}
              {selected.type === "columns" && (
                <ColumnsEditor
                  block={selected}
                  onChange={(cols) => updateProps(selected.id, "columns", cols)}
                />
              )}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Chọn một widget để chỉnh sửa.
            </p>
          )}

          <div className="mt-6 space-y-3 border-t pt-4">
            <p className="text-xs font-semibold uppercase text-muted-foreground">SEO</p>
            <div className="space-y-1.5">
              <Label htmlFor="seoTitle">Tiêu đề SEO</Label>
              <Input
                id="seoTitle"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="seoDesc">Mô tả SEO</Label>
              <Textarea
                id="seoDesc"
                rows={2}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SortableBlock({
  block,
  selected,
  onSelect,
  onRemove,
}: {
  block: Block;
  selected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: block.id,
  });
  const def = getWidgetDef(block.type);
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`flex items-center gap-3 rounded-md border bg-background p-3 ${
        selected ? "ring-2 ring-primary" : ""
      }`}
    >
      <button
        type="button"
        className="cursor-grab text-muted-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVerticalIcon className="size-4" />
      </button>
      <div className="flex-1">
        <p className="text-sm font-medium">{def?.label ?? block.type}</p>
        <p className="text-xs text-muted-foreground">{def?.description}</p>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="text-destructive"
      >
        <Trash2Icon className="size-4" />
      </button>
    </div>
  );
}

function FieldEditor({
  field,
  value,
  onChange,
}: {
  field: WidgetField;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const str = typeof value === "string" ? value : "";
  const numv = typeof value === "number" ? value : 0;

  return (
    <div className="space-y-1.5">
      <Label>{field.label}</Label>
      {field.type === "text" && (
        <Input value={str} onChange={(e) => onChange(e.target.value)} />
      )}
      {field.type === "textarea" && (
        <Textarea rows={3} value={str} onChange={(e) => onChange(e.target.value)} />
      )}
      {field.type === "richtext" && (
        <RichTextEditor
          value={(value as JSONContent | null) ?? null}
          onChange={(json) => onChange(json)}
          placeholder="Nhập nội dung..."
        />
      )}
      {field.type === "number" && (
        <Input
          type="number"
          value={numv}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      )}
      {field.type === "boolean" && (
        <Switch checked={Boolean(value)} onCheckedChange={onChange} />
      )}
      {field.type === "color" && (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={str || "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="size-9 cursor-pointer rounded border"
          />
          <Input value={str} onChange={(e) => onChange(e.target.value)} className="flex-1" />
        </div>
      )}
      {field.type === "list" && (
        <Textarea
          rows={4}
          value={Array.isArray(value) ? listToText(value) : str}
          onChange={(e) => onChange(textToList(e.target.value))}
          placeholder="Mỗi dòng một mục"
        />
      )}
      {field.type === "select" && (
        <Select value={str} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {field.type === "image" && (
        <div className="flex items-center gap-2">
          {str && (
            <span className="truncate text-xs text-muted-foreground">{str}</span>
          )}
          <MediaPicker onSelect={(urls) => onChange(urls[0] ?? "")} />
        </div>
      )}
    </div>
  );
}

/** List fields store either string[] (gallery/logos) or {q,a}[] (FAQ). */
function listToText(items: unknown[]): string {
  return items
    .map((it) => {
      if (typeof it === "string") return it;
      if (it && typeof it === "object" && "q" in it) {
        const o = it as { q?: string; a?: string };
        return `${o.q ?? ""} | ${o.a ?? ""}`;
      }
      return String(it);
    })
    .join("\n");
}

function textToList(text: string): unknown[] {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  // If any line uses the "q | a" format, treat the whole list as FAQ items.
  if (lines.some((l) => l.includes("|"))) {
    return lines.map((l) => {
      const [q, a] = l.split("|");
      return { q: (q ?? "").trim(), a: (a ?? "").trim() };
    });
  }
  return lines;
}

/**
 * Editor for the nested `columns` widget. Manages child widgets per column.
 * Children cannot themselves be containers (one level of nesting only).
 */
function ColumnsEditor({
  block,
  onChange,
}: {
  block: Block;
  onChange: (cols: Block[][]) => void;
}) {
  const count =
    typeof block.props.count === "number"
      ? block.props.count
      : Number(block.props.count) || 2;
  const cols: Block[][] = Array.isArray(block.props.columns)
    ? (block.props.columns as Block[][])
    : [];

  // Ensure the columns array length matches the selected count.
  const normalized: Block[][] = Array.from({ length: count }).map(
    (_, i) => cols[i] ?? []
  );

  const childWidgets = WIDGETS.filter((w) => !w.container);

  function addChild(colIdx: number, type: string) {
    const def = getWidgetDef(type);
    if (!def) return;
    const next = normalized.map((c) => [...c]);
    next[colIdx].push({ id: nanoid(), type, props: { ...def.defaultProps } });
    onChange(next);
  }

  function removeChild(colIdx: number, childId: string) {
    onChange(normalized.map((c, i) => (i === colIdx ? c.filter((b) => b.id !== childId) : c)));
  }

  function updateChild(colIdx: number, childId: string, key: string, value: unknown) {
    onChange(
      normalized.map((c, i) =>
        i === colIdx
          ? c.map((b) => (b.id === childId ? { ...b, props: { ...b.props, [key]: value } } : b))
          : c
      )
    );
  }

  return (
    <div className="space-y-3 border-t pt-3">
      <p className="text-[11px] font-medium uppercase text-muted-foreground">
        Nội dung các cột
      </p>
      {normalized.map((col, colIdx) => (
        <div key={colIdx} className="space-y-2 rounded-md border bg-muted/20 p-2">
          <p className="text-xs font-semibold">Cột {colIdx + 1}</p>
          {col.map((child) => (
            <ColumnChild
              key={child.id}
              child={child}
              onRemove={() => removeChild(colIdx, child.id)}
              onChange={(key, v) => updateChild(colIdx, child.id, key, v)}
            />
          ))}
          <Select value="" onValueChange={(type) => addChild(colIdx, type)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="+ Thêm widget vào cột" />
            </SelectTrigger>
            <SelectContent>
              {childWidgets.map((w) => (
                <SelectItem key={w.type} value={w.type}>
                  {w.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  );
}

function ColumnChild({
  child,
  onRemove,
  onChange,
}: {
  child: Block;
  onRemove: () => void;
  onChange: (key: string, value: unknown) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const def = getWidgetDef(child.type);
  return (
    <div className="rounded border bg-background">
      <div className="flex items-center justify-between gap-2 px-2 py-1.5">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex flex-1 items-center gap-1.5 text-left text-xs font-medium"
        >
          <ChevronDownIcon className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
          {def?.label ?? child.type}
        </button>
        <button type="button" onClick={onRemove} className="text-destructive">
          <Trash2Icon className="size-3.5" />
        </button>
      </div>
      {open && def && (
        <div className="space-y-2 border-t p-2">
          {def.fields.map((field) => (
            <FieldEditor
              key={field.key}
              field={field}
              value={child.props[field.key]}
              onChange={(v) => onChange(field.key, v)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

