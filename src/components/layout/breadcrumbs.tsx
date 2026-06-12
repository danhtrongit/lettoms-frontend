import * as React from "react";
import type { Breadcrumb } from "@/types";
import {
  Breadcrumb as UIBreadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbsProps {
  items: Breadcrumb[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <UIBreadcrumb>
      <BreadcrumbList>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <React.Fragment key={`${item.label}-${i}`}>
              <BreadcrumbItem>
                {isLast || !item.href ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </UIBreadcrumb>
  );
}
