import { cn } from "@/lib/utils";

const PADDING: Record<string, string> = {
  none: "py-0",
  small: "py-6",
  medium: "py-12",
  large: "py-20",
};

export function SectionWidget({
  background = "",
  paddingY = "medium",
  contained = true,
  children,
}: {
  background?: string;
  paddingY?: string;
  contained?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(PADDING[paddingY] ?? PADDING.medium)}
      style={background ? { backgroundColor: background } : undefined}
    >
      <div className={contained ? "container-page" : undefined}>{children}</div>
    </section>
  );
}
