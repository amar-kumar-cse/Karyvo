import { NextRequest, NextResponse } from "next/server";
import { paymentService } from "@/lib/payments/razorpay";
import { repository } from "@/lib/db/repository";
import { getUser } from "@/lib/auth/getUser";
import { handleApiError } from "@/lib/apiError";
import { rateLimit, RATE_LIMITS } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await getUser(req);

    const { limited } = rateLimit(`payment-verify:${userId}`, RATE_LIMITS.payment.maxRequests, RATE_LIMITS.payment.windowMs);
    if (limited) {
      return NextResponse.json({ success: false, error: "Too many requests. Please wait." }, { status: 429 });
    }

    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    // Validate all required payment fields exist
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: "Missing required payment verification fields." },
        { status: 400 }
      );
    }

    // Verify cryptographic signature first
    const isValid = paymentService.verifySignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid payment signature. Verification failed." },
        { status: 400 }
      );
    }

    // Lookup order in database to prevent account takeover and replay attacks
    const existingOrder = await repository.getOrderByRazorpayId(razorpay_order_id);
    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: "Payment order not found in records." },
        { status: 404 }
      );
    }

    // Ensure the paying user owns the order
    if (existingOrder.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Payment order does not belong to the authenticated user." },
        { status: 403 }
      );
    }

    // If order was already processed and marked paid, return current active subscription idempotently
    if (existingOrder.status === "paid") {
      const currentSub = await repository.getSubscription(userId);
      return NextResponse.json({
        success: true,
        message: "Payment was already verified and credited.",
        data: currentSub,
      });
    }

    // Mark order as paid in database
    await repository.markOrderPaid(razorpay_order_id, razorpay_payment_id);

    // Upgrade user to Pro, strictly deriving billingCycle from the saved DB order (never trust client payload)
    const subscription = await repository.upgradeToPro(userId, {
      billingCycle: existingOrder.billingCycle,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });

    return NextResponse.json({
      success: true,
      message: "Pro subscription successfully activated!",
      data: subscription,
    });
  } catch (error) {
    return handleApiError(error, "POST /api/payments/verify");
  }
}

