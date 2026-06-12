import { NextRequest, NextResponse } from "next/server";
import {
  verifySepayApiKey,
  matchOrderCode,
  type SepayWebhookPayload,
} from "@/lib/payments/sepay";
import {
  listUnpaidSepayCodes,
  markOrderPaidBySepay,
} from "@/lib/repos/orders.repo";

/**
 * POST /api/webhooks/sepay
 * Receives bank transfer notifications from SePay.
 * Auth: "Authorization: Apikey <SEPAY_WEBHOOK_API_KEY>".
 * Always returns 200 on handled events (SePay expects 2xx).
 */
export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!verifySepayApiKey(auth)) {
    return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  }

  let payload: SepayWebhookPayload;
  try {
    payload = (await req.json()) as SepayWebhookPayload;
  } catch {
    return NextResponse.json({ success: false, error: "invalid_json" }, { status: 400 });
  }

  // Only incoming transfers can pay an order.
  if (payload.transferType !== "in") {
    return NextResponse.json({ success: true, skipped: "not_incoming" });
  }

  const candidates = await listUnpaidSepayCodes();
  const code = matchOrderCode(payload.content ?? "", candidates);
  if (!code) {
    // Not matching any pending order — acknowledge so SePay doesn't retry forever.
    return NextResponse.json({ success: true, skipped: "no_match" });
  }

  const ref = payload.referenceCode || String(payload.id);
  const result = await markOrderPaidBySepay({
    code,
    sepayRef: ref,
    amount: payload.transferAmount,
  });

  return NextResponse.json({ success: true, ...result });
}
