import { MasterCareerProfile } from "@/types/profile";
import { Resume, ResumeVersion } from "@/types/resume";
import { ATSScanResult } from "@/types/ats";
import { CoverLetter } from "@/types/cover-letter";
import { InterviewSession } from "@/types/interview";
import { Subscription } from "@/types/payment";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { DEMO_USER_ID, isDemoMode } from "@/lib/auth/config";
import crypto from "crypto";

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
    "1st Place – Smart India Hackathon (SIH 2021): Led 6-member team building an automated disaster response tracking dashboard for NDRF (2021).",
  ],
  currentCtc: "18 LPA",
  expectedCtc: "26 LPA",
  noticePeriod: "30 Days (Negotiable)",
  preferredLocation: "Bengaluru / Hyderabad / Remote",
  workMode: "Hybrid",
};

export function createEmptyProfile(userId: string): MasterCareerProfile {
  const now = new Date().toISOString();
  return {
    userId,
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: "",
    summary: "",
    isFresherMode: false,
    education: [],
    experience: [],
    projects: [],
    skills: { technical: [], frameworks: [], tools: [], soft: [] },
    certifications: [],
    achievements: [],
    currentCtc: "",
    expectedCtc: "",
    noticePeriod: "",
    preferredLocation: "",
    workMode: "Remote",
    createdAt: now,
    updatedAt: now,
  };
}

export const SEED_RESUME: Resume = {
  id: "res-default-01",
  userId: DEMO_USER_ID,
  title: "Full-Stack SDE Resume (Target: Tier-1 Tech)",
  targetRole: "Senior Software Engineer (Full Stack)",
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
    resumeId: "res-default-01",
    userId: DEMO_USER_ID,
    versionNumber: 1,
    versionLabel: "Initial Baseline Draft",
    changeSummary: "First import from master profile",
    snapshot: SEED_RESUME.content,
    createdAt: SEED_DATE_V1,
  },
  {
    id: "ver-002",
    resumeId: "res-default-01",
    userId: DEMO_USER_ID,
    versionNumber: 2,
    versionLabel: "Metrics & XYZ Quantification Added",
    changeSummary: "Enhanced bullet points with quantifiable performance and revenue outcomes",
    snapshot: SEED_RESUME.content,
    createdAt: SEED_DATE_V2,
  },
];

export interface PaymentOrderRecord {
  id: string;
  userId: string;
  plan: string;
  billingCycle: "monthly" | "yearly";
  amount: number;
  currency: string;
  status: "created" | "paid" | "failed";
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  createdAt: string;
  updatedAt: string;
}

export class RepositoryStore {
  private supabase: SupabaseClient | null = null;

  // In-Memory Multi-Tenant Store (Used for offline dev / demo mode / unit tests)
  private profiles = new Map<string, MasterCareerProfile>();
  private resumes = new Map<string, Resume>();
  private versions: ResumeVersion[] = [];
  private atsScans = new Map<string, ATSScanResult>();
  private coverLetters = new Map<string, CoverLetter>();
  private interviewSessions = new Map<string, InterviewSession>();
  private subscriptions = new Map<string, Subscription>();
  private orders = new Map<string, PaymentOrderRecord>();

  constructor() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (url && key && !url.includes("your-project") && key !== "your-anon-key") {
      try {
        this.supabase = createClient(url, key, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
      } catch (err) {
        console.warn("Could not connect to Supabase, fallback to memory store:", err);
      }
    }

    // Seed demo tenant in-memory store
    this.profiles.set(DEMO_USER_ID, { ...SEED_PROFILE, userId: DEMO_USER_ID });
    this.resumes.set(SEED_RESUME.id, { ...SEED_RESUME });
    this.versions = [...SEED_VERSIONS];
    this.subscriptions.set(DEMO_USER_ID, {
      id: "sub-001",
      userId: DEMO_USER_ID,
      plan: "free",
      status: "active",
      createdAt: SEED_DATE,
      updatedAt: SEED_DATE,
    });
  }

