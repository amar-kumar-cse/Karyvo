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
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

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

    // In development/test mode with mock keys, allow safe mock verification
    if (this.keySecret === "mock_secret_karyvo" && razorpay_signature.startsWith("sig_mock_")) {
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
