"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon, CheckCircle2Icon, CopyIcon } from "lucide-react";
import { formatVND } from "@/lib/format";

interface Props {
  code: string;
  total: number;
  qrUrl: string;
  account: string;
  bank: string;
  accountName: string;
  content: string;
}

export function SepayPaymentClient({
  code,
  total,
  qrUrl,
  account,
  bank,
  accountName,
  content,
}: Props) {
  const router = useRouter();
  const [paid, setPaid] = React.useState(false);

  // Poll the order status every 4s until paid.
  React.useEffect(() => {
    let active = true;
    const interval = window.setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${code}/status`);
        if (!res.ok) return;
        const json = await res.json();
        if (active && json.data?.paymentStatus === "paid") {
          setPaid(true);
          window.clearInterval(interval);
          window.setTimeout(() => router.push(`/dat-hang/${code}`), 1500);
        }
      } catch {
        /* ignore */
      }
    }, 4000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [code, router]);

  function copy(text: string) {
    navigator.clipboard?.writeText(text);
  }

  if (paid) {
    return (
      <div className="mx-auto mt-12 flex max-w-md flex-col items-center text-center">
        <CheckCircle2Icon className="size-16 text-green-600" />
        <h1 className="mt-4 text-2xl font-semibold">Đã nhận thanh toán!</h1>
        <p className="mt-2 text-muted-foreground">Đang chuyển đến trang đơn hàng...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-6 max-w-md">
      <h1 className="text-center text-2xl font-semibold tracking-tight">
        Quét mã để thanh toán
      </h1>
      <p className="mt-1 text-center text-sm text-muted-foreground">
        Đơn hàng {code} · {formatVND(total)}
      </p>

      <div className="mt-6 flex flex-col items-center rounded-xl border bg-background p-5">
        <div className="relative size-64 overflow-hidden rounded-lg border bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element -- external QR service */}
          <img src={qrUrl} alt="VietQR thanh toán" className="size-full object-contain" />
        </div>

        <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2Icon className="size-4 animate-spin" />
          Đang chờ thanh toán...
        </div>
      </div>

      <div className="mt-5 space-y-2 rounded-xl border bg-background p-5 text-sm">
        <Row label="Ngân hàng" value={bank} />
        <Row label="Số tài khoản" value={account} onCopy={() => copy(account)} />
        <Row label="Chủ tài khoản" value={accountName} />
        <Row label="Số tiền" value={formatVND(total)} />
        <Row label="Nội dung CK" value={content} onCopy={() => copy(content)} highlight />
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Vui lòng chuyển khoản đúng số tiền và nội dung. Đơn hàng sẽ tự động xác nhận
        sau khi nhận được thanh toán.
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  onCopy,
  highlight,
}: {
  label: string;
  value: string;
  onCopy?: () => void;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2">
        <span className={highlight ? "font-semibold text-foreground" : "font-medium"}>
          {value}
        </span>
        {onCopy && (
          <button
            type="button"
            onClick={onCopy}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Sao chép"
          >
            <CopyIcon className="size-3.5" />
          </button>
        )}
      </span>
    </div>
  );
}
