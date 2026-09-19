import { NextResponse } from "next/server";
import { karyvoAI } from "@/lib/ai/provider";
import { repository } from "@/lib/db/repository";
import { InterviewSession } from "@/types/interview";

export async function GET() {
  try {
    const sessions = repository.getInterviewSessions();
    return NextResponse.json({ success: true, data: sessions });
  } catch (error) {
    console.error("GET /api/interview error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch interview sessions." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { targetRole } = body;

    if (!targetRole) {
      return NextResponse.json({ success: false, error: "Target role is required." }, { status: 400 });
    }

    const profile = repository.getProfile();
    const questions = await karyvoAI.generateInterviewQuestions(targetRole, profile);

    const session: InterviewSession = {
      id: `int-${Date.now()}`,
      userId: "user-default",
      targetRole,
      status: "active",
      questions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    repository.saveInterviewSession(session);

    return NextResponse.json({ success: true, data: session });
  } catch (error) {
    console.error("POST /api/interview error:", error);
    return NextResponse.json({ success: false, error: "Failed to create interview session." }, { status: 500 });
  }
}
