import { formatVND } from "@/lib/format";

const BRAND = "Letom's";

function layout(title: string, body: string): string {
  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
    <div style="background:#B0202E;padding:20px 24px;border-radius:12px 12px 0 0">
      <h1 style="color:#fff;margin:0;font-size:20px">${BRAND}</h1>
    </div>
    <div style="border:1px solid #eee;border-top:none;border-radius:0 0 12px 12px;padding:24px">
      <h2 style="margin:0 0 16px;font-size:18px">${title}</h2>
      ${body}
      <p style="margin-top:24px;font-size:12px;color:#888">
        Email này được gửi tự động từ ${BRAND}. Vui lòng không trả lời.
      </p>
    </div>
  </div>`;
}

export interface OrderEmailData {
  code: string;
  customerName: string;
  total: number;
  items: { name: string; quantity: number; lineTotal: number }[];
  paymentMethod: string;
}

export function orderConfirmationEmail(d: OrderEmailData): {
  subject: string;
  html: string;
} {
  const rows = d.items
    .map(
      (it) =>
        `<tr>
          <td style="padding:6px 0;border-bottom:1px solid #f0f0f0">${it.name} × ${it.quantity}</td>
          <td style="padding:6px 0;border-bottom:1px solid #f0f0f0;text-align:right">${formatVND(it.lineTotal)}</td>
        </tr>`
    )
    .join("");

  const html = layout(
    `Cảm ơn bạn đã đặt hàng!`,
    `<p>Chào ${d.customerName},</p>
     <p>Đơn hàng <strong>${d.code}</strong> của bạn đã được tiếp nhận.</p>
     <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0">
       ${rows}
       <tr>
         <td style="padding:10px 0;font-weight:bold">Tổng cộng</td>
         <td style="padding:10px 0;text-align:right;font-weight:bold;color:#B0202E">${formatVND(d.total)}</td>
       </tr>
     </table>
     <p>Phương thức thanh toán: <strong>${d.paymentMethod === "cod" ? "Thanh toán khi nhận hàng (COD)" : "Chuyển khoản (SePay)"}</strong></p>`
  );

  return { subject: `[${BRAND}] Xác nhận đơn hàng ${d.code}`, html };
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Chờ xử lý",
  paid: "Đã thanh toán",
  processing: "Đang xử lý",
  shipped: "Đang giao",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
  refunded: "Đã hoàn tiền",
};

export function orderStatusEmail(d: {
  code: string;
  customerName: string;
  status: string;
}): { subject: string; html: string } {
  const label = STATUS_LABELS[d.status] ?? d.status;
  const html = layout(
    `Cập nhật đơn hàng ${d.code}`,
    `<p>Chào ${d.customerName},</p>
     <p>Trạng thái đơn hàng <strong>${d.code}</strong> đã được cập nhật thành:</p>
     <p style="font-size:18px;font-weight:bold;color:#B0202E">${label}</p>`
  );
  return { subject: `[${BRAND}] Đơn hàng ${d.code} — ${label}`, html };
}

export function passwordResetEmail(d: {
  name: string;
  resetUrl: string;
}): { subject: string; html: string } {
  const html = layout(
    `Đặt lại mật khẩu`,
    `<p>Chào ${d.name},</p>
     <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
     <p style="margin:20px 0">
       <a href="${d.resetUrl}" style="background:#B0202E;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">
         Đặt lại mật khẩu
       </a>
     </p>
     <p style="font-size:13px;color:#666">Liên kết có hiệu lực trong 60 phút. Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>`
  );
  return { subject: `[${BRAND}] Đặt lại mật khẩu`, html };
}
