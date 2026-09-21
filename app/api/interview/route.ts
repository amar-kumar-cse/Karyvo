import { NextRequest, NextResponse } from "next/server";
import { karyvoAI } from "@/lib/ai/provider";
import { repository } from "@/lib/db/repository";
import { InterviewSession } from "@/types/interview";
import { getUser } from "@/lib/auth/getUser";
import { handleApiError } from "@/lib/apiError";
import { rateLimit, RATE_LIMITS } from "@/lib/rateLimit";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await getUser(req);
    const sessions = repository.getInterviewSessions();
    return NextResponse.json({ success: true, data: sessions });
  } catch (error) {
    return handleApiError(error, "GET /api/interview");
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await getUser(req);

    const { limited } = rateLimit(`interview:${userId}`, RATE_LIMITS.ai.maxRequests, RATE_LIMITS.ai.windowMs);
    if (limited) {
      return NextResponse.json({ success: false, error: "Too many requests. Please wait a moment." }, { status: 429 });
    }

    const body = await req.json();
    const { targetRole } = body;

    if (!targetRole || typeof targetRole !== "string") {
      return NextResponse.json({ success: false, error: "Target role is required." }, { status: 400 });
    }

    if (targetRole.length > 200) {
      return NextResponse.json({ success: false, error: "Target role must be under 200 characters." }, { status: 400 });
    }

    const profile = repository.getProfile();
    const questions = await karyvoAI.generateInterviewQuestions(targetRole.trim(), profile);

    const session: InterviewSession = {
      id: `int-${crypto.randomUUID()}`,
      userId,
      targetRole: targetRole.trim(),
      status: "active",
      questions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    repository.saveInterviewSession(session);

    return NextResponse.json({ success: true, data: session });
  } catch (error) {
    return handleApiError(error, "POST /api/interview");
  }
}

// L4: DELETE handler for interview sessions
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await getUser(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Session ID is required." }, { status: 400 });
    }

    const deleted = repository.deleteInterviewSession(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Interview session not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Interview session deleted." });
  } catch (error) {
    return handleApiError(error, "DELETE /api/interview");
  }
}

