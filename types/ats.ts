export interface ATSIssue {
  id: string;
  category: "formatting" | "completeness" | "keyword" | "quantification";
  severity: "critical" | "warning" | "tip";
  title: string;
  description: string;
  recommendation: string;
}

export interface ATSScanResult {
  id: string;
  userId?: string;
  resumeId?: string;
  resumeName: string;
  overallScore: number;
  formattingScore: number;
  completenessScore: number;
  keywordStrengthScore: number;
  quantificationScore: number;
  strengths: string[];
  issues: ATSIssue[];
  actionableFixes: string[];
  scannedAt: string;
}
