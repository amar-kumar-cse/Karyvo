export type TargetRole =
  | "Software Development Engineer (SDE-1)"
  | "Full-Stack Developer"
  | "Frontend Engineer"
  | "Backend Engineer (Node/Java/Python)"
  | "Data Analyst & Business Intelligence"
  | "AI / Machine Learning Engineer"
  | "DevOps & Cloud Engineer"
  | "Product Manager (Associate PM)"
  | "Quality Assurance & SDET"
  | "Cybersecurity Analyst";

export interface InterviewQuestionItem {
  id: string;
  questionIndex: number;
  category: "Technical" | "Project" | "HR" | "Situational";
  questionText: string;
  userAnswer?: string;
  score?: number; // 0 to 100
  feedbackStrengths?: string[];
  feedbackImprovements?: string[];
  modelAnswer?: string;
}

export interface InterviewSession {
  id: string;
  userId: string;
  targetRole: string;
  status: "active" | "completed";
  questions: InterviewQuestionItem[];
  overallScore?: number;
  summaryFeedback?: string;
  createdAt: string;
  updatedAt: string;
}
