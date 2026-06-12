"use client";

import * as React from "react";
import Image from "next/image";
import { ImageIcon, XIcon } from "lucide-react";
import type { CustomField } from "@puckeditor/core";
import { MediaPicker } from "@/components/admin/media-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Puck custom-field UI for picking an image from the media library
 * (or pasting a URL directly). Value is the image URL string.
 */
export function ImageFieldUi({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-muted">
          <Image src={value} alt="" fill sizes="300px" className="object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/60 text-white"
            title="Xóa ảnh"
          >
            <XIcon className="size-3.5" />
          </button>
        </div>
      ) : null}
      <div className="flex gap-2">
        <MediaPicker
          trigger={
            <Button type="button" variant="outline" size="sm" className="gap-1.5">
              <ImageIcon className="size-3.5" /> Chọn ảnh
            </Button>
          }
          onSelect={(urls) => urls[0] && onChange(urls[0])}
        />
        <Input
          value={value ?? ""}
          onChange={(e) => onChange(e.currentTarget.value)}
          placeholder="hoặc dán URL ảnh"
          className="h-8 text-xs"
        />
      </div>
    </div>
  );
}

/** Reusable Puck field config typed as CustomField<string> */
export const imageField = (label: string): CustomField<string> => ({
  type: "custom",
  label,
  render: ({ value, onChange }) => (
    <ImageFieldUi value={value} onChange={onChange} />
  ),
});
