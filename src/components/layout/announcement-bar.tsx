"use client";

import * as React from "react";
import { XIcon } from "lucide-react";

interface AnnouncementBarProps {
  message?: string;
  href?: string;
  enabled?: boolean;
}

export function AnnouncementBar({
  message = "Miễn phí giao hàng cho đơn từ 499.000 VND · Đổi trả trong 30 ngày",
  href,
  enabled = true,
}: AnnouncementBarProps) {
  const [visible, setVisible] = React.useState(true);
  if (!visible || !enabled || !message) return null;

  return (
    <div className="relative bg-primary text-primary-foreground">
      <div className="container-page flex h-9 items-center justify-center">
        {href ? (
          <a href={href} className="text-center text-xs hover:underline sm:text-[13px]">
            {message}
          </a>
        ) : (
          <p className="text-center text-xs sm:text-[13px]">{message}</p>
        )}
        <button
          type="button"
          aria-label="Đóng thông báo"
          onClick={() => setVisible(false)}
          className="absolute right-3 top-1/2 -translate-y-1/2 opacity-80 transition-opacity hover:opacity-100"
        >
          <XIcon className="size-4" />
        </button>
      </div>
    </div>
  );
}
