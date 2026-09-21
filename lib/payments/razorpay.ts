import crypto from "crypto";
import { RazorpayVerificationPayload } from "@/types/payment";

export class PaymentService {
  private keyId: string;
  private keySecret: string;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_karyvo_mock";
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || "mock_secret_karyvo";
  }

  /**
   * Generates a secure Razorpay order for Pro subscription
   */
  async createProOrder(userId: string, billingCycle: "monthly" | "yearly" = "monthly"): Promise<{
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
  }> {
    // In INR: Monthly is ₹499 (49900 paise), Yearly is ₹2999 (299900 paise)
    const amount = billingCycle === "monthly" ? 49900 : 299900;
    // M4: Use crypto.randomUUID() instead of Date.now() for collision-free IDs
    const orderId = `order_${crypto.randomUUID()}`;

    // TODO: Replace with real Razorpay SDK call:
    // const razorpay = new Razorpay({ key_id: this.keyId, key_secret: this.keySecret });
    // const order = await razorpay.orders.create({ amount, currency: "INR", receipt: orderId });

    return {
      orderId,
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
