import { NextRequest, NextResponse } from "next/server";
import { karyvoAI } from "@/lib/ai/provider";
import { repository } from "@/lib/db/repository";
import { CoverLetter, CoverLetterTone } from "@/types/cover-letter";
import { getUser } from "@/lib/auth/getUser";
import { handleApiError } from "@/lib/apiError";
import { rateLimit, RATE_LIMITS } from "@/lib/rateLimit";
import crypto from "crypto";

// M2: Allowed tone values — validated at runtime
const VALID_TONES: CoverLetterTone[] = [
  "Professional & Polished",
  "Confident & High-Impact",
  "Modern & Creative",
  "Enthusiastic Fresher",
];

export async function GET(req: NextRequest) {
  try {
    const { userId } = await getUser(req);
    const letters = repository.getCoverLetters();
    return NextResponse.json({ success: true, data: letters });
  } catch (error) {
    return handleApiError(error, "GET /api/cover-letter");
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await getUser(req);

    const { limited } = rateLimit(`cover-letter:${userId}`, RATE_LIMITS.ai.maxRequests, RATE_LIMITS.ai.windowMs);
    if (limited) {
      return NextResponse.json({ success: false, error: "Too many requests. Please wait a moment." }, { status: 429 });
    }

    const body = await req.json();
    const { companyName, targetRole, tone, resumeId } = body;

    if (!companyName || !targetRole) {
      return NextResponse.json(
        { success: false, error: "Company name and target role are required." },
        { status: 400 }
      );
    }

    if (typeof companyName !== "string" || typeof targetRole !== "string") {
      return NextResponse.json(
        { success: false, error: "Company name and target role must be strings." },
        { status: 400 }
      );
    }

    if (companyName.length > 150 || targetRole.length > 150) {
      return NextResponse.json(
        { success: false, error: "Company name and target role must each be under 150 characters." },
        { status: 400 }
      );
    }

    // M2: Validate tone against allowed enum values
    const selectedTone: CoverLetterTone = VALID_TONES.includes(tone) ? tone : "Professional & Polished";

    const profile = repository.getProfile();

    const generatedContent = await karyvoAI.generateCoverLetter(
      profile,
      companyName.trim(),
      targetRole.trim(),
      selectedTone
    );

    const newLetter: CoverLetter = {
      id: `cov-${crypto.randomUUID()}`,
      userId,
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
    return handleApiError(error, "POST /api/cover-letter");
  }
}

// L4: DELETE handler
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await getUser(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Cover letter ID is required." }, { status: 400 });
    }

    const deleted = repository.deleteCoverLetter(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Cover letter not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Cover letter deleted." });
  } catch (error) {
    return handleApiError(error, "DELETE /api/cover-letter");
  }
}
