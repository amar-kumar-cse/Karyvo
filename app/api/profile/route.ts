import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/lib/db/repository";
import { MasterCareerProfileSchema } from "@/lib/validation/profile.schema";
import { getUser } from "@/lib/auth/getUser";
import { handleApiError } from "@/lib/apiError";
import { rateLimit, RATE_LIMITS } from "@/lib/rateLimit";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await getUser(req);
    const profile = repository.getProfile();
    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    return handleApiError(error, "GET /api/profile");
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await getUser(req);

    const { limited, remaining } = rateLimit(`profile:${userId}`, RATE_LIMITS.standard.maxRequests, RATE_LIMITS.standard.windowMs);
    if (limited) {
      return NextResponse.json({ success: false, error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await req.json();
    // H4: ZodError is now caught by handleApiError and returns proper 400
    const validated = MasterCareerProfileSchema.parse(body);
    const saved = repository.saveProfile(validated);
    return NextResponse.json({ success: true, data: saved });
  } catch (error) {
    return handleApiError(error, "POST /api/profile");
  }
}
