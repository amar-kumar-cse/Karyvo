import { z } from "zod";

export const EducationItemSchema = z.object({
  id: z.string(),
  college: z.string().min(1, "College name is required"),
  degree: z.string().min(1, "Degree is required"),
  branch: z.string().min(1, "Branch/Field of study is required"),
  cgpa: z.string().min(1, "CGPA or percentage is required"),
  startYear: z.string(),
  graduationYear: z.string().min(4, "Graduation year is required"),
});

export const ExperienceItemSchema = z.object({
  id: z.string(),
  company: z.string().min(1, "Company is required"),
  role: z.string().min(1, "Role title is required"),
  location: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  isCurrent: z.boolean().default(false),
  bullets: z.array(z.string()).default([]),
});

export const ProjectItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Project title is required"),
  techStack: z.array(z.string()).default([]),
  liveUrl: z.string().optional(),
  githubUrl: z.string().optional(),
  bullets: z.array(z.string()).default([]),
});

export const SkillsDataSchema = z.object({
  technical: z.array(z.string()).default([]),
  frameworks: z.array(z.string()).default([]),
  tools: z.array(z.string()).default([]),
  soft: z.array(z.string()).default([]),
});

export const CertificationItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Certification name is required"),
  issuer: z.string().min(1, "Issuer is required"),
  issueDate: z.string(),
  credentialUrl: z.string().optional(),
});

export const MasterCareerProfileSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(5, "Contact number is required"),
  location: z.string().min(2, "Location is required"),
  linkedinUrl: z.string().optional().default(""),
  githubUrl: z.string().optional().default(""),
  portfolioUrl: z.string().optional().default(""),
  summary: z.string().default(""),
  isFresherMode: z.boolean().default(false),
  education: z.array(EducationItemSchema).default([]),
  experience: z.array(ExperienceItemSchema).default([]),
  projects: z.array(ProjectItemSchema).default([]),
  skills: SkillsDataSchema.default({ technical: [], frameworks: [], tools: [], soft: [] }),
  certifications: z.array(CertificationItemSchema).default([]),
  achievements: z.array(z.string()).default([]),
  currentCtc: z.string().default(""),
  expectedCtc: z.string().default(""),
  noticePeriod: z.string().default("Immediate"),
  preferredLocation: z.string().default("Bangalore / Remote"),
  workMode: z.enum(["Remote", "Hybrid", "Onsite"]).default("Hybrid"),
});
