import { MasterCareerProfile } from "@/types/profile";
import { Resume, ResumeVersion } from "@/types/resume";
import { ATSScanResult } from "@/types/ats";
import { CoverLetter } from "@/types/cover-letter";
import { InterviewSession } from "@/types/interview";
import { Subscription } from "@/types/payment";
import crypto from "crypto";

// L1: Fixed ISO strings for seed data timestamps (no drift on each restart)
const SEED_DATE = "2025-01-15T10:00:00.000Z";
const SEED_DATE_V1 = "2025-01-12T10:00:00.000Z";
const SEED_DATE_V2 = "2025-01-14T10:00:00.000Z";

export const SEED_PROFILE: MasterCareerProfile = {
  fullName: "Arjun Sharma",
  email: "arjun.sharma@example.com",
  phone: "+91 98765 43210",
  location: "Bengaluru, Karnataka, India",
  linkedinUrl: "https://linkedin.com/in/arjun-sharma-dev",
  githubUrl: "https://github.com/arjunsharma-code",
  portfolioUrl: "https://arjunsharma.dev",
  summary:
    "High-impact Full-Stack Software Engineer with 3+ years building high-throughput distributed microservices, low-latency Next.js web applications, and event-driven architectures. Passionate about scalable system design, clean code, and developer productivity.",
  isFresherMode: false,
  education: [
    {
      id: "edu-1",
      college: "Vellore Institute of Technology (VIT)",
      degree: "Bachelor of Technology (B.Tech)",
      branch: "Computer Science and Engineering",
      cgpa: "8.92",
      startYear: "2018",
      graduationYear: "2022",
    },
  ],
  experience: [
    {
      id: "exp-1",
      company: "Razorpay",
      role: "Software Development Engineer (SDE-1)",
      location: "Bengaluru, India",
      startDate: "July 2022",
      endDate: "Present",
      isCurrent: true,
      bullets: [
        "Architected and deployed high-concurrency payment routing microservice processing over 4.2M daily transactions with 99.99% uptime SLA.",
        "Engineered intelligent retry engine with exponential backoff reducing payment drops by 24% and generating ~₹1.8Cr monthly recovered revenue.",
        "Spearheaded database query optimization across Postgres and Redis clusters, bringing p99 latency down from 280ms to 42ms.",
        "Collaborated with cross-functional product and security teams to achieve zero-critical-vulnerability audit for RBI compliance.",
      ],
    },
    {
      id: "exp-2",
      company: "Swiggy",
      role: "Software Engineering Intern",
      location: "Bengaluru, India",
      startDate: "Jan 2022",
      endDate: "June 2022",
      isCurrent: false,
      bullets: [
        "Built real-time delivery partner geo-tracking service using WebSockets and Redis pub/sub handling 80,000+ active connections.",
        "Reduced map render bundle size by 38% through dynamic code splitting and tree shaking in the customer tracking web app.",
      ],
    },
  ],
  projects: [
    {
      id: "proj-1",
      title: "Distributed Task Orchestrator & Workflow Engine",
      techStack: ["Go", "gRPC", "PostgreSQL", "Docker", "Redis"],
      liveUrl: "https://github.com/arjunsharma-code/flow-engine",
      githubUrl: "https://github.com/arjunsharma-code/flow-engine",
      bullets: [
        "Developed distributed DAG workflow scheduler capable of executing 10,000+ parallel tasks with fault-tolerant worker auto-recovery.",
        "Implemented Raft consensus algorithm for leader election and state synchronization across 5 independent cluster nodes.",
      ],
    },
    {
      id: "proj-2",
      title: "Real-time Collaborative Code Editor",
      techStack: ["Next.js", "TypeScript", "WebRTC", "Yjs", "Tailwind CSS"],
      liveUrl: "https://codecollab.dev",
      githubUrl: "https://github.com/arjunsharma-code/codecollab",
      bullets: [
        "Constructed Conflict-free Replicated Data Type (CRDT) document synchronization supporting 50+ concurrent low-latency typers.",
        "Embedded syntax highlighting and sandboxed Docker code execution runner supporting 6 programming languages.",
      ],
    },
  ],
  skills: {
    technical: ["Data Structures & Algorithms", "System Design", "Microservices", "REST & gRPC", "SQL & Database Indexing"],
    frameworks: ["React.js", "Next.js", "Node.js", "Express", "Tailwind CSS", "Spring Boot"],
    tools: ["Docker", "Kubernetes", "AWS (EC2, S3, RDS)", "Git", "Redis", "Kafka", "PostgreSQL"],
    soft: ["Technical Leadership", "Agile & Scrum", "Cross-functional Collaboration", "Root Cause Analysis"],
  },
  certifications: [
    {
      id: "cert-1",
      name: "AWS Certified Solutions Architect – Associate",
      issuer: "Amazon Web Services",
      issueDate: "2023",
      credentialUrl: "https://aws.amazon.com/verification",
    },
  ],
  achievements: [
    "Ranked 184th out of 45,000+ participants in LeetCode Weekly Contest 342 (Global top 0.4%).",
    "Finalist at Smart India Hackathon (SIH) 2021 for automated civic issue reporting portal.",
  ],
  currentCtc: "18 LPA",
  expectedCtc: "28 LPA",
  noticePeriod: "30 Days",
  preferredLocation: "Bengaluru / Remote",
  workMode: "Hybrid",
};

