export type CoverLetterTone =
  | "Professional & Polished"
  | "Confident & High-Impact"
  | "Modern & Creative"
  | "Enthusiastic Fresher";

export interface CoverLetter {
  id: string;
  userId: string;
  resumeId?: string;
  companyName: string;
  targetRole: string;
  tone: CoverLetterTone;
  content: string;
  createdAt: string;
  updatedAt: string;
}
