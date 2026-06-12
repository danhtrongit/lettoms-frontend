export const ORDER_STATUSES = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "completed",
  "cancelled",
  "refunded",
] as const;

export const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: "Chờ xử lý",
  paid: "Đã thanh toán",
  processing: "Đang xử lý",
  shipped: "Đang giao",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
  refunded: "Đã hoàn tiền",
};

export const PAYMENT_STATUS_LABEL: Record<string, string> = {
  unpaid: "Chưa thanh toán",
  paid: "Đã thanh toán",
  failed: "Thất bại",
};

export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  cod: "COD",
  sepay: "Chuyển khoản",
};

export function orderStatusClass(status: string): string {
  switch (status) {
    case "completed":
    case "paid":
      return "bg-green-100 text-green-700";
    case "cancelled":
    case "refunded":
      return "bg-red-100 text-red-700";
    case "shipped":
    case "processing":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-amber-100 text-amber-700";
  }
}
