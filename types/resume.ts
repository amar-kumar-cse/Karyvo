import { MasterCareerProfile } from "./profile";

export interface ResumePersonal {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  summary: string;
}

export interface ResumeContent {
  personal: ResumePersonal;
  education: MasterCareerProfile["education"];
  experience: MasterCareerProfile["experience"];
  projects: MasterCareerProfile["projects"];
  skills: MasterCareerProfile["skills"];
  certifications: MasterCareerProfile["certifications"];
  achievements: string[];
}

export interface Resume {
  id: string;
  userId: string;
  title: string;
  targetRole: string;
  templateId: "modern-tech" | "minimal-ats" | "executive" | "fresher-friendly";
  content: ResumeContent;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeVersion {
  id: string;
  resumeId: string;
  userId: string;
  versionNumber: number;
  versionLabel: string; // e.g. "Backend Focus", "Fresher Placement", "SDE-2"
  changeSummary?: string;
  snapshot: ResumeContent;
  createdAt: string;
}

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  recommendedFor: string;
}
