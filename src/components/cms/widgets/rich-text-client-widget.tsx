"use client";

import { useMemo } from "react";
import { generateHTML } from "@tiptap/html";
import type { JSONContent } from "@tiptap/core";
import { tiptapExtensions } from "@/lib/rich-text/extensions";

export function RichTextClientWidget({ contentJson }: { contentJson?: JSONContent | null }) {
  const html = useMemo(() => {
    if (!contentJson) return "";
    try {
      return generateHTML(contentJson, tiptapExtensions());
    } catch {
      return "";
    }
  }, [contentJson]);

  if (!html) {
    return (
      <section className="container-page py-6">
        <p className="text-sm text-muted-foreground">Văn bản trống — nhập nội dung ở panel bên phải.</p>
      </section>
    );
  }
  return (
    <section className="container-page py-6">
      <div
        className="prose prose-neutral mx-auto max-w-3xl"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  );
}
