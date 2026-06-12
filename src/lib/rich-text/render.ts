import "server-only";
import { generateHTML } from "@tiptap/html/server";
import DOMPurify from "isomorphic-dompurify";
import type { JSONContent } from "@tiptap/core";
import { tiptapExtensions, isEmptyDoc } from "./extensions";

/**
 * Convert a Tiptap JSON doc into sanitized HTML for caching/render.
 * Runs on the server only (uses jsdom via isomorphic-dompurify).
 */
export function renderTiptapHtml(doc: JSONContent | null | undefined): string {
  if (isEmptyDoc(doc)) return "";
  try {
    const raw = generateHTML(doc as JSONContent, tiptapExtensions());
    return DOMPurify.sanitize(raw, {
      ADD_ATTR: ["target", "rel"],
    });
  } catch {
    return "";
  }
}
