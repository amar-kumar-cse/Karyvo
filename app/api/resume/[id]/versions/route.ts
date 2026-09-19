import { NextResponse } from "next/server";
import { repository } from "@/lib/db/repository";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const versions = repository.getVersionsByResumeId(id);
    return NextResponse.json({ success: true, data: versions });
  } catch (error) {
    console.error("GET /api/resume/[id]/versions error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch versions." }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await req.json();
    const { versionId } = body;

    if (!versionId) {
      return NextResponse.json({ success: false, error: "Version ID is required." }, { status: 400 });
    }

    const restoredResume = repository.restoreVersion(versionId);
    if (!restoredResume) {
      return NextResponse.json({ success: false, error: "Version could not be found or restored." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: restoredResume });
  } catch (error) {
    console.error("POST /api/resume/[id]/versions restore error:", error);
    return NextResponse.json({ success: false, error: "Failed to restore version." }, { status: 500 });
  }
}
