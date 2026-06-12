"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MoreHorizontalIcon, PencilIcon, Trash2Icon, ExternalLinkIcon, PaletteIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { deletePageAction } from "@/server/actions/pages";

export function PageRowActions({ id, slug, isSystem }: { id: string; slug: string; isSystem: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  function handleDelete() {
    if (!confirm("Xóa trang này?")) return;
    startTransition(async () => {
      const res = await deletePageAction(id);
      if (!res.ok) alert(res.error ?? "Xóa thất bại");
      router.refresh();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={pending}>
          <MoreHorizontalIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/admin/pages/${id}`}>
            <PencilIcon className="size-4" />
            Sửa
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/admin/pages/${id}/builder`}>
            <PaletteIcon className="size-4" />
            Thiết kế
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/trang/${slug}`} target="_blank">
            <ExternalLinkIcon className="size-4" />
            Xem
          </Link>
        </DropdownMenuItem>
        {!isSystem && (
          <DropdownMenuItem variant="destructive" onClick={handleDelete}>
            <Trash2Icon className="size-4" />
            Xóa
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
