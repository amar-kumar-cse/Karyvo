export type PlanTier = "free" | "pro";

export interface Subscription {
  id: string;
  userId: string;
  plan: PlanTier;
  status: "active" | "canceled" | "past_due";
  currentPeriodEnd?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentOrder {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface RazorpayVerificationPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
