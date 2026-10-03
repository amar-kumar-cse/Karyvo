import { describe, expect, it } from "vitest";
import crypto from "crypto";
import { repository } from "@/lib/db/repository";
import { checkProStatus, requirePro } from "@/lib/payments/pro";
import { paymentService } from "@/lib/payments/razorpay";

describe("Payments & Pro Gating (Step 2)", () => {
  const userId = "test-user-step2-12345";

  it("checkProStatus: returns free plan for user with no active subscription", async () => {
    const status = await checkProStatus(userId);
    expect(status.isPro).toBe(false);
    expect(status.plan).toBe("free");
  });

  it("requirePro: throws 403 error for non-pro user", async () => {
    await expect(requirePro(userId)).rejects.toThrow(
      "This feature requires an active Karyvo Pro subscription."
    );
  });

  it("createProOrder: creates DB order with correct amount for monthly and yearly", async () => {
    const monthlyOrder = await paymentService.createProOrder(userId, "monthly");
    expect(monthlyOrder.amount).toBe(49900);
    expect(monthlyOrder.currency).toBe("INR");

    const dbMonthlyOrder = await repository.getOrderByRazorpayId(monthlyOrder.orderId);
    expect(dbMonthlyOrder).not.toBeNull();
    expect(dbMonthlyOrder?.userId).toBe(userId);
    expect(dbMonthlyOrder?.billingCycle).toBe("monthly");
    expect(dbMonthlyOrder?.status).toBe("created");

    const yearlyOrder = await paymentService.createProOrder(userId, "yearly");
    expect(yearlyOrder.amount).toBe(299900);

    const dbYearlyOrder = await repository.getOrderByRazorpayId(yearlyOrder.orderId);
    expect(dbYearlyOrder?.billingCycle).toBe("yearly");
    expect(dbYearlyOrder?.amount).toBe(299900);
  });

  it("verifySignature: validates legitimate signature and rejects tampered data", () => {
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "mock_secret_karyvo";
    const orderId = "order_valid_123";
    const paymentId = "pay_valid_456";

    const validSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    // Legitimate signature passes
    const isValid = paymentService.verifySignature({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: validSignature,
    });
    expect(isValid).toBe(true);

    // Tampered paymentId fails
    const isTampered = paymentService.verifySignature({
      razorpay_order_id: orderId,
      razorpay_payment_id: "pay_tampered_999",
      razorpay_signature: validSignature,
    });
    expect(isTampered).toBe(false);

    // Empty fields fail
    const isMissing = paymentService.verifySignature({
      razorpay_order_id: "",
      razorpay_payment_id: paymentId,
      razorpay_signature: validSignature,
    });
    expect(isMissing).toBe(false);
  });

  it("verifyWebhookSignature: validates webhook raw body against secret", () => {
    const webhookSecret = "test_webhook_secret_999";
    const rawBody = JSON.stringify({ event: "payment.captured", id: "evt_123" });

    const validSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    const isValid = paymentService.verifyWebhookSignature(rawBody, validSignature, webhookSecret);
    expect(isValid).toBe(true);

    const isTampered = paymentService.verifyWebhookSignature(rawBody, "bad_signature", webhookSecret);
    expect(isTampered).toBe(false);
  });

  it("upgradeToPro & checkProStatus: activates Pro and expires after period end", async () => {
    const proUser = "test-pro-user-555";

    // Upgrade to monthly Pro
    const sub = await repository.upgradeToPro(proUser, {
      billingCycle: "monthly",
      orderId: "order_test_pro",
      paymentId: "pay_test_pro",
    });
    expect(sub.plan).toBe("pro");
    expect(sub.status).toBe("active");

    const status = await checkProStatus(proUser);
    expect(status.isPro).toBe(true);
    expect(status.plan).toBe("pro");

    // requirePro succeeds
    const requiredStatus = await requirePro(proUser);
    expect(requiredStatus.isPro).toBe(true);

    // Simulate an expired subscription (period end in the past)
    const expiredUser = "test-expired-user-777";
    await repository.upgradeToPro(expiredUser, {
      billingCycle: "monthly",
      orderId: "order_expired",
      paymentId: "pay_expired",
    });

    // Manually backdate currentPeriodEnd to yesterday
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const existingSub = await repository.getSubscription(expiredUser);
    if (existingSub) {
      existingSub.currentPeriodEnd = pastDate;
    }

    const expiredStatus = await checkProStatus(expiredUser);
    expect(expiredStatus.isPro).toBe(false);
    expect(expiredStatus.status).toBe("expired");

    await expect(requirePro(expiredUser)).rejects.toThrow("requires an active Karyvo Pro subscription");
  });

  it("order lifecycle: creates order, marks paid, and stores payment ID", async () => {
    const orderUser = "test-order-user-888";
    const order = await paymentService.createProOrder(orderUser, "yearly");

    const retrieved = await repository.getOrderByRazorpayId(order.orderId);
    expect(retrieved?.status).toBe("created");

    const paidOrder = await repository.markOrderPaid(order.orderId, "pay_success_123");
    expect(paidOrder?.status).toBe("paid");
    expect(paidOrder?.razorpayPaymentId).toBe("pay_success_123");

    const updated = await repository.getOrderByRazorpayId(order.orderId);
    expect(updated?.status).toBe("paid");
  });
});
