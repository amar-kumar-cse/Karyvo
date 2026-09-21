import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/lib/db/repository";
import { getUser } from "@/lib/auth/getUser";
import { handleApiError } from "@/lib/apiError";
import { rateLimit, RATE_LIMITS } from "@/lib/rateLimit";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await getUser(req);
    const subscription = repository.getSubscription();
    return NextResponse.json({ success: true, data: subscription });
  } catch (error) {
    return handleApiError(error, "GET /api/payments/subscription");
  }
}

// L5: Cancel subscription endpoint
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await getUser(req);

    const { limited } = rateLimit(`sub-cancel:${userId}`, RATE_LIMITS.payment.maxRequests, RATE_LIMITS.payment.windowMs);
    if (limited) {
      return NextResponse.json({ success: false, error: "Too many requests. Please wait." }, { status: 429 });
    }

    const subscription = repository.cancelSubscription();
    return NextResponse.json({
      success: true,
      message: "Subscription successfully canceled.",
      data: subscription,
    });
  } catch (error) {
    return handleApiError(error, "DELETE /api/payments/subscription");
  }
}
