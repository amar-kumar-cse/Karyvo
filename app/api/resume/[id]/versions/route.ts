import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/lib/db/repository";
import { getUser } from "@/lib/auth/getUser";
import { handleApiError } from "@/lib/apiError";
import { rateLimit, RATE_LIMITS } from "@/lib/rateLimit";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await getUser(req);
    const { id } = await params;

    const resume = repository.getResumeById(id);
    if (!resume) {
      return NextResponse.json({ success: false, error: "Resume not found." }, { status: 404 });
    }

    const versions = repository.getVersionsByResumeId(id);
    return NextResponse.json({ success: true, data: versions });
  } catch (error) {
    return handleApiError(error, "GET /api/resume/[id]/versions");
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await getUser(req);
    const { id } = await params;

    const { limited } = rateLimit(`version-restore:${userId}`, RATE_LIMITS.standard.maxRequests, RATE_LIMITS.standard.windowMs);
    if (limited) {
      return NextResponse.json({ success: false, error: "Too many requests. Please wait." }, { status: 429 });
    }

    const body = await req.json();
    const { versionId } = body;

    if (!versionId || typeof versionId !== "string") {
      return NextResponse.json({ success: false, error: "Version ID is required." }, { status: 400 });
    }

    // M6: Validate versionId belongs specifically to this resume (id)
    const restoredResume = repository.restoreVersion(versionId, id);
    if (!restoredResume) {
      return NextResponse.json({
        success: false,
        error: "Version not found or does not belong to this resume."
      }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: restoredResume });
  } catch (error) {
    return handleApiError(error, "POST /api/resume/[id]/versions");
  }
}
