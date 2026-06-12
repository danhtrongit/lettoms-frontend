import type { ArticleBlock } from "@/types";

export function ArticleBody({ blocks }: { blocks: ArticleBlock[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "heading":
            return (
              <h2 key={i} className="text-xl font-semibold tracking-tight">
                {block.text}
              </h2>
            );
          case "paragraph":
            return (
              <p key={i} className="text-base leading-relaxed text-foreground/90">
                {block.text}
              </p>
            );
          case "quote":
            return (
              <blockquote
                key={i}
                className="border-l-4 border-primary pl-4 text-lg italic text-foreground/80"
              >
                {block.text}
                {block.cite && (
                  <cite className="mt-1 block text-sm not-italic text-muted-foreground">
                    — {block.cite}
                  </cite>
                )}
              </blockquote>
            );
          case "image":
            return (
              <figure key={i} className="space-y-2">
                <div className="aspect-video rounded-lg bg-muted" />
                {block.caption && (
                  <figcaption className="text-center text-sm text-muted-foreground">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
