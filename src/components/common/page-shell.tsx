import * as React from "react";
import type { Breadcrumb } from "@/types";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

interface PageShellProps {
  title: string;
  description?: string;
  breadcrumbs: Breadcrumb[];
  children: React.ReactNode;
  /** constrain content width for readable prose */
  narrow?: boolean;
}

export function PageShell({
  title,
  description,
  breadcrumbs,
  children,
  narrow = false,
}: PageShellProps) {
  return (
    <div className="container-page py-6">
      <Breadcrumbs items={breadcrumbs} />
      <header className="mt-4 mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>
        )}
      </header>
      <div className={narrow ? "max-w-3xl" : undefined}>{children}</div>
    </div>
  );
}

/** Simple prose styling for policy/legal text. */
export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4 text-sm leading-relaxed text-foreground/90 [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
      {children}
    </div>
  );
}
