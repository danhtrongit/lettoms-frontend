"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ORDER_STATUSES, ORDER_STATUS_LABEL } from "@/lib/order-status";
import { updateOrderStatusAction } from "@/server/actions/orders";

export function OrderStatusUpdater({
  id,
  current,
}: {
  id: string;
  current: string;
}) {
  const router = useRouter();
  const [status, setStatus] = React.useState(current);
  const [pending, startTransition] = React.useTransition();

  function onChange(next: string) {
    setStatus(next);
    startTransition(async () => {
      const res = await updateOrderStatusAction(id, next);
      if (!res.ok) {
        alert(res.error ?? "Cập nhật thất bại");
        setStatus(current);
        return;
      }
      router.refresh();
    });
  }

  return (
    <Select value={status} onValueChange={onChange} disabled={pending}>
      <SelectTrigger className="w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ORDER_STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {ORDER_STATUS_LABEL[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
