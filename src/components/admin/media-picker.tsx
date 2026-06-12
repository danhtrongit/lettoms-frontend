"use client";

import * as React from "react";
import Image from "next/image";
import { UploadIcon, Loader2Icon, CheckIcon } from "lucide-react";
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

export function MediaPicker({
  onSelect,
  multiple = false,
  trigger,
  title = "Chọn ảnh từ thư viện",
}: MediaPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<MediaItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const fileRef = React.useRef<HTMLInputElement>(null);

  const load = React.useCallback(async (q = "") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/media?search=${encodeURIComponent(q)}&limit=80`);
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
      load(search);
    }, 0);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function handleUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        await fetch("/api/media", { method: "POST", body: fd });
      }
      await load(search);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button type="button" variant="outline" size="sm">
            Chọn ảnh
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <Input
            placeholder="Tìm theo tên tệp..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load(search)}
          />
          <Button type="button" variant="outline" onClick={() => load(search)}>
            Tìm
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => handleUpload(e.target.files)}
          />
          <Button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <UploadIcon className="size-4" />
            )}
            Tải lên
          </Button>
        </div>

        <div className="max-h-[55vh] overflow-y-auto">
          {loading ? (
            <div className="grid place-items-center py-16 text-muted-foreground">
              <Loader2Icon className="size-6 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              Chưa có ảnh nào. Hãy tải lên ảnh đầu tiên.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {items.map((item) => {
                const isSel = selected.has(item.url);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggle(item)}
                    className={cn(
                      "group relative aspect-square overflow-hidden rounded-md border bg-muted",
                      isSel && "ring-2 ring-primary ring-offset-2"
                    )}
                  >
                    <Image
                      src={item.url}
                      alt={item.alt || item.filename}
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
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

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Hủy
          </Button>
          <Button type="button" onClick={confirm} disabled={selected.size === 0}>
            Chọn {selected.size > 0 ? `(${selected.size})` : ""}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
