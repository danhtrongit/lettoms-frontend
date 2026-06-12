import { cn } from "@/lib/utils";

const SIZES: Record<string, string> = {
  "1": "text-4xl sm:text-5xl",
  "2": "text-3xl sm:text-4xl",
  "3": "text-2xl sm:text-3xl",
  "4": "text-xl sm:text-2xl",
};
const ALIGN: Record<string, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export function HeadingWidget({
  text,
  level = "2",
  align = "left",
}: {
  text: string;
  level?: string;
  align?: string;
}) {
  // Data arrives from a loosely-validated jsonb column — clamp to a real tag.
  const safeLevel = level in SIZES ? level : "2";
  const Tag = `h${safeLevel}` as "h1" | "h2" | "h3" | "h4";
  return (
    <section className="container-page py-4">
      <Tag className={cn("font-semibold tracking-tight", SIZES[safeLevel], ALIGN[align])}>
        {text}
      </Tag>
    </section>
  );
}
