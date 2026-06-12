import { cn } from "@/lib/utils";

interface ProductPlaceholderProps {
  /** primary color hex used to tint the placeholder */
  hex?: string;
  label?: string;
  className?: string;
}

/**
 * Brand-tinted CSS placeholder used in lieu of real product photography.
 * Aspect ratio is controlled by the parent (3:4 for apparel).
 */
export function ProductPlaceholder({
  hex = "#F4F4F4",
  label,
  className,
}: ProductPlaceholderProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center overflow-hidden",
        className
      )}
      style={{
        background: `linear-gradient(135deg, ${hex}1A 0%, ${hex}33 55%, ${hex}1A 100%)`,
      }}
      aria-hidden
    >
      <span
        className="size-16 rounded-full opacity-40"
        style={{ backgroundColor: hex }}
      />
      {label && <span className="sr-only">{label}</span>}
    </div>
  );
}
