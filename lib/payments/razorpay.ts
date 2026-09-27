import crypto from "crypto";
import Razorpay from "razorpay";
import { RazorpayVerificationPayload, PaymentOrder } from "@/types/payment";

export class PaymentService {
  private keyId: string;
  private keySecret: string;
  private razorpayClient: Razorpay | null = null;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_karyvo_mock";
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || "mock_secret_karyvo";

    // Initialize official Razorpay instance if valid keys exist
    if (this.keyId && this.keySecret && this.keyId !== "rzp_test_karyvo_mock" && this.keySecret !== "mock_secret_karyvo") {
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
   * H2: Generates an official Razorpay order for Pro subscription
   */
  async createProOrder(
    userId: string,
    billingCycle: "monthly" | "yearly" = "monthly"
  ): Promise<PaymentOrder> {
    // In INR: Monthly is ₹499 (49900 paise), Yearly is ₹2999 (299900 paise)
    const amount = billingCycle === "monthly" ? 49900 : 299900;
    const receipt = `rcpt_${crypto.randomUUID().slice(0, 18)}`;

    // Call official Razorpay Orders API if configured
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

        return {
          orderId: order.id,
          amount: Number(order.amount),
          currency: order.currency,
          keyId: this.keyId,
        };
      } catch (err) {
        console.error("Razorpay order creation failed, falling back to simulated order in non-production:", err);
        if (process.env.NODE_ENV === "production") {
          throw new Error("Unable to create payment order with payment gateway.");
        }
      }
    }

    // Fallback for development/testing environments
    const mockOrderId = `order_${crypto.randomUUID()}`;
    return {
      orderId: mockOrderId,
      amount,
      currency: "INR",
      keyId: this.keyId,
    };
  }

  /**
   * Verifies Razorpay HMAC SHA256 signature
   * Strictly server-side verification to prevent client payment bypass
   */
  verifySignature(payload: RazorpayVerificationPayload): boolean {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = payload;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return false;
    }

    // C4: Mock signatures are ONLY allowed in non-production environments
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

      return generatedSignature === razorpay_signature;
    } catch (err) {
      console.error("Signature verification error:", err);
      return false;
    }
  }
}

export const paymentService = new PaymentService();
