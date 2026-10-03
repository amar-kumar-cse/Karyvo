import { z } from "zod";
import {
  EducationItemSchema,
  ExperienceItemSchema,
  ProjectItemSchema,
  SkillsDataSchema,
  CertificationItemSchema,
} from "./profile.schema";

export const ResumePersonalSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email().max(150),
  phone: z.string().max(30),
  location: z.string().max(100),
  linkedinUrl: z.string().max(300).optional().default(""),
  githubUrl: z.string().max(300).optional().default(""),
  portfolioUrl: z.string().max(300).optional().default(""),
  summary: z.string().max(3000).default(""),
});

export const ResumeContentSchema = z.object({
  personal: ResumePersonalSchema,
  education: z.array(EducationItemSchema).max(20).default([]),
  experience: z.array(ExperienceItemSchema).max(30).default([]),
  projects: z.array(ProjectItemSchema).max(30).default([]),
  skills: SkillsDataSchema.default({ technical: [], frameworks: [], tools: [], soft: [] }),
  certifications: z.array(CertificationItemSchema).max(30).default([]),
  achievements: z.array(z.string().max(500)).max(50).default([]),
});

export const SaveResumeRequestSchema = z.object({
  id: z.string().max(100).optional(),
  title: z.string().min(1, "Resume title is required").max(150),
  targetRole: z.string().min(1, "Target role is required").max(150),
  templateId: z.enum(["modern-tech", "minimal-ats", "executive", "fresher-friendly"]).default("modern-tech"),
  content: ResumeContentSchema,
  isPrimary: z.boolean().default(false),
  createVersion: z.boolean().default(false),
  versionLabel: z.string().max(100).optional(),
  changeSummary: z.string().max(500).optional(),
});
