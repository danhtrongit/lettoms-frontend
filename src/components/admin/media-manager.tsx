"use client";

import * as React from "react";
import Image from "next/image";
import { UploadIcon, Loader2Icon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  alt: string;
  title: string;
  mime: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
}

export function MediaManager() {
  const [items, setItems] = React.useState<MediaItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [uploading, setUploading] = React.useState(false);
  const [search, setSearch] = React.useState("");
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
    const id = window.setTimeout(() => load(), 0);
    return () => window.clearTimeout(id);
  }, [load]);

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

  async function remove(id: string) {
    if (!confirm("Xóa ảnh này? Thao tác không thể hoàn tác.")) return;
    await fetch(`/api/media/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Tìm theo tên tệp..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load(search)}
          className="max-w-xs"
        />
        <Button type="button" variant="outline" onClick={() => load(search)}>
          Tìm
        </Button>
        <div className="flex-1" />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => handleUpload(e.target.files)}
        />
        <Button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <UploadIcon className="size-4" />
          )}
          Tải ảnh lên
        </Button>
      </div>

      {loading ? (
        <div className="grid place-items-center py-20 text-muted-foreground">
          <Loader2Icon className="size-6 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <p className="py-20 text-center text-sm text-muted-foreground">
          Chưa có ảnh nào. Hãy tải lên ảnh đầu tiên.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {items.map((item) => (
            <div
              key={item.id}
              className="group overflow-hidden rounded-lg border bg-background"
            >
              <div className="relative aspect-square bg-muted">
                <Image
                  src={item.url}
                  alt={item.alt || item.filename}
                  fill
                  sizes="200px"
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-background/90 text-destructive opacity-0 shadow transition-opacity group-hover:opacity-100"
                  aria-label="Xóa ảnh"
                >
                  <Trash2Icon className="size-4" />
                </button>
              </div>
              <div className="p-2">
                <p className="truncate text-xs font-medium" title={item.filename}>
                  {item.filename}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {item.width && item.height ? `${item.width}×${item.height} · ` : ""}
                  {(item.sizeBytes / 1024).toFixed(0)} KB
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
