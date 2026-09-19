import { NextResponse } from "next/server";
import { karyvoAI } from "@/lib/ai/provider";
import { repository } from "@/lib/db/repository";
import { CoverLetter, CoverLetterTone } from "@/types/cover-letter";

export async function GET() {
  try {
    const letters = repository.getCoverLetters();
    return NextResponse.json({ success: true, data: letters });
  } catch (error) {
    console.error("GET /api/cover-letter error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch cover letters." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { companyName, targetRole, tone, resumeId } = body;

    if (!companyName || !targetRole) {
      return NextResponse.json(
        { success: false, error: "Company name and target role are required." },
        { status: 400 }
      );
    }

    if (companyName.length > 150 || targetRole.length > 150) {
      return NextResponse.json(
        { success: false, error: "Company name and target role must each be under 150 characters." },
        { status: 400 }
      );
    }

    const profile = repository.getProfile();
    const selectedTone: CoverLetterTone = tone || "Professional & Polished";

    const generatedContent = await karyvoAI.generateCoverLetter(
      profile,
      companyName.trim(),
      targetRole.trim(),
      selectedTone
    );

    const newLetter: CoverLetter = {
      id: `cov-${Date.now()}`,
      userId: "user-default",
      resumeId: resumeId || undefined,
      companyName: companyName.trim(),
      targetRole: targetRole.trim(),
      tone: selectedTone,
      content: generatedContent,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    repository.saveCoverLetter(newLetter);

    return NextResponse.json({ success: true, data: newLetter });
  } catch (error) {
    console.error("POST /api/cover-letter error:", error);
    return NextResponse.json({ success: false, error: "Failed to generate cover letter." }, { status: 500 });
  }
}
