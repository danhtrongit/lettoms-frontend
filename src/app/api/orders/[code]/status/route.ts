import { NextRequest, NextResponse } from "next/server";
import { getOrderByCode } from "@/lib/repos/orders.repo";

/** GET /api/orders/[code]/status — lightweight payment status poll. */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const order = await getOrderByCode(code);
  if (!order) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({
    data: {
      code: order.code,
      status: order.status,
      paymentStatus: order.paymentStatus,
    },
  });
}
