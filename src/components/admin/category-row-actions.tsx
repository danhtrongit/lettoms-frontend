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
import { deleteCategoryAction } from "@/server/actions/catalog";

export function CategoryRowActions({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  function handleDelete() {
    if (!confirm("Xóa danh mục này? Sản phẩm thuộc danh mục sẽ bị gỡ liên kết.")) return;
    startTransition(async () => {
      const res = await deleteCategoryAction(id);
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
          <Link href={`/admin/categories/${id}`}>
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
