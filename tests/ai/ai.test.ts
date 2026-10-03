import { describe, expect, it } from "vitest";
import { karyvoAI } from "@/lib/ai/provider";
import { MasterCareerProfile } from "@/types/profile";
import { createEmptyProfile } from "@/lib/db/repository";

describe("Real AI Provider & Factual Grounding (Step 3)", () => {
  const base = createEmptyProfile("test-user-ai-123");
  const sampleProfile: MasterCareerProfile = {
    ...base,
    fullName: "Priya Sharma",
    email: "priya@example.com",
    phone: "+91 9876543210",
    location: "Bengaluru, India",
    linkedinUrl: "https://linkedin.com/in/priyasharma",
    githubUrl: "https://github.com/priyasharma",
    portfolioUrl: "https://priyasharma.dev",
    summary: "",
    isFresherMode: false,
    education: [
      {
        id: "edu-1",
        college: "BITS Pilani",
        degree: "B.Tech in Computer Science",
        branch: "Computer Science",
        startYear: "2018",
        graduationYear: "2022",
        cgpa: "8.9",
      },
    ],
    experience: [
      {
        id: "exp-1",
        company: "Swiggy",
        role: "Software Development Engineer II",
        location: "Bengaluru",
        startDate: "July 2022",
        endDate: "Present",
        isCurrent: true,
        bullets: [
          "Built distributed delivery tracking pipeline handling 2M events daily",
          "Optimized Redis cache layer to improve response times",
        ],
      },
    ],
    projects: [
      {
        id: "proj-1",
        title: "Real-Time Fraud Detection Engine",
        techStack: ["Go", "Kafka", "PostgreSQL"],
        bullets: ["Engineered streaming event pipeline processing 50K events/sec"],
      },
    ],
    skills: {
      technical: ["Go", "Python", "PostgreSQL", "Kafka"],
      frameworks: ["FastAPI", "React", "Next.js"],
      tools: ["Docker", "Kubernetes", "Git"],
      soft: ["Leadership", "Communication"],
    },
    certifications: [],
    updatedAt: new Date().toISOString(),
  };

  it("improveBullet: restructures weak bullet with strong action verb without fabricating fake numbers", async () => {
    const raw = "worked on database queries to make it faster";
    const res = await karyvoAI.improveBullet(raw, "Backend Engineer");

    expect(res.improved).toBeDefined();
    expect(res.actionVerbUsed).toBeDefined();
    expect(typeof res.quantificationAdded).toBe("boolean");
    expect(res.explanation).toBeDefined();

    // Must not start with "worked on"
    expect(res.improved.toLowerCase().startsWith("worked on")).toBe(false);

    // Must not invent random hardcoded numbers when none were provided
    expect(res.improved).not.toContain("35%");
    expect(res.improved).not.toContain("22%");
    expect(res.improved).not.toContain("40%");
  });

  it("improveBullet: preserves real user metrics when provided", async () => {
    const raw = "Reduced p99 API response time by 45ms across 10M requests";
    const res = await karyvoAI.improveBullet(raw, "Senior Backend Engineer");

    expect(res.quantificationAdded).toBe(true);
    expect(res.improved).toMatch(/45ms|10M/);
  });

  it("generateSummary: creates high-impact summary grounded in candidate skills and role", async () => {
    const summary = await karyvoAI.generateSummary(sampleProfile, "Senior Backend Engineer");

    expect(summary).toBeDefined();
    expect(summary.length).toBeGreaterThan(60);
    // Grounded in candidate's target role and domain
    expect(summary.toLowerCase()).toContain("senior backend engineer");
  });

  it("generateCoverLetter: produces grounded, tone-aware cover letter", async () => {
    const letter = await karyvoAI.generateCoverLetter(
      sampleProfile,
      "Razorpay",
      "Lead Systems Engineer",
      "Confident & High-Impact"
    );

    expect(letter).toContain("Razorpay");
    expect(letter).toContain("Lead Systems Engineer");
    expect(letter).toContain("Priya Sharma");
    expect(letter).toContain("Dear Hiring Team");
  });

  it("generateInterviewQuestions: generates 5 structured questions across diverse categories", async () => {
    const questions = await karyvoAI.generateInterviewQuestions("Staff Backend Engineer", sampleProfile);

    expect(questions.length).toBeGreaterThanOrEqual(3);
    for (const q of questions) {
      expect(q.id).toBeDefined();
      expect(q.questionText).toBeDefined();
      expect(q.category).toBeDefined();
      expect(q.modelAnswer).toBeDefined();
    }
  });

  it("evaluateInterviewAnswer: evaluates answers with score, strengths, improvements and better answer", async () => {
    const question = "How do you handle distributed locks in microservices?";
    const answer =
      "I use Redis with Redlock algorithm and set strict TTL timeouts to prevent deadlocks when a worker node crashes.";

    const evalResult = await karyvoAI.evaluateInterviewAnswer(question, answer, "Technical");

    expect(evalResult.score).toBeGreaterThanOrEqual(40);
    expect(evalResult.score).toBeLessThanOrEqual(100);
    expect(evalResult.feedbackStrengths.length).toBeGreaterThan(0);
    expect(evalResult.feedbackImprovements.length).toBeGreaterThan(0);
    expect(evalResult.betterAnswer.length).toBeGreaterThan(30);
  });
});
