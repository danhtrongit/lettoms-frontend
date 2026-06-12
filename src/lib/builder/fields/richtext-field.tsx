"use client";

import type { JSONContent } from "@tiptap/core";
import type { CustomField } from "@puckeditor/core";
import { RichTextEditor } from "@/components/admin/rich-text-editor";

export const richTextField = (label: string): CustomField<JSONContent | null> => ({
  type: "custom",
  label,
  render: ({ value, onChange }) => (
    <RichTextEditor value={value ?? null} onChange={onChange} placeholder="Nhập nội dung…" />
  ),
});
