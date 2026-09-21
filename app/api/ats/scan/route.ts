import { NextRequest, NextResponse } from "next/server";
import { atsScanner } from "@/lib/ats/scanner";
import { repository } from "@/lib/db/repository";
import { ATSScanRequestSchema } from "@/lib/validation/ats.schema";
import { getUser } from "@/lib/auth/getUser";
import { handleApiError } from "@/lib/apiError";
import { rateLimit, RATE_LIMITS } from "@/lib/rateLimit";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await getUser(req);
    const scans = repository.getATSScans();
    return NextResponse.json({ success: true, data: scans });
  } catch (error) {
    return handleApiError(error, "GET /api/ats/scan");
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await getUser(req);

    const { limited } = rateLimit(`ats-scan:${userId}`, RATE_LIMITS.ai.maxRequests, RATE_LIMITS.ai.windowMs);
    if (limited) {
      return NextResponse.json({ success: false, error: "Too many requests. Please wait a moment." }, { status: 429 });
    }

    const body = await req.json();
    const validated = ATSScanRequestSchema.parse(body);

    const result = atsScanner.analyzeResume(validated.resumeText, validated.resumeName, validated.resumeId);

    repository.saveATSScan(result);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleApiError(error, "POST /api/ats/scan");
  }
}

// L4: DELETE handler for ATS scan results
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await getUser(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Scan ID is required." }, { status: 400 });
    }

    const deleted = repository.deleteATSScan(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "ATS scan not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "ATS scan deleted." });
  } catch (error) {
    return handleApiError(error, "DELETE /api/ats/scan");
  }
}

