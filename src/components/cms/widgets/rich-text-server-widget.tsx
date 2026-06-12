import type { JSONContent } from "@tiptap/core";
import { renderTiptapHtml } from "@/lib/rich-text/render";
import { RichTextContent } from "@/components/common/rich-text-content";

export function RichTextServerWidget({
  contentJson,
  contentHtml,
}: {
  contentJson?: JSONContent | null;
  contentHtml?: string;
}) {
  const html = contentHtml || renderTiptapHtml(contentJson ?? null);
  return (
    <section className="container-page py-6">
      <RichTextContent html={html} className="mx-auto max-w-3xl" />
    </section>
  );
}
