import { NextRequest, NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/validators/commerce";
import { createOrder } from "@/lib/repos/orders.repo";
import { getCurrentUser } from "@/lib/auth/rbac";
import { vietQrUrl, sepayAccountInfo, paymentContent } from "@/lib/payments/sepay";

/**
 * POST /api/checkout
 * Creates an order (COD or SePay). For SePay, returns VietQR payment info.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
      { status: 400 }
    );
  }

  const user = await getCurrentUser();

  try {
    const order = await createOrder(parsed.data, user?.id ?? null);

    const payment =
      order.paymentMethod === "sepay"
        ? {
            method: "sepay" as const,
            qrUrl: vietQrUrl({ amount: order.total, orderCode: order.code }),
            content: paymentContent(order.code),
            ...sepayAccountInfo(),
          }
        : { method: "cod" as const };

    return NextResponse.json({
      data: {
        code: order.code,
        total: order.total,
        paymentMethod: order.paymentMethod,
        payment,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Không thể tạo đơn hàng" },
      { status: 400 }
    );
  }
}
