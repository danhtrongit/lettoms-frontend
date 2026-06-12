"use client";

import * as React from "react";
import Link from "next/link";
import { MenuIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

/**
 * Mobile-only hamburger that opens the admin navigation in a drawer.
 * Closes automatically on route change (key bound to pathname by parent).
 */
export function AdminMobileNav({ role }: { role: string }) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Mở menu">
          <MenuIcon className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetTitle className="flex h-14 items-center border-b px-5 text-lg font-semibold">
          <Link href="/admin" onClick={() => setOpen(false)}>
            Letom&apos;s <span className="text-muted-foreground">Admin</span>
          </Link>
        </SheetTitle>
        <div className="overflow-y-auto" onClick={() => setOpen(false)}>
          <AdminSidebar role={role} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
