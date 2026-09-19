import { NextResponse } from "next/server";
import { paymentService } from "@/lib/payments/razorpay";
import { repository } from "@/lib/db/repository";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { billingCycle } = body;

    const order = await paymentService.createProOrder(
      "user-default",
      billingCycle === "yearly" ? "yearly" : "monthly"
    );

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("POST /api/payments/create-order error:", error);
    return NextResponse.json({ success: false, error: "Failed to create payment order." }, { status: 500 });
  }
}
