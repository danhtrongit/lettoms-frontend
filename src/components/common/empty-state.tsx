import Link from "next/link";
import { PackageOpenIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-20 text-center">
      <PackageOpenIcon className="size-10 text-muted-foreground" />
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && (
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {actionLabel && actionHref && (
        <Button asChild className="mt-2 rounded-full">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
}
