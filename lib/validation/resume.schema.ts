import { z } from "zod";
import {
  EducationItemSchema,
  ExperienceItemSchema,
  ProjectItemSchema,
  SkillsDataSchema,
  CertificationItemSchema,
} from "./profile.schema";

export const ResumePersonalSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string(),
  location: z.string(),
  linkedinUrl: z.string().optional().default(""),
  githubUrl: z.string().optional().default(""),
  portfolioUrl: z.string().optional().default(""),
  summary: z.string().default(""),
});

export const ResumeContentSchema = z.object({
  personal: ResumePersonalSchema,
  education: z.array(EducationItemSchema).default([]),
  experience: z.array(ExperienceItemSchema).default([]),
  projects: z.array(ProjectItemSchema).default([]),
  skills: SkillsDataSchema.default({ technical: [], frameworks: [], tools: [], soft: [] }),
  certifications: z.array(CertificationItemSchema).default([]),
  achievements: z.array(z.string()).default([]),
});

export const SaveResumeRequestSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Resume title is required"),
  targetRole: z.string().min(1, "Target role is required"),
  templateId: z.enum(["modern-tech", "minimal-ats", "executive", "fresher-friendly"]).default("modern-tech"),
  content: ResumeContentSchema,
  isPrimary: z.boolean().default(false),
  createVersion: z.boolean().default(false),
  versionLabel: z.string().optional(),
  changeSummary: z.string().optional(),
});
