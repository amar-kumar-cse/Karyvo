export interface EducationItem {
  id: string;
  college: string;
  degree: string;
  branch: string;
  cgpa: string;
  startYear: string;
  graduationYear: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  bullets: string[];
}

export interface ProjectItem {
  id: string;
  title: string;
  techStack: string[];
  liveUrl?: string;
  githubUrl?: string;
  bullets: string[];
}

export interface SkillsData {
  technical: string[];
  frameworks: string[];
  tools: string[];
  soft: string[];
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  credentialUrl?: string;
}

export interface MasterCareerProfile {
  id?: string;
  userId?: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  summary: string;
  isFresherMode: boolean;
  education: EducationItem[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  skills: SkillsData;
  certifications: CertificationItem[];
  achievements: string[];
  currentCtc: string;
  expectedCtc: string;
  noticePeriod: string;
  preferredLocation: string;
  workMode: "Remote" | "Hybrid" | "Onsite";
  orgId?: string;
  createdAt?: string;
  updatedAt?: string;
}