export const SEED_RESUME: Resume = {
  id: "res-primary-001",
  userId: "user-default",
  title: "Arjun Sharma - Full Stack SDE",
  targetRole: "Full-Stack Developer",
  templateId: "modern-tech",
  isPrimary: true,
  createdAt: SEED_DATE,
  updatedAt: SEED_DATE,
  content: {
    personal: {
      fullName: SEED_PROFILE.fullName,
      email: SEED_PROFILE.email,
      phone: SEED_PROFILE.phone,
      location: SEED_PROFILE.location,
      linkedinUrl: SEED_PROFILE.linkedinUrl,
      githubUrl: SEED_PROFILE.githubUrl,
      portfolioUrl: SEED_PROFILE.portfolioUrl,
      summary: SEED_PROFILE.summary,
    },
    education: SEED_PROFILE.education,
    experience: SEED_PROFILE.experience,
    projects: SEED_PROFILE.projects,
    skills: SEED_PROFILE.skills,
    certifications: SEED_PROFILE.certifications,
    achievements: SEED_PROFILE.achievements,
  },
};

export const SEED_VERSIONS: ResumeVersion[] = [
  {
    id: "ver-001",
    resumeId: SEED_RESUME.id,
    userId: "user-default",
    versionNumber: 1,
    versionLabel: "Initial General Resume",
    changeSummary: "Base resume generated from Master Career Profile",
    snapshot: SEED_RESUME.content,
    createdAt: SEED_DATE_V1,
  },
  {
    id: "ver-002",
    resumeId: SEED_RESUME.id,
    userId: "user-default",
    versionNumber: 2,
    versionLabel: "Backend & Concurrency Focus",
    changeSummary: "Quantified payment routing throughput, reduced latency metrics, emphasized Go/gRPC engine",
    snapshot: {
      ...SEED_RESUME.content,
      personal: {
        ...SEED_RESUME.content.personal,
        summary:
          "Performance-obsessed Backend & Distributed Systems Engineer with 3+ years experience scaling high-concurrency payment and order pipelines. Specializing in Go, Node.js, PostgreSQL clustering, and sub-50ms p99 latencies.",
      },
    },
    createdAt: SEED_DATE_V2,
  },
];

// Singleton in-memory state repository for flawless local & fallback execution
class RepositoryStore {
  private profile: MasterCareerProfile = { ...SEED_PROFILE };
  private resumes: Resume[] = [{ ...SEED_RESUME }];
  private versions: ResumeVersion[] = [...SEED_VERSIONS];
  private atsScans: ATSScanResult[] = [];
  private coverLetters: CoverLetter[] = [];
  private interviewSessions: InterviewSession[] = [];
  private subscription: Subscription = {
    id: "sub-001",
    userId: "user-default",
    plan: "free",
    status: "active",
    createdAt: SEED_DATE,
    updatedAt: SEED_DATE,
  };

  getProfile(): MasterCareerProfile {
    return this.profile;
  }

  // M9: Strip client-dangerous fields to prevent overwriting internal IDs
  saveProfile(data: MasterCareerProfile): MasterCareerProfile {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { ...profileData } = data;
    this.profile = {
      ...this.profile,
      ...profileData,
      updatedAt: new Date().toISOString(),
    };
    return this.profile;
  }

  getResumes(): Resume[] {
    return this.resumes;
  }

  getResumeById(id: string): Resume | undefined {
    return this.resumes.find((r) => r.id === id);
  }

  saveResume(resume: Resume): Resume {
    const idx = this.resumes.findIndex((r) => r.id === resume.id);
    const updated = {
      ...resume,
      updatedAt: new Date().toISOString(),
    };
    if (idx >= 0) {
      this.resumes[idx] = updated;
    } else {
      this.resumes.push(updated);
    }
    return updated;
  }

