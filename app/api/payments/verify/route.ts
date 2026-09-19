import { NextResponse } from "next/server";
import { paymentService } from "@/lib/payments/razorpay";
import { repository } from "@/lib/db/repository";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

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
    console.error("POST /api/payments/verify error:", error);
    return NextResponse.json({ success: false, error: "Payment verification failed." }, { status: 500 });
  }
}
