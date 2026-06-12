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
import { deleteArticleAction } from "@/server/actions/content";

export function ArticleRowActions({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  function handleDelete() {
    if (!confirm("Xóa bài viết này?")) return;
    startTransition(async () => {
      const res = await deleteArticleAction(id);
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
          <Link href={`/admin/articles/${id}`}>
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
