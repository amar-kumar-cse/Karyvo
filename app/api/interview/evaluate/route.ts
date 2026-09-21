import { NextRequest, NextResponse } from "next/server";
import { karyvoAI } from "@/lib/ai/provider";
import { repository } from "@/lib/db/repository";
import { getUser } from "@/lib/auth/getUser";
import { handleApiError } from "@/lib/apiError";
import { rateLimit, RATE_LIMITS } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await getUser(req);

    const { limited } = rateLimit(`interview-eval:${userId}`, RATE_LIMITS.ai.maxRequests, RATE_LIMITS.ai.windowMs);
    if (limited) {
      return NextResponse.json({ success: false, error: "Too many AI requests. Please wait a moment." }, { status: 429 });
    }

    const body = await req.json();
    const { sessionId, questionIndex, questionText, userAnswer, category } = body;

    if (!userAnswer || typeof userAnswer !== "string" || !questionText || typeof questionText !== "string") {
      return NextResponse.json({ success: false, error: "Question text and user answer are required." }, { status: 400 });
    }

    if (userAnswer.length > 10000 || questionText.length > 2000) {
      return NextResponse.json({ success: false, error: "Input payload exceeds allowed character limits." }, { status: 400 });
    }

    const evaluation = await karyvoAI.evaluateInterviewAnswer(
      questionText,
      userAnswer,
      category || "Technical"
    );

    // If sessionId is present, persist the answer and score into the session
    if (sessionId && typeof sessionId === "string") {
      const sessions = repository.getInterviewSessions();
      const existingSession = sessions.find((s) => s.id === sessionId);
      if (existingSession && existingSession.questions) {
        // H6: Deep copy session to avoid mutating in-memory store in-place
        const session = structuredClone(existingSession);
        const qIndex = typeof questionIndex === "number" ? questionIndex : 0;
        if (session.questions[qIndex]) {
          session.questions[qIndex].userAnswer = userAnswer;
          session.questions[qIndex].score = evaluation.score;
          session.questions[qIndex].feedbackStrengths = evaluation.feedbackStrengths;
          session.questions[qIndex].feedbackImprovements = evaluation.feedbackImprovements;
          session.questions[qIndex].modelAnswer = evaluation.betterAnswer;
        }

        // Calculate running overall score
        const answered = session.questions.filter((q) => typeof q.score === "number");
        if (answered.length > 0) {
          const totalScore = answered.reduce((sum, q) => sum + (q.score || 0), 0);
          session.overallScore = Math.round(totalScore / answered.length);
        }

        repository.saveInterviewSession(session);
      }
    }

    return NextResponse.json({ success: true, data: evaluation });
  } catch (error) {
    return handleApiError(error, "POST /api/interview/evaluate");
  }
}