  private logDbError(operation: string, error: unknown) {
    if (!error) return;
    const postgrestErr = error as { code?: string; message?: string; details?: string; hint?: string };
    const message =
      postgrestErr.message ||
      postgrestErr.details ||
      postgrestErr.code ||
      (error instanceof Error ? error.message : JSON.stringify(error));
    console.error(`[Karyvo DB Error] ${operation}:`, message);
  }

  // ==========================================
  // PROFILE (Multi-Tenant)
  // ==========================================
  async getProfile(userId: string): Promise<MasterCareerProfile> {
    if (this.supabase) {
      const { data, error } = await this.supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        this.logDbError("getProfile", error);
        throw new Error(`Database error retrieving profile: ${error.message}`);
      }

      if (data) {
        return {
          userId: data.user_id,
          fullName: data.full_name || "",
          email: data.email || "",
          phone: data.phone || "",
          location: data.location || "",
          linkedinUrl: data.linkedin_url || "",
          githubUrl: data.github_url || "",
          portfolioUrl: data.portfolio_url || "",
          summary: data.summary || "",
          isFresherMode: Boolean(data.is_fresher_mode),
          education: data.education || [],
          experience: data.experience || [],
          projects: data.projects || [],
          skills: data.skills || { technical: [], frameworks: [], tools: [], soft: [] },
          certifications: data.certifications || [],
          achievements: data.achievements || [],
          currentCtc: data.current_ctc || "",
          expectedCtc: data.expected_ctc || "",
          noticePeriod: data.notice_period || "",
          preferredLocation: data.preferred_location || "",
          workMode: data.work_mode || "Remote",
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }

      // New user with no profile record in DB gets an empty profile (NOT fictional seed profile!)
      if (isDemoMode() || userId === DEMO_USER_ID) {
        return { ...SEED_PROFILE, userId };
      }
      return createEmptyProfile(userId);
    }

    // In-memory fallback (only when Supabase credentials are absent)
    let profile = this.profiles.get(userId);
    if (!profile) {
      if (isDemoMode() || userId === DEMO_USER_ID) {
        profile = { ...SEED_PROFILE, userId };
      } else {
        profile = createEmptyProfile(userId);
      }
      this.profiles.set(userId, profile);
    }
    return profile;
  }

  async saveProfile(userId: string, data: MasterCareerProfile): Promise<MasterCareerProfile> {
    const now = new Date().toISOString();
    const sanitized: MasterCareerProfile = {
      ...data,
      userId,
      updatedAt: now,
    };

    if (this.supabase) {
      const { error } = await this.supabase.from("profiles").upsert(
        {
          user_id: userId,
          full_name: sanitized.fullName,
          email: sanitized.email,
          phone: sanitized.phone,
          location: sanitized.location,
          linkedin_url: sanitized.linkedinUrl,
          github_url: sanitized.githubUrl,
          portfolio_url: sanitized.portfolioUrl,
          summary: sanitized.summary,
          is_fresher_mode: sanitized.isFresherMode,
          education: sanitized.education,
          experience: sanitized.experience,
          projects: sanitized.projects,
          skills: sanitized.skills,
          certifications: sanitized.certifications,
          achievements: sanitized.achievements,
          current_ctc: sanitized.currentCtc,
          expected_ctc: sanitized.expectedCtc,
          notice_period: sanitized.noticePeriod,
          preferred_location: sanitized.preferredLocation,
          work_mode: sanitized.workMode,
          updated_at: now,
        },
        { onConflict: "user_id" }
      );
      if (error) {
        this.logDbError("saveProfile", error);
        throw new Error(`Database error saving profile: ${error.message}`);
      }
      return sanitized;
    }

    this.profiles.set(userId, sanitized);
    return sanitized;
  }

  // ==========================================
  // RESUMES (Multi-Tenant Scoped)
  // ==========================================
  async getResumes(userId: string): Promise<Resume[]> {
    if (this.supabase) {
      const { data, error } = await this.supabase
        .from("resumes")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) {
        this.logDbError("getResumes", error);
        throw new Error(`Database error fetching resumes: ${error.message}`);
      }

      if (data && data.length > 0) {
        return data.map((r) => ({
          id: r.id,
          userId: r.user_id,
          title: r.title,
          targetRole: r.target_role,
          templateId: r.template_id,
          content: r.content,
          isPrimary: r.is_primary,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        }));
      }

      if (isDemoMode() || userId === DEMO_USER_ID) {
        return [{ ...SEED_RESUME, userId }];
      }
      return [];
    }