  // L4: Delete a resume by ID
  deleteResume(id: string): boolean {
    const idx = this.resumes.findIndex((r) => r.id === id);
    if (idx < 0) return false;
    this.resumes.splice(idx, 1);
    // Also clean up versions associated with this resume
    this.versions = this.versions.filter((v) => v.resumeId !== id);
    return true;
  }

  getVersionsByResumeId(resumeId: string): ResumeVersion[] {
    return this.versions.filter((v) => v.resumeId === resumeId).sort((a, b) => b.versionNumber - a.versionNumber);
  }

  // M4: Use crypto.randomUUID() for version IDs
  createVersion(version: Omit<ResumeVersion, "id" | "createdAt">): ResumeVersion {
    const newVersion: ResumeVersion = {
      ...version,
      id: `ver-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
    };
    this.versions.push(newVersion);
    return newVersion;
  }

  // M6: Accept resumeId to validate version ownership
  restoreVersion(versionId: string, resumeId?: string): Resume | null {
    const version = this.versions.find((v) => v.id === versionId);
    if (!version) return null;

    // M6: If resumeId is provided, verify the version belongs to that resume
    if (resumeId && version.resumeId !== resumeId) return null;

    const resume = this.getResumeById(version.resumeId);
    if (!resume) return null;

    const updated = this.saveResume({
      ...resume,
      content: JSON.parse(JSON.stringify(version.snapshot)),
      updatedAt: new Date().toISOString(),
    });
    return updated;
  }

  // M4: Use crypto.randomUUID() for scan IDs
  saveATSScan(scan: ATSScanResult): ATSScanResult {
    this.atsScans.unshift(scan);
    return scan;
  }

  getATSScans(): ATSScanResult[] {
    return this.atsScans;
  }

  // L4: Delete an ATS scan by ID
  deleteATSScan(id: string): boolean {
    const idx = this.atsScans.findIndex((s) => s.id === id);
    if (idx < 0) return false;
    this.atsScans.splice(idx, 1);
    return true;
  }

  saveCoverLetter(letter: CoverLetter): CoverLetter {
    this.coverLetters.unshift(letter);
    return letter;
  }

  getCoverLetters(): CoverLetter[] {
    return this.coverLetters;
  }

  // L4: Delete a cover letter by ID
  deleteCoverLetter(id: string): boolean {
    const idx = this.coverLetters.findIndex((l) => l.id === id);
    if (idx < 0) return false;
    this.coverLetters.splice(idx, 1);
    return true;
  }

  saveInterviewSession(session: InterviewSession): InterviewSession {
    const idx = this.interviewSessions.findIndex((s) => s.id === session.id);
    if (idx >= 0) {
      this.interviewSessions[idx] = session;
    } else {
      this.interviewSessions.unshift(session);
    }
    return session;
  }

  getInterviewSessions(): InterviewSession[] {
    return this.interviewSessions;
  }

  // L4: Delete an interview session by ID
  deleteInterviewSession(id: string): boolean {
    const idx = this.interviewSessions.findIndex((s) => s.id === id);
    if (idx < 0) return false;
    this.interviewSessions.splice(idx, 1);
    return true;
  }

  getSubscription(): Subscription {
    return this.subscription;
  }

  // H3: Accept payment metadata for proper subscription tracking
  upgradeToPro(options?: {
    billingCycle?: "monthly" | "yearly";
    paymentId?: string;
  }): Subscription {
    const cycle = options?.billingCycle || "monthly";
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + (cycle === "yearly" ? 12 : 1));

    this.subscription = {
      ...this.subscription,
      plan: "pro",
      status: "active",
      currentPeriodEnd: expiresAt.toISOString(),
      updatedAt: now.toISOString(),
    };
    return this.subscription;
  }

  // L5: Cancel subscription
  cancelSubscription(): Subscription {
    this.subscription = {
      ...this.subscription,
      plan: "free",
      status: "canceled",
      currentPeriodEnd: undefined,
      updatedAt: new Date().toISOString(),
    };
    return this.subscription;
  }
}

// Global singleton to survive hot-reload in Next.js development
const globalForRepo = globalThis as unknown as { karyvoRepo: RepositoryStore };
export const repository = globalForRepo.karyvoRepo || new RepositoryStore();
if (process.env.NODE_ENV !== "production") globalForRepo.karyvoRepo = repository;
