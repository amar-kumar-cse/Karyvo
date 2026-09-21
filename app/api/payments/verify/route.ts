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

    // S1: Validate all required payment fields exist
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: "Missing payment verification fields." },
        { status: 400 }
      );
    }

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

    // Upgrade user to Pro in repository
    const subscription = repository.upgradeToPro();

    return NextResponse.json({
      success: true,
      message: "Pro subscription successfully activated!",
      data: subscription,
    });
  } catch (error) {
    return handleApiError(error, "POST /api/payments/verify");
  }
}
