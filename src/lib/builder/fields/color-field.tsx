"use client";

import type { CustomField } from "@puckeditor/core";

/** Reusable Puck field config for picking a color. Value is a CSS color string. */
export const colorField = (label: string): CustomField<string> => ({
  type: "custom",
  label,
  render: ({
    value,
    onChange,
  }: {
    value: string | undefined;
    onChange: (v: string) => void;
  }) => (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value || "#ffffff"}
        onChange={(e) => onChange(e.currentTarget.value)}
        className="size-8 cursor-pointer rounded border"
      />
      <input
        type="text"
        value={value ?? ""}
        onChange={(e) => onChange(e.currentTarget.value)}
        placeholder="#ffffff hoặc để trống"
        className="h-8 flex-1 rounded-md border px-2 text-xs"
      />
    </div>
  ),
});