    const memoryResumes = Array.from(this.resumes.values()).filter((r) => r.userId === userId);
    if (memoryResumes.length > 0) return memoryResumes;

    if (isDemoMode() || userId === DEMO_USER_ID) {
      const defaultResume = { ...SEED_RESUME, userId };
      this.resumes.set(defaultResume.id, defaultResume);
      return [defaultResume];
    }
    return [];
  }

  async getResumeById(id: string, userId?: string): Promise<Resume | undefined> {
    if (this.supabase) {
      let query = this.supabase.from("resumes").select("*").eq("id", id);
      if (userId) query = query.eq("user_id", userId);
      const { data, error } = await query.maybeSingle();

      if (error) {
        this.logDbError("getResumeById", error);
        throw new Error(`Database error in getResumeById: ${error.message}`);
      }

      if (data) {
        return {
          id: data.id,
          userId: data.user_id,
          title: data.title,
          targetRole: data.target_role,
          templateId: data.template_id,
          content: data.content,
          isPrimary: data.is_primary,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
      return undefined;
    }

    const resume = this.resumes.get(id);
    if (!resume) return undefined;
    if (userId && resume.userId !== userId) return undefined;
    return resume;
  }

  async saveResume(resume: Resume): Promise<Resume> {
    const now = new Date().toISOString();
    const updated: Resume = {
      ...resume,
      updatedAt: now,
      createdAt: resume.createdAt || now,
    };

    if (this.supabase) {
      // Check existing resume to prevent ID overwrite / takeover across users (High #6)
      const { data: existing, error: checkError } = await this.supabase
        .from("resumes")
        .select("id, user_id")
        .eq("id", updated.id)
        .maybeSingle();

      if (checkError) {
        this.logDbError("saveResume:check", checkError);
        throw new Error(`Database error verifying resume: ${checkError.message}`);
      }

      if (existing) {
        if (existing.user_id !== updated.userId) {
          throw new Error("Unauthorized: Resume belongs to another user");
        }
        const { error: updateError } = await this.supabase
          .from("resumes")
          .update({
            title: updated.title,
            target_role: updated.targetRole,
            template_id: updated.templateId,
            content: updated.content,
            is_primary: updated.isPrimary,
            updated_at: updated.updatedAt,
          })
          .eq("id", updated.id)
          .eq("user_id", updated.userId);

        if (updateError) {
          this.logDbError("saveResume:update", updateError);
          throw new Error(`Database error updating resume: ${updateError.message}`);
        }
      } else {
        const { error: insertError } = await this.supabase.from("resumes").insert({
          id: updated.id,
          user_id: updated.userId,
          title: updated.title,
          target_role: updated.targetRole,
          template_id: updated.templateId,
          content: updated.content,
          is_primary: updated.isPrimary,
          created_at: updated.createdAt,
          updated_at: updated.updatedAt,
        });

        if (insertError) {
          this.logDbError("saveResume:insert", insertError);
          throw new Error(`Database error creating resume: ${insertError.message}`);
        }
      }

      return updated;
    }

    this.resumes.set(updated.id, updated);
    return updated;
  }

  async deleteResume(id: string, userId: string): Promise<boolean> {
    if (this.supabase) {
      const { data, error } = await this.supabase
        .from("resumes")
        .delete()
        .eq("id", id)
        .eq("user_id", userId)
        .select("id");

      if (error) {
        this.logDbError("deleteResume", error);
        throw new Error(`Database error deleting resume: ${error.message}`);
      }
      return Boolean(data && data.length > 0);
    }

    const resume = this.resumes.get(id);
    if (!resume || resume.userId !== userId) return false;
    this.resumes.delete(id);
    this.versions = this.versions.filter((v) => v.resumeId !== id);
    return true;
  }

  // ==========================================
  // RESUME VERSIONS
  // ==========================================
  async getVersionsByResumeId(resumeId: string, userId?: string): Promise<ResumeVersion[]> {
    if (this.supabase) {
      let query = this.supabase
        .from("resume_versions")
        .select("*")
        .eq("resume_id", resumeId)
        .order("version_number", { ascending: false });
      if (userId) query = query.eq("user_id", userId);
      const { data, error } = await query;
      if (error) {
        this.logDbError("getVersionsByResumeId", error);
        throw new Error(`Database error fetching versions: ${error.message}`);
      }
      if (data) {
        return data.map((v) => ({
          id: v.id,
          resumeId: v.resume_id,
          userId: v.user_id,
          versionNumber: v.version_number,
          versionLabel: v.version_label,
          changeSummary: v.change_summary,
          snapshot: v.snapshot,
          createdAt: v.created_at,
        }));
      }
      return [];
    }

    return this.versions
      .filter((v) => v.resumeId === resumeId && (!userId || v.userId === userId))
      .sort((a, b) => b.versionNumber - a.versionNumber);
  }

  async createVersion(version: Omit<ResumeVersion, "id" | "createdAt">): Promise<ResumeVersion> {
    const newVersion: ResumeVersion = {
      ...version,
      id: `ver-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
    };

    if (this.supabase) {
      const { error } = await this.supabase.from("resume_versions").insert({
        id: newVersion.id,
        resume_id: newVersion.resumeId,
        user_id: newVersion.userId,
        version_number: newVersion.versionNumber,
        version_label: newVersion.versionLabel,
        change_summary: newVersion.changeSummary,
        snapshot: newVersion.snapshot,
        created_at: newVersion.createdAt,
      });
      if (error) {
        this.logDbError("createVersion", error);
        throw new Error(`Database error creating version: ${error.message}`);
      }
      return newVersion;
    }

    this.versions.push(newVersion);
    return newVersion;
  }

  async restoreVersion(versionId: string, resumeId: string, userId: string): Promise<Resume | null> {
    const resume = await this.getResumeById(resumeId, userId);
    if (!resume) return null;

    const versions = await this.getVersionsByResumeId(resumeId, userId);
    const version = versions.find((v) => v.id === versionId);
    if (!version || version.resumeId !== resumeId) return null;

    const updated = await this.saveResume({
      ...resume,
      content: JSON.parse(JSON.stringify(version.snapshot)),
      updatedAt: new Date().toISOString(),
    });
    return updated;
  }

  // ==========================================
  // ATS SCANS (Multi-Tenant)
  // ==========================================
  async saveATSScan(scan: ATSScanResult, userId: string): Promise<ATSScanResult> {
    const finalizedScan: ATSScanResult = {
      ...scan,
      userId,
      id: scan.id || `scan-${crypto.randomUUID()}`,
      scannedAt: scan.scannedAt || new Date().toISOString(),
    };

    if (this.supabase) {
      const { error } = await this.supabase.from("ats_scans").upsert({
        id: finalizedScan.id,
        user_id: userId,
        resume_id: finalizedScan.resumeId,
        resume_name: finalizedScan.resumeName,
        overall_score: finalizedScan.overallScore,
        formatting_score: finalizedScan.formattingScore,
        completeness_score: finalizedScan.completenessScore,
        keyword_strength_score: finalizedScan.keywordStrengthScore,
        quantification_score: finalizedScan.quantificationScore,
        strengths: finalizedScan.strengths,
        issues: finalizedScan.issues,
        actionable_fixes: finalizedScan.actionableFixes,
        scanned_at: finalizedScan.scannedAt,
      });
      if (error) {
        this.logDbError("saveATSScan", error);
        throw new Error(`Database error saving ATS scan: ${error.message}`);
      }
      return finalizedScan;
    }

    this.atsScans.set(finalizedScan.id, finalizedScan);
    return finalizedScan;
  }

  async getATSScans(userId: string): Promise<ATSScanResult[]> {
    if (this.supabase) {
      const { data, error } = await this.supabase
        .from("ats_scans")
        .select("*")
        .eq("user_id", userId)
        .order("scanned_at", { ascending: false });

      if (error) {
        this.logDbError("getATSScans", error);
        throw new Error(`Database error fetching ATS scans: ${error.message}`);
      }

      if (data) {
        return data.map((s) => ({
          id: s.id,
          userId: s.user_id,
          resumeId: s.resume_id,
          resumeName: s.resume_name,
          overallScore: s.overall_score,
          formattingScore: s.formatting_score,
          completenessScore: s.completeness_score,
          keywordStrengthScore: s.keyword_strength_score,
          quantificationScore: s.quantification_score,
          strengths: s.strengths || [],
          issues: s.issues || [],
          actionableFixes: s.actionable_fixes || [],
          scannedAt: s.scanned_at,
        }));
      }
      return [];
    }

    return Array.from(this.atsScans.values())
      .filter((s) => s.userId === userId)
      .sort((a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime());
  }

  async deleteATSScan(id: string, userId: string): Promise<boolean> {
    if (this.supabase) {
      const { data, error } = await this.supabase
        .from("ats_scans")
        .delete()
        .eq("id", id)
        .eq("user_id", userId)
        .select("id");

      if (error) {
        this.logDbError("deleteATSScan", error);
        throw new Error(`Database error deleting ATS scan: ${error.message}`);
      }
      return Boolean(data && data.length > 0);
    }

    const scan = this.atsScans.get(id);
    if (scan && scan.userId === userId) {
      this.atsScans.delete(id);
      return true;
    }
    return false;
  }

  // ==========================================
  // COVER LETTERS (Multi-Tenant)
  // ==========================================
  async saveCoverLetter(letter: CoverLetter): Promise<CoverLetter> {
    const finalized: CoverLetter = {
      ...letter,
      id: letter.id || `cl-${crypto.randomUUID()}`,
      createdAt: letter.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (this.supabase) {
      const { error } = await this.supabase.from("cover_letters").upsert({
        id: finalized.id,
        user_id: finalized.userId,
        resume_id: finalized.resumeId,
        company_name: finalized.companyName,
        target_role: finalized.targetRole,
        tone: finalized.tone,
        content: finalized.content,
        created_at: finalized.createdAt,
        updated_at: finalized.updatedAt,
      });
      if (error) {
        this.logDbError("saveCoverLetter", error);
        throw new Error(`Database error saving cover letter: ${error.message}`);
      }
      return finalized;
    }

    this.coverLetters.set(finalized.id, finalized);
    return finalized;
  }

  async getCoverLetters(userId: string): Promise<CoverLetter[]> {
    if (this.supabase) {
      const { data, error } = await this.supabase
        .from("cover_letters")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) {
        this.logDbError("getCoverLetters", error);
        throw new Error(`Database error fetching cover letters: ${error.message}`);
      }

      if (data) {
        return data.map((l) => ({
          id: l.id,
          userId: l.user_id,
          resumeId: l.resume_id,
          companyName: l.company_name,
          targetRole: l.target_role,
          tone: l.tone,
          content: l.content,
          createdAt: l.created_at,
          updatedAt: l.updated_at,
        }));
      }
      return [];
    }

    return Array.from(this.coverLetters.values())
      .filter((l) => l.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async deleteCoverLetter(id: string, userId: string): Promise<boolean> {
    if (this.supabase) {
      const { data, error } = await this.supabase
        .from("cover_letters")
        .delete()
        .eq("id", id)
        .eq("user_id", userId)
        .select("id");

      if (error) {
        this.logDbError("deleteCoverLetter", error);
        throw new Error(`Database error deleting cover letter: ${error.message}`);
      }
      return Boolean(data && data.length > 0);
    }

    const letter = this.coverLetters.get(id);
    if (letter && letter.userId === userId) {
      this.coverLetters.delete(id);
      return true;
    }
    return false;
  }

  // ==========================================
  // INTERVIEW SESSIONS (Multi-Tenant & Atomic)
  // ==========================================
  async saveInterviewSession(session: InterviewSession): Promise<InterviewSession> {
    const cloned = structuredClone(session);

    if (this.supabase) {
      const { error } = await this.supabase.from("interview_sessions").upsert({
        id: cloned.id,
        user_id: cloned.userId,
        target_role: cloned.targetRole,
        status: cloned.status,
        overall_score: cloned.overallScore,
        questions: cloned.questions,
        created_at: cloned.createdAt,
        updated_at: cloned.updatedAt,
      });
      if (error) {
        this.logDbError("saveInterviewSession", error);
        throw new Error(`Database error saving interview session: ${error.message}`);
      }
      return cloned;
    }

    this.interviewSessions.set(cloned.id, cloned);
    return cloned;
  }

  async getInterviewSessions(userId: string): Promise<InterviewSession[]> {
    if (this.supabase) {
      const { data, error } = await this.supabase
        .from("interview_sessions")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) {
        this.logDbError("getInterviewSessions", error);
        throw new Error(`Database error fetching interview sessions: ${error.message}`);
      }

      if (data) {
        return data.map((s) => ({
          id: s.id,
          userId: s.user_id,
          targetRole: s.target_role,
          status: s.status,
          overallScore: s.overall_score,
          questions: s.questions,
          createdAt: s.created_at,
          updatedAt: s.updated_at,
        }));
      }
      return [];
    }

    return Array.from(this.interviewSessions.values())
      .filter((s) => s.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async getInterviewSessionById(id: string, userId: string): Promise<InterviewSession | undefined> {
    if (this.supabase) {
      const { data, error } = await this.supabase
        .from("interview_sessions")
        .select("*")
        .eq("id", id)
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        this.logDbError("getInterviewSessionById", error);
        throw new Error(`Database error in getInterviewSessionById: ${error.message}`);
      }

      if (data) {
        return {
          id: data.id,
          userId: data.user_id,
          targetRole: data.target_role,
          status: data.status,
          overallScore: data.overall_score,
          questions: data.questions,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
      return undefined;
    }

    const session = this.interviewSessions.get(id);
    if (session && session.userId === userId) return structuredClone(session);
    return undefined;
  }

  async deleteInterviewSession(id: string, userId: string): Promise<boolean> {
    if (this.supabase) {
      const { data, error } = await this.supabase
        .from("interview_sessions")
        .delete()
        .eq("id", id)
        .eq("user_id", userId)
        .select("id");

      if (error) {
        this.logDbError("deleteInterviewSession", error);
        throw new Error(`Database error deleting interview session: ${error.message}`);
      }
      return Boolean(data && data.length > 0);
    }

    const session = this.interviewSessions.get(id);
    if (session && session.userId === userId) {
      this.interviewSessions.delete(id);
      return true;
    }
    return false;
  }

  // ==========================================
  // SUBSCRIPTIONS (Multi-Tenant & Expiry Tracking)
  // ==========================================
  async getSubscription(userId: string): Promise<Subscription> {
    if (this.supabase) {
      const { data, error } = await this.supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        this.logDbError("getSubscription", error);
        throw new Error(`Database error fetching subscription: ${error.message}`);
      }

      if (data) {
        return {
          id: data.id,
          userId: data.user_id,
          plan: data.plan,
          status: data.status,
          billingCycle: data.billing_cycle,
          paymentId: data.payment_id,
          orderId: data.order_id,
          currentPeriodEnd: data.current_period_end,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    }

    let sub = this.subscriptions.get(userId);
    if (!sub) {
      sub = {
        id: `sub-${crypto.randomUUID()}`,
        userId,
        plan: "free",
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.subscriptions.set(userId, sub);
    }
    return sub;
  }

  async upgradeToPro(
    userId: string,
    options?: {
      billingCycle?: "monthly" | "yearly";
      paymentId?: string;
      orderId?: string;
    }
  ): Promise<Subscription> {
    const cycle = options?.billingCycle || "monthly";
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + (cycle === "yearly" ? 12 : 1));

    const existing = await this.getSubscription(userId);
    const updated: Subscription = {
      ...existing,
      plan: "pro",
      status: "active",
      billingCycle: cycle,
      paymentId: options?.paymentId,
      orderId: options?.orderId,
      currentPeriodEnd: expiresAt.toISOString(),
      updatedAt: now.toISOString(),
    };

    if (this.supabase) {
      const { error } = await this.supabase.from("subscriptions").upsert(
        {
          id: updated.id,
          user_id: userId,
          plan: "pro",
          status: "active",
          billing_cycle: cycle,
          payment_id: options?.paymentId,
          order_id: options?.orderId,
          current_period_end: expiresAt.toISOString(),
          updated_at: now.toISOString(),
        },
        { onConflict: "user_id" }
      );
      if (error) {
        this.logDbError("upgradeToPro", error);
        throw new Error(`Database error saving subscription upgrade: ${error.message}`);
      }
    }

    this.subscriptions.set(userId, updated);
    return updated;
  }

  async cancelSubscription(userId: string): Promise<Subscription> {
    const existing = await this.getSubscription(userId);
    const now = new Date().toISOString();
    const updated: Subscription = {
      ...existing,
      plan: "free",
      status: "canceled",
      currentPeriodEnd: undefined,
      updatedAt: now,
    };

    if (this.supabase) {
      const { error } = await this.supabase
        .from("subscriptions")
        .update({
          plan: "free",
          status: "canceled",
          current_period_end: null,
          updated_at: now,
        })
        .eq("user_id", userId);

      if (error) {
        this.logDbError("cancelSubscription", error);
        throw new Error(`Database error canceling subscription: ${error.message}`);
      }
    }

    this.subscriptions.set(userId, updated);
    return updated;
  }

  // ==========================================
  // ORDERS (Audit & Replay Protection)
  // ==========================================
  async createOrder(order: PaymentOrderRecord): Promise<PaymentOrderRecord> {
    if (this.supabase) {
      const { error } = await this.supabase.from("orders").insert({
        id: order.id,
        user_id: order.userId,
        plan: order.plan,
        billing_cycle: order.billingCycle,
        amount: order.amount,
        currency: order.currency,
        status: order.status,
        razorpay_order_id: order.razorpayOrderId,
        created_at: order.createdAt,
        updated_at: order.updatedAt,
      });

      if (error) {
        this.logDbError("createOrder", error);
        throw new Error(`Database error creating payment order: ${error.message}`);
      }
      return order;
    }

    this.orders.set(order.razorpayOrderId, order);
    return order;
  }

  async getOrderByRazorpayId(razorpayOrderId: string): Promise<PaymentOrderRecord | null> {
    if (this.supabase) {
      const { data, error } = await this.supabase
        .from("orders")
        .select("*")
        .eq("razorpay_order_id", razorpayOrderId)
        .maybeSingle();

      if (error) {
        this.logDbError("getOrderByRazorpayId", error);
        throw new Error(`Database error fetching order: ${error.message}`);
      }

      if (data) {
        return {
          id: data.id,
          userId: data.user_id,
          plan: data.plan,
          billingCycle: data.billing_cycle,
          amount: data.amount,
          currency: data.currency,
          status: data.status,
          razorpayOrderId: data.razorpay_order_id,
          razorpayPaymentId: data.razorpay_payment_id,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
      return null;
    }

    return this.orders.get(razorpayOrderId) || null;
  }

  async markOrderPaid(razorpayOrderId: string, paymentId: string): Promise<PaymentOrderRecord | null> {
    const now = new Date().toISOString();
    if (this.supabase) {
      const { data, error } = await this.supabase
        .from("orders")
        .update({
          status: "paid",
          razorpay_payment_id: paymentId,
          updated_at: now,
        })
        .eq("razorpay_order_id", razorpayOrderId)
        .select("*")
        .maybeSingle();

      if (error) {
        this.logDbError("markOrderPaid", error);
        throw new Error(`Database error marking order paid: ${error.message}`);
      }

      if (data) {
        return {
          id: data.id,
          userId: data.user_id,
          plan: data.plan,
          billingCycle: data.billing_cycle,
          amount: data.amount,
          currency: data.currency,
          status: data.status,
          razorpayOrderId: data.razorpay_order_id,
          razorpayPaymentId: data.razorpay_payment_id,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
      return null;
    }

    const order = this.orders.get(razorpayOrderId);
    if (order) {
      order.status = "paid";
      order.razorpayPaymentId = paymentId;
      order.updatedAt = now;
      this.orders.set(razorpayOrderId, order);
      return order;
    }
    return null;
  }
}

// Global singleton to survive hot-reload in Next.js development
const globalForRepo = globalThis as unknown as { karyvoRepo: RepositoryStore };
export const repository = globalForRepo.karyvoRepo || new RepositoryStore();
if (process.env.NODE_ENV !== "production") globalForRepo.karyvoRepo = repository;
