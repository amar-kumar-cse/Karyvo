import { NextRequest, NextResponse } from "next/server";
import { karyvoAI } from "@/lib/ai/provider";
import { getUser } from "@/lib/auth/getUser";
import { handleApiError } from "@/lib/apiError";
import { rateLimit, RATE_LIMITS } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await getUser(req);

    const { limited } = rateLimit(`ai-bullet:${userId}`, RATE_LIMITS.ai.maxRequests, RATE_LIMITS.ai.windowMs);
    if (limited) {
      return NextResponse.json({ success: false, error: "Too many AI requests. Please wait a moment." }, { status: 429 });
    }

    const body = await req.json();
    const { bullet, context } = body;

    if (!bullet || typeof bullet !== "string") {
      return NextResponse.json({ success: false, error: "Bullet text is required" }, { status: 400 });
    }

    if (bullet.trim().length > 2000) {
      return NextResponse.json({ success: false, error: "Bullet text exceeds maximum limit of 2,000 characters." }, { status: 400 });
    }

    const result = await karyvoAI.improveBullet(bullet, context);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleApiError(error, "POST /api/ai/improve-bullet");
  }
}
