import crypto from "crypto";
import Razorpay from "razorpay";
import { RazorpayVerificationPayload, PaymentOrder } from "@/types/payment";
import { repository } from "@/lib/db/repository";

export class PaymentService {
  private keyId: string;
  private keySecret: string;
  private razorpayClient: Razorpay | null = null;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_karyvo_mock";
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || "mock_secret_karyvo";

    // Initialize official Razorpay instance if valid keys exist
    if (
      this.keyId &&
      this.keySecret &&
      this.keyId !== "rzp_test_karyvo_mock" &&
      this.keySecret !== "mock_secret_karyvo"
    ) {
      try {
        this.razorpayClient = new Razorpay({
          key_id: this.keyId,
          key_secret: this.keySecret,
        });
      } catch (err) {
        console.error("Failed to initialize Razorpay SDK client:", err);
      }
    }
  }

  /**
   * Generates a verified Razorpay order for Pro subscription and stores it in DB.
   * In production, throws if payment gateway is not properly configured.
   */
  async createProOrder(
    userId: string,
    billingCycle: "monthly" | "yearly" = "monthly"
  ): Promise<PaymentOrder> {
    // In INR: Monthly is ₹499 (49900 paise), Yearly is ₹2999 (299900 paise)
    const amount = billingCycle === "monthly" ? 49900 : 299900;
    const receipt = `rcpt_${crypto.randomUUID().slice(0, 18)}`;
    let orderId: string;

    if (this.razorpayClient) {
      try {
        const order = await this.razorpayClient.orders.create({
          amount,
          currency: "INR",
          receipt,
          notes: {
            userId,
            billingCycle,
            tier: "pro",
          },
        });

        orderId = order.id;
      } catch (err) {
        console.error("Razorpay order creation failed:", err);
        if (process.env.NODE_ENV === "production") {
          throw new Error("Unable to create payment order with payment gateway.");
        }
        orderId = `order_${crypto.randomUUID()}`;
      }
    } else {
      if (process.env.NODE_ENV === "production") {
        throw new Error("Payment gateway is not configured in production.");
      }
      orderId = `order_${crypto.randomUUID()}`;
    }

    // Persist order record in database for audit and replay prevention
    const now = new Date().toISOString();
    await repository.createOrder({
      id: crypto.randomUUID(),
      userId,
      plan: "pro",
      billingCycle,
      amount,
      currency: "INR",
      status: "created",
      razorpayOrderId: orderId,
      createdAt: now,
      updatedAt: now,
    });

    return {
      orderId,
      amount,
      currency: "INR",
      keyId: this.keyId,
    };
  }

  /**
   * Verifies Razorpay HMAC SHA256 signature using timing-safe buffer comparison.
   * Strictly server-side verification to prevent payment bypass.
   */
  verifySignature(payload: RazorpayVerificationPayload): boolean {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = payload;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return false;
    }

    // Reject mock signatures in production
    if (process.env.NODE_ENV === "production" && this.keySecret === "mock_secret_karyvo") {
      console.error("CRITICAL: Mock payment secret detected in production. Rejecting.");
      return false;
    }

    // Allow mock verification only in development/test with mock keys
    if (
      process.env.NODE_ENV !== "production" &&
      this.keySecret === "mock_secret_karyvo" &&
      (razorpay_signature.startsWith("sig_mock_") || razorpay_signature.startsWith("mock_"))
    ) {
      return true;
    }

    try {
      const generatedSignature = crypto
        .createHmac("sha256", this.keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      const a = Buffer.from(generatedSignature, "utf8");
      const b = Buffer.from(razorpay_signature, "utf8");

      if (a.length !== b.length) {
        return false;
      }

      return crypto.timingSafeEqual(a, b);
    } catch (err) {
      console.error("Signature verification error:", err);
      return false;
    }
  }

  /**
   * Verifies Razorpay Webhook HMAC SHA256 signature.
   */
  verifyWebhookSignature(rawBody: string, signature: string, secret?: string): boolean {
    const webhookSecret = secret || process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret || !signature || !rawBody) {
      return false;
    }

    try {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      const a = Buffer.from(expectedSignature, "utf8");
      const b = Buffer.from(signature, "utf8");

      if (a.length !== b.length) {
        return false;
      }

      return crypto.timingSafeEqual(a, b);
    } catch (err) {
      console.error("Webhook signature verification error:", err);
      return false;
    }
  }
}

export const paymentService = new PaymentService();

