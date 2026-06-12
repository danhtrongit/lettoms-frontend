"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MoreHorizontalIcon, PencilIcon, Trash2Icon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { deleteProductAction } from "@/server/actions/catalog";

export function ProductRowActions({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  function handleDelete() {
    if (!confirm("Xóa sản phẩm này? Toàn bộ biến thể và ảnh sẽ bị xóa.")) return;
    startTransition(async () => {
      const res = await deleteProductAction(id);
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
          <Link href={`/admin/products/${id}`}>
            <PencilIcon className="size-4" />
            Sửa
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={handleDelete}>
          <Trash2Icon className="size-4" />
          Xóa
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
