import { NextRequest, NextResponse } from "next/server";
import { karyvoAI } from "@/lib/ai/provider";
import { repository } from "@/lib/db/repository";
import { getUser } from "@/lib/auth/getUser";
import { handleApiError } from "@/lib/apiError";
import { rateLimit, RATE_LIMITS } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await getUser(req);

    // AI routes get stricter rate limiting
    const { limited } = rateLimit(`ai-summary:${userId}`, RATE_LIMITS.ai.maxRequests, RATE_LIMITS.ai.windowMs);
    if (limited) {
      return NextResponse.json({ success: false, error: "Too many AI requests. Please wait a moment." }, { status: 429 });
    }

    const body = await req.json();
    const { targetRole } = body;

    // H5: Validate targetRole input
    if (targetRole && (typeof targetRole !== "string" || targetRole.length > 200)) {
      return NextResponse.json(
        { success: false, error: "Target role must be a string under 200 characters." },
        { status: 400 }
      );
    }

    const profile = repository.getProfile();
    const summary = await karyvoAI.generateSummary(profile, targetRole || "Software Engineer");

    return NextResponse.json({ success: true, data: { summary } });
  } catch (error) {
    return handleApiError(error, "POST /api/ai/summary");
  }
}
