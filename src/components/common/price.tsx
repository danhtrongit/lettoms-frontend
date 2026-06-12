import { cn } from "@/lib/utils";
import { formatVND, discountPercent } from "@/lib/format";

interface PriceProps {
  price: number;
  originalPrice?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

/** Price display with optional struck-through original and red sale price. */
export function Price({ price, originalPrice, className, size = "md" }: PriceProps) {
  const onSale = !!originalPrice && originalPrice > price;
  const pct = discountPercent(price, originalPrice);
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2", sizeMap[size], className)}>
      <span className={cn("font-semibold", onSale && "text-destructive")}>
        {formatVND(price)}
      </span>
      {onSale && (
        <>
          <span className="text-xs font-normal text-muted-foreground line-through">
            {formatVND(originalPrice!)}
          </span>
          <span className="text-xs font-semibold text-destructive">-{pct}%</span>
        </>
      )}
    </div>
  );
}
