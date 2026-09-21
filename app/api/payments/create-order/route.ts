import { NextRequest, NextResponse } from "next/server";
import { paymentService } from "@/lib/payments/razorpay";
import { getUser } from "@/lib/auth/getUser";
import { handleApiError } from "@/lib/apiError";
import { rateLimit, RATE_LIMITS } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await getUser(req);

    // Payment routes: strict rate limiting
    const { limited } = rateLimit(`payment-create:${userId}`, RATE_LIMITS.payment.maxRequests, RATE_LIMITS.payment.windowMs);
    if (limited) {
      return NextResponse.json({ success: false, error: "Too many requests. Please wait." }, { status: 429 });
    }

    const body = await req.json();
    const { billingCycle } = body;

    const order = await paymentService.createProOrder(
      userId,
      billingCycle === "yearly" ? "yearly" : "monthly"
    );

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    return handleApiError(error, "POST /api/payments/create-order");
  }
}
