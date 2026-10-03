import { z } from "zod";

export const EducationItemSchema = z.object({
  id: z.string().max(100),
  college: z.string().min(1, "College name is required").max(200),
  degree: z.string().min(1, "Degree is required").max(100),
  branch: z.string().min(1, "Branch/Field of study is required").max(100),
  cgpa: z.string().min(1, "CGPA or percentage is required").max(50),
  startYear: z.string().max(20),
  graduationYear: z.string().min(4, "Graduation year is required").max(20),
});

export const ExperienceItemSchema = z.object({
  id: z.string().max(100),
  company: z.string().min(1, "Company is required").max(150),
  role: z.string().min(1, "Role title is required").max(150),
  location: z.string().max(150),
  startDate: z.string().max(50),
  endDate: z.string().max(50),
  isCurrent: z.boolean().default(false),
  bullets: z.array(z.string().max(1000)).max(30).default([]),
});

export const ProjectItemSchema = z.object({
  id: z.string().max(100),
  title: z.string().min(1, "Project title is required").max(150),
  techStack: z.array(z.string().max(50)).max(30).default([]),
  liveUrl: z.string().max(500).optional(),
  githubUrl: z.string().max(500).optional(),
  bullets: z.array(z.string().max(1000)).max(30).default([]),
});

export const SkillsDataSchema = z.object({
  technical: z.array(z.string().max(50)).max(50).default([]),
  frameworks: z.array(z.string().max(50)).max(50).default([]),
  tools: z.array(z.string().max(50)).max(50).default([]),
  soft: z.array(z.string().max(50)).max(50).default([]),
});

export const CertificationItemSchema = z.object({
  id: z.string().max(100),
  name: z.string().min(1, "Certification name is required").max(150),
  issuer: z.string().min(1, "Issuer is required").max(150),
  issueDate: z.string().max(50),
  credentialUrl: z.string().max(500).optional(),
});

export const MasterCareerProfileSchema = z.object({
  fullName: z.string().min(2, "Full name is required").max(100),
  email: z.string().email("Valid email is required").max(150),
  phone: z.string().min(5, "Contact number is required").max(30),
  location: z.string().min(2, "Location is required").max(100),
  linkedinUrl: z.string().max(300).optional().default(""),
  githubUrl: z.string().max(300).optional().default(""),
  portfolioUrl: z.string().max(300).optional().default(""),
  summary: z.string().max(3000).default(""),
  isFresherMode: z.boolean().default(false),
  education: z.array(EducationItemSchema).max(20).default([]),
  experience: z.array(ExperienceItemSchema).max(30).default([]),
  projects: z.array(ProjectItemSchema).max(30).default([]),
  skills: SkillsDataSchema.default({ technical: [], frameworks: [], tools: [], soft: [] }),
  certifications: z.array(CertificationItemSchema).max(30).default([]),
  achievements: z.array(z.string().max(500)).max(50).default([]),
  currentCtc: z.string().max(50).default(""),
  expectedCtc: z.string().max(50).default(""),
  noticePeriod: z.string().max(50).default("Immediate"),
  preferredLocation: z.string().max(100).default("Bangalore / Remote"),
  workMode: z.enum(["Remote", "Hybrid", "Onsite"]).default("Hybrid"),
});
