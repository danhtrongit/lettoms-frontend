"use client";

import * as React from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  UploadIcon,
  Loader2Icon,
  CheckIcon,
  ImageUpIcon,
  SearchIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface MediaItem {
  id: string;
  url: string;
  filename: string;
  alt: string;
  width: number | null;
  height: number | null;
}

interface MediaPickerProps {
  /** Called with the chosen image url(s). */
  onSelect: (urls: string[]) => void;
  multiple?: boolean;
  trigger?: React.ReactNode;
  title?: string;
}

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif,image/gif";
const MAX_BYTES = 8 * 1024 * 1024;
const CONCURRENCY = 3;

interface PendingUpload {
  key: string;
  name: string;
  previewUrl: string;
  status: "uploading" | "error";
}

export function MediaPicker({
  onSelect,
  multiple = false,
  trigger,
  title = "Thư viện ảnh",
}: MediaPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<MediaItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [pending, setPending] = React.useState<PendingUpload[]>([]);
  const [dragDepth, setDragDepth] = React.useState(0);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const load = React.useCallback(async (q = "") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/media?search=${encodeURIComponent(q)}&limit=120`);
      if (res.ok) {
        const json = (await res.json()) as { data: MediaItem[] };
        setItems(json.data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => {
      setSelected(new Set());
      setDragDepth(0);
      load(search);
    }, 0);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function uploadOne(file: File): Promise<boolean> {
    const key = `${file.name}-${file.size}-${file.lastModified}`;
    const previewUrl = URL.createObjectURL(file);
    setPending((prev) => [...prev, { key, name: file.name, previewUrl, status: "uploading" }]);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/media", { method: "POST", body: fd });
      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as { error?: string } | null;
        toast.error(`${file.name}: ${json?.error ?? `lỗi ${res.status}`}`);
        return false;
      }
      return true;
    } catch {
      toast.error(`${file.name}: tải lên thất bại`);
      return false;
    } finally {
      setPending((prev) => prev.filter((p) => p.key !== key));
      URL.revokeObjectURL(previewUrl);
    }
  }

  async function handleUpload(fileList: FileList | File[] | null) {
    const all = Array.from(fileList ?? []);
    if (!all.length) return;

    // Client-side pre-checks so obviously-bad files fail fast with a reason.
    const files = all.filter((f) => {
      if (!ACCEPT.split(",").includes(f.type)) {
        toast.error(`${f.name}: định dạng không hỗ trợ`);
        return false;
      }
      if (f.size > MAX_BYTES) {
        toast.error(`${f.name}: vượt quá 8MB`);
        return false;
      }
      return true;
    });
    if (!files.length) return;

    // Parallel uploads with a small concurrency cap.
    let ok = 0;
    const queue = [...files];
    await Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
        for (let f = queue.shift(); f; f = queue.shift()) {
          if (await uploadOne(f)) ok += 1;
        }
      })
    );

    if (ok > 0) {
      toast.success(`Đã tải lên ${ok}/${files.length} ảnh`);
      await load(search);
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  function toggle(item: MediaItem) {
    setSelected((prev) => {
      const next = new Set(multiple ? prev : []);
      if (next.has(item.url)) next.delete(item.url);
      else next.add(item.url);
      return next;
    });
  }

  function confirm() {
    onSelect(Array.from(selected));
    setOpen(false);
  }

  const dragging = dragDepth > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button type="button" variant="outline" size="sm">
            Chọn ảnh
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        className="flex max-h-[88vh] flex-col gap-3 sm:max-w-5xl"
        onDragEnter={(e) => {
          e.preventDefault();
          if (e.dataTransfer.types.includes("Files")) setDragDepth((d) => d + 1);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragDepth((d) => Math.max(0, d - 1));
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          setDragDepth(0);
          handleUpload(e.dataTransfer.files);
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Tìm theo tên tệp..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load(search)}
            />
          </div>
          <Button type="button" variant="outline" onClick={() => load(search)}>
            Tìm
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPT}
            multiple
            hidden
            onChange={(e) => handleUpload(e.target.files)}
          />
          <Button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={pending.length > 0}
          >
            {pending.length > 0 ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <UploadIcon className="size-4" />
            )}
            Tải lên
          </Button>
        </div>

        <div className="relative min-h-[40vh] flex-1 overflow-y-auto rounded-md border bg-muted/20 p-3">
          {dragging && (
            <div className="absolute inset-0 z-10 grid place-items-center rounded-md border-2 border-dashed border-primary bg-primary/5">
              <div className="flex flex-col items-center gap-2 text-primary">
                <ImageUpIcon className="size-10" />
                <p className="text-sm font-medium">Thả ảnh vào đây để tải lên</p>
              </div>
            </div>
          )}

          {loading && pending.length === 0 ? (
            <div className="grid place-items-center py-20 text-muted-foreground">
              <Loader2Icon className="size-6 animate-spin" />
            </div>
          ) : items.length === 0 && pending.length === 0 ? (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="grid w-full place-items-center gap-2 py-20 text-muted-foreground"
            >
              <ImageUpIcon className="size-10" />
              <span className="text-sm">
                Chưa có ảnh nào — bấm để chọn hoặc kéo thả ảnh vào đây
              </span>
            </button>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {pending.map((p) => (
                <div
                  key={p.key}
                  className="relative aspect-square overflow-hidden rounded-md border bg-muted"
                  title={p.name}
                >
                  {/* Blob preview while the real upload is in flight. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.previewUrl}
                    alt={p.name}
                    className="size-full object-cover opacity-50"
                  />
                  <span className="absolute inset-0 grid place-items-center bg-black/30">
                    <Loader2Icon className="size-5 animate-spin text-white" />
                  </span>
                </div>
              ))}
              {items.map((item) => {
                const isSel = selected.has(item.url);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggle(item)}
                    title={item.filename}
                    className={cn(
                      "group relative aspect-square overflow-hidden rounded-md border bg-muted",
                      isSel && "ring-2 ring-primary ring-offset-2"
                    )}
                  >
                    <Image
                      src={item.url}
                      alt={item.alt || item.filename}
                      fill
                      sizes="160px"
                      className="object-cover"
                    />
                    <span className="absolute inset-x-0 bottom-0 truncate bg-black/50 px-1.5 py-0.5 text-left text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                      {item.filename}
                    </span>
                    {isSel && (
                      <span className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground">
                        <CheckIcon className="size-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            Kéo thả để tải lên nhiều ảnh • JPEG, PNG, WebP, AVIF, GIF • tối đa 8MB/ảnh
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="button" onClick={confirm} disabled={selected.size === 0}>
              Chọn {selected.size > 0 ? `(${selected.size})` : ""}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
