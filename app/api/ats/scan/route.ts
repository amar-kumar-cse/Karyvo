import { NextResponse } from "next/server";
import { atsScanner } from "@/lib/ats/scanner";
import { repository } from "@/lib/db/repository";
import { ATSScanRequestSchema } from "@/lib/validation/ats.schema";

export async function GET() {
  try {
    const scans = repository.getATSScans();
    return NextResponse.json({ success: true, data: scans });
  } catch (error) {
    console.error("GET /api/ats/scan error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch scan history." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = ATSScanRequestSchema.parse(body);

    const result = atsScanner.analyzeResume(validated.resumeText, validated.resumeName);
    result.resumeId = validated.resumeId;

    repository.saveATSScan(result);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("POST /api/ats/scan error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Invalid resume text for scanning." },
      { status: 400 }
    );
  }
}
