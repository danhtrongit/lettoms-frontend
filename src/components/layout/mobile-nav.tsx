"use client";

import * as React from "react";
import Link from "next/link";
import { MenuIcon, UserIcon, HeartIcon } from "lucide-react";
import { utilityNav } from "@/data/navigation";
import type { NavItem } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface MobileNavProps {
  nav: NavItem[];
}

export function MobileNav({ nav }: MobileNavProps) {
  const [open, setOpen] = React.useState(false);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Mở menu"
        >
          <MenuIcon className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[88vw] max-w-sm p-0">
        <SheetHeader className="border-b">
          <SheetTitle>Danh mục</SheetTitle>
        </SheetHeader>
        <nav className="overflow-y-auto pb-8">
          <Accordion type="single" collapsible className="px-2">
            {nav.map((item) =>
              item.columns?.length ? (
                <AccordionItem key={item.label} value={item.label}>
                  <AccordionTrigger className="px-2 text-sm font-medium uppercase">
                    {item.label}
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-1 pl-2">
                      {item.columns.map((col) => (
                        <li key={col.title} className="py-1">
                          <Link
                            href={col.items[0]?.href ?? item.href}
                            onClick={close}
                            className="block text-sm font-semibold"
                          >
                            {col.title}
                          </Link>
                          <ul className="mt-1 space-y-1 pl-3">
                            {col.items.slice(1).map((sub) => (
                              <li key={sub.href}>
                                <Link
                                  href={sub.href}
                                  onClick={close}
                                  className="block py-0.5 text-sm text-muted-foreground"
                                >
                                  {sub.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={close}
                  className="block border-b px-4 py-3.5 text-sm font-medium uppercase"
                >
                  {item.label}
                </Link>
              )
            )}
          </Accordion>

          <ul className="mt-4 space-y-1 px-4">
            <li>
              <Link
                href="/ho-tro"
                onClick={close}
                className="flex items-center gap-2 py-2 text-sm font-medium"
              >
                <UserIcon className="size-4" /> Tài khoản
              </Link>
            </li>
            <li>
              <Link
                href="/yeu-thich"
                onClick={close}
                className="flex items-center gap-2 py-2 text-sm font-medium"
              >
                <HeartIcon className="size-4" /> Yêu thích
              </Link>
            </li>
            {utilityNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={close}
                  className="block py-2 text-sm text-muted-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
