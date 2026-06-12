/**
 * SePay integration (https://developer.sepay.vn).
 *
 * Flow:
 *  - On SePay checkout we generate a transfer "content" containing the order code.
 *  - We render a VietQR image encoding bank account + amount + content.
 *  - The customer transfers; SePay POSTs a webhook to /api/webhooks/sepay.
 *  - We match by order code in `content`, verify amount, then mark the order paid.
 */

export interface SepayWebhookPayload {
  id: number;
  gateway: string;
  transactionDate: string;
  accountNumber: string;
  subAccount?: string | null;
  code?: string | null;
  content: string;
  transferType: "in" | "out";
  transferAmount: number;
  accumulated?: number;
  referenceCode?: string;
}

const ACCOUNT = process.env.SEPAY_ACCOUNT_NUMBER ?? "";
const BANK = process.env.SEPAY_BANK_CODE ?? "";
const ACCOUNT_NAME = process.env.SEPAY_ACCOUNT_NAME ?? "LETOMS";

/**
 * The transfer memo a customer must include. We keep it compact and
 * alphanumeric so banks don't strip it. The order code itself works well.
 */
export function paymentContent(orderCode: string): string {
  return orderCode.replace(/[^A-Za-z0-9]/g, "");
}

/** Build a VietQR image URL (via SePay's qr service) for the order. */
export function vietQrUrl(params: {
  amount: number;
  orderCode: string;
}): string {
  const content = paymentContent(params.orderCode);
  const qs = new URLSearchParams({
    acc: ACCOUNT,
    bank: BANK,
    amount: String(params.amount),
    des: content,
    template: "compact",
  });
  return `https://qr.sepay.vn/img?${qs.toString()}`;
}

export function sepayAccountInfo() {
  return { account: ACCOUNT, bank: BANK, accountName: ACCOUNT_NAME };
}

/** Verify the webhook's Authorization header against our configured API key. */
export function verifySepayApiKey(authHeader: string | null): boolean {
  const expected = process.env.SEPAY_WEBHOOK_API_KEY;
  if (!expected) return false;
  if (!authHeader) return false;
  // Header format: "Apikey <key>"
  const match = authHeader.match(/^Apikey\s+(.+)$/i);
  const provided = match ? match[1] : authHeader;
  return provided.trim() === expected.trim();
}

/** Extract an order code from the transfer content, given a set of pending codes. */
export function matchOrderCode(content: string, candidates: string[]): string | null {
  const normalized = content.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  for (const code of candidates) {
    const norm = paymentContent(code).toUpperCase();
    if (norm && normalized.includes(norm)) return code;
  }
  return null;
}
