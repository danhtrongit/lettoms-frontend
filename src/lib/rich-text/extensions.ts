import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import type { Extensions } from "@tiptap/react";
import type { JSONContent } from "@tiptap/core";

/**
 * Shared Tiptap extension set used by both the editor (client) and
 * the HTML generator (server). Keep these in sync so cached HTML matches
 * what the editor produces.
 */
export function tiptapExtensions(placeholder?: string): Extensions {
  return [
    StarterKit.configure({
      heading: { levels: [2, 3, 4] },
      // StarterKit v3 bundles Link — configure it here instead of adding a
      // separate Link.configure(...) which would cause duplicate extension names.
      link: {
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      },
    }),
    Image.configure({ inline: false, allowBase64: false }),
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    Placeholder.configure({ placeholder: placeholder ?? "Nhập nội dung..." }),
  ];
}

export const EMPTY_DOC: JSONContent = { type: "doc", content: [] };

/** A Tiptap doc is "empty" if it has no content nodes with text/media. */
export function isEmptyDoc(doc: JSONContent | null | undefined): boolean {
  if (!doc || !doc.content || doc.content.length === 0) return true;
  const hasContent = (node: JSONContent): boolean => {
    if (node.text && node.text.trim()) return true;
    if (node.type === "image") return true;
    return (node.content ?? []).some(hasContent);
  };
  return !doc.content.some(hasContent);
}

export type { JSONContent };
