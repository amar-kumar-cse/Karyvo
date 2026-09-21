"use client";

import { useState } from "react";
import { InterviewSession, TargetRole, InterviewQuestionItem } from "@/types/interview";
import {
  GlassCard,
  GlassPanel,
  GlassButton,
  GlassTextarea,
  GlassBadge,
} from "@/components/ui/glass";
import {
  Headphones,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Send,
  Award,
  BookOpen,
  RotateCcw,
} from "lucide-react";

const TARGET_ROLES: TargetRole[] = [
  "Software Development Engineer (SDE-1)",
  "Full-Stack Developer",
  "Frontend Engineer",
  "Backend Engineer (Node/Java/Python)",
  "Data Analyst & Business Intelligence",
  "AI / Machine Learning Engineer",
  "DevOps & Cloud Engineer",
  "Product Manager (Associate PM)",
  "Quality Assurance & SDET",
  "Cybersecurity Analyst",
];

interface Props {
  initialSessions: InterviewSession[];
}

export function InterviewWorkspace({ initialSessions }: Props) {
  const [selectedRole, setSelectedRole] = useState<TargetRole>(TARGET_ROLES[0]);
  const [activeSession, setActiveSession] = useState<InterviewSession | null>(
    initialSessions.length > 0 ? initialSessions[0] : null
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [isStarting, setIsStarting] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<{
    score: number;
    feedbackStrengths: string[];
    feedbackImprovements: string[];
    betterAnswer: string;
  } | null>(null);

  // Start new mock interview session
  const handleStartSession = async () => {
    setIsStarting(true);
    setEvaluationResult(null);
    setUserAnswer("");
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRole: selectedRole }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setActiveSession(data.data);
        setCurrentQuestionIndex(0);
      }
    } catch (err) {
      console.error("Start interview error:", err);
    } finally {
      setIsStarting(false);
    }
  };

  // Submit Answer for AI Evaluation
  const handleSubmitAnswer = async () => {
    if (!activeSession || !userAnswer.trim()) return;
    const currentQuestion = activeSession.questions[currentQuestionIndex];
    if (!currentQuestion) return;

    setIsEvaluating(true);
    try {
      const res = await fetch("/api/interview/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSession.id,
          questionIndex: currentQuestionIndex,
          questionText: currentQuestion.questionText,
          userAnswer,
          category: currentQuestion.category,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setEvaluationResult(data.data);

        // Update local session question
        const updatedQuestions = [...activeSession.questions];
        updatedQuestions[currentQuestionIndex] = {
          ...currentQuestion,
          userAnswer,
          score: data.data.score,
          feedbackStrengths: data.data.feedbackStrengths,
          feedbackImprovements: data.data.feedbackImprovements,
          modelAnswer: data.data.betterAnswer,
        };
        setActiveSession({ ...activeSession, questions: updatedQuestions });
      }
    } catch (err) {
      console.error("Evaluate answer error:", err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    if (!activeSession) return;
    if (currentQuestionIndex < activeSession.questions.length - 1) {
      const nextIdx = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIdx);
      const nextQ = activeSession.questions[nextIdx];
      setUserAnswer(nextQ.userAnswer || "");
      if (nextQ.score) {
        setEvaluationResult({
          score: nextQ.score,
          feedbackStrengths: nextQ.feedbackStrengths || [],
          feedbackImprovements: nextQ.feedbackImprovements || [],
          betterAnswer: nextQ.modelAnswer || "",
        });
      } else {
        setEvaluationResult(null);
      }
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-heading">
              Role-Driven Interview AI
            </h1>
            <GlassBadge variant="violet" className="font-heading inline-flex items-center gap-1.5">
              <Headphones className="h-3 w-3 text-indigo-600" aria-hidden="true" />
              <span>Role Simulator</span>
            </GlassBadge>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            Select your target engineering or product role. Practice realistic questions and receive instant scoring, strengths, improvements, and model answers.
          </p>
        </div>
      </div>

      {/* Role Selector & Launcher */}
      <GlassCard className="p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-2/3 space-y-1">
          <label className="text-xs font-bold text-slate-700 block font-heading">
            Target Interview Role
          </label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as TargetRole)}
            className="w-full bg-white/95 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 font-medium focus:outline-none focus:border-indigo-500 shadow-sm"
          >
            {TARGET_ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        {activeSession ? (
          <GlassButton
            variant="secondary"
            size="md"
            onClick={handleStartSession}
            disabled={isStarting}
            loading={isStarting}
            className="w-full sm:w-auto shrink-0"
            title="Switch target role or reset session"
          >
            <RotateCcw className="h-4 w-4 text-slate-500" aria-hidden="true" />
            <span>{isStarting ? "Switching Role..." : "Reset / Change Role"}</span>
          </GlassButton>
        ) : (
          <GlassButton
            variant="primary"
            size="lg"
            onClick={handleStartSession}
            disabled={isStarting}
            loading={isStarting}
            className="w-full sm:w-auto shrink-0"
          >
            <Sparkles className="h-4 w-4 text-amber-300" aria-hidden="true" />
            <span>{isStarting ? "Assembling Interview..." : "Start Mock Interview"}</span>
          </GlassButton>
        )}
      </GlassCard>

      {/* Interactive Mock Interview Room */}
      {activeSession && activeSession.questions.length > 0 && (
        <div className="space-y-6">
          {/* Question Card with Integrated Stepper */}
          <GlassCard className="p-0 overflow-hidden space-y-0">
            {/* Integrated Question Stepper Tabs Bar */}
            <div className="flex items-center gap-2 overflow-x-auto px-6 py-3.5 bg-slate-50/90 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-heading shrink-0 mr-1">
                Questions:
              </span>
              <div className="flex items-center gap-2" role="tablist" aria-label="Interview Questions">
                {activeSession.questions.map((q, idx) => (
                  <button
                    key={q.id}
                    role="tab"
                    aria-selected={currentQuestionIndex === idx}
                    onClick={() => {
                      setCurrentQuestionIndex(idx);
                      setUserAnswer(q.userAnswer || "");
                      if (q.score) {
                        setEvaluationResult({
                          score: q.score,
                          feedbackStrengths: q.feedbackStrengths || [],
                          feedbackImprovements: q.feedbackImprovements || [],
                          betterAnswer: q.modelAnswer || "",
                        });
                      } else {
                        setEvaluationResult(null);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap ${
                      currentQuestionIndex === idx
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : q.score
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span className="font-heading">Q{idx + 1}</span>
                    <span className="text-[10px] opacity-80">({q.category})</span>
                    {q.score && (
                      <span className="font-heading text-[10px] text-emerald-600 font-extrabold">{q.score}%</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Body */}
            <div className="p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <GlassBadge variant="violet" className="font-heading text-xs uppercase">
                  {activeSession.questions[currentQuestionIndex].category} Round
                </GlassBadge>
                <span className="text-xs text-slate-500 font-medium">
                  Question {currentQuestionIndex + 1} of {activeSession.questions.length}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-heading leading-snug">
                {activeSession.questions[currentQuestionIndex].questionText}
              </h2>

              {/* Answer Input */}
              <div className="space-y-2">
                <label className="text-xs text-slate-700 font-medium block">
                  Your Answer (Explain context, engineering methodology, and measured outcomes)
                </label>
                <GlassTextarea
                  rows={5}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your structured answer here... (e.g., 'When handling this scenario, I first isolate the telemetry...')"
                />
              </div>

              {/* Submit & Navigation Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <GlassButton
                  variant="primary"
                  size="md"
                  onClick={handleSubmitAnswer}
                  disabled={isEvaluating || !userAnswer.trim()}
                  loading={isEvaluating}
                  className={`w-full sm:w-auto transition-all ${
                    !userAnswer.trim()
                      ? "opacity-40 grayscale contrast-75 shadow-none border-slate-300 pointer-events-none"
                      : ""
                  }`}
                  title={!userAnswer.trim() ? "Type your answer above to submit for AI evaluation" : undefined}
                >
                  <Send className="h-4 w-4" />
                  <span>{isEvaluating ? "Evaluating..." : "Submit Answer For AI Review"}</span>
                </GlassButton>

                {currentQuestionIndex < activeSession.questions.length - 1 && (
                  <GlassButton
                    variant="secondary"
                    size="md"
                    onClick={handleNextQuestion}
                    className="w-full sm:w-auto"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="h-4 w-4" />
                  </GlassButton>
                )}
              </div>
            </div>
          </GlassCard>

          {/* AI Feedback Card */}
          {evaluationResult && (
            <GlassCard className="p-6 sm:p-8 border-indigo-500/30 space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-500" />
                  <h3 className="text-base font-bold text-slate-900 font-heading">AI Evaluation Breakdown</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600">Response Score:</span>
                  <span
                    className={`font-heading text-base font-extrabold px-2.5 py-0.5 rounded-xl border ${evaluationResult.score >= 80
                        ? "text-emerald-700 border-emerald-300 bg-emerald-50"
                        : evaluationResult.score >= 60
                          ? "text-indigo-700 border-indigo-300 bg-indigo-50"
                          : "text-amber-700 border-amber-300 bg-amber-50"
                      }`}
                  >
                    {evaluationResult.score}/100
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Strengths */}
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                  <span className="text-xs font-bold text-emerald-800 font-heading flex items-center gap-1.5 uppercase tracking-wider">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Strengths
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {evaluationResult.feedbackStrengths.map((str, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Improvements */}
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
                  <span className="text-xs font-bold text-amber-800 font-heading flex items-center gap-1.5 uppercase tracking-wider">
                    <AlertCircle className="h-4 w-4 text-amber-600" /> Areas For Improvement
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {evaluationResult.feedbackImprovements.map((imp, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Model Benchmark Answer */}
              {evaluationResult.betterAnswer && (
                <div className="p-4 rounded-xl bg-white/90 border border-slate-200 space-y-2 shadow-inner">
                  <span className="text-xs font-bold text-slate-800 font-heading flex items-center gap-1.5 uppercase tracking-wider">
                    <BookOpen className="h-4 w-4 text-indigo-600" /> Top-Percentile Model Answer
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans select-text">
                    {evaluationResult.betterAnswer}
                  </p>
                </div>
              )}
            </GlassCard>
          )}
        </div>
      )}
    </div>
  );
}
