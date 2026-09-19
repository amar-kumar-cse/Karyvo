import { NextResponse } from "next/server";
import { karyvoAI } from "@/lib/ai/provider";
import { repository } from "@/lib/db/repository";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, questionIndex, questionText, userAnswer, category } = body;

    if (!userAnswer || !questionText) {
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
    if (sessionId) {
      const sessions = repository.getInterviewSessions();
      const session = sessions.find((s) => s.id === sessionId);
      if (session && session.questions) {
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
    console.error("POST /api/interview/evaluate error:", error);
    return NextResponse.json({ success: false, error: "Failed to evaluate answer." }, { status: 500 });
  }
}
