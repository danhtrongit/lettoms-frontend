import { cn } from "@/lib/utils";

/**
 * Renders pre-sanitized rich-text HTML (cached from Tiptap JSON).
 * HTML is sanitized server-side before storage, so it's safe to inject here.
 */
export function RichTextContent({
  html,
  className,
}: {
  html: string | null | undefined;
  className?: string;
}) {
  if (!html) return null;
  return (
    <div
      className={cn("prose prose-neutral max-w-none", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
