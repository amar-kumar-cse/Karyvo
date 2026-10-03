import { NextRequest, NextResponse } from "next/server";
import { paymentService } from "@/lib/payments/razorpay";
import { repository } from "@/lib/db/repository";

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-razorpay-signature");
    if (!signature) {
      return NextResponse.json(
        { success: false, error: "Missing x-razorpay-signature header." },
        { status: 400 }
      );
    }

    const rawBody = await req.text();

    const isValid = paymentService.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.warn("Unauthorized webhook attempt rejected: invalid signature");
      return NextResponse.json(
        { success: false, error: "Invalid webhook signature." },
        { status: 400 }
      );
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;

    // Handle order.paid or payment.captured
    if (eventType === "order.paid" || eventType === "payment.captured") {
      const paymentEntity = event.payload?.payment?.entity;
      const orderEntity = event.payload?.order?.entity;

      const razorpayOrderId = orderEntity?.id || paymentEntity?.order_id;
      const razorpayPaymentId = paymentEntity?.id;

      if (razorpayOrderId) {
        const order = await repository.getOrderByRazorpayId(razorpayOrderId);
        if (order && order.status !== "paid") {
          await repository.markOrderPaid(razorpayOrderId, razorpayPaymentId || "webhook_captured");
          await repository.upgradeToPro(order.userId, {
            billingCycle: order.billingCycle,
            paymentId: razorpayPaymentId,
            orderId: razorpayOrderId,
          });
          console.log(`Webhook successfully fulfilled Pro subscription for user ${order.userId} on order ${razorpayOrderId}`);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { success: false, error: "Internal webhook processing error." },
      { status: 500 }
    );
  }
}
