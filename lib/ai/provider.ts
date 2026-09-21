import { MasterCareerProfile } from "@/types/profile";
import { CoverLetterTone } from "@/types/cover-letter";
import { InterviewQuestionItem } from "@/types/interview";
import { z } from "zod";

// H1: Zod schema to validate AI response structure before trusting it
const BulletImprovementSchema = z.object({
  improved: z.string(),
  actionVerbUsed: z.string(),
  quantificationAdded: z.boolean(),
  explanation: z.string(),
});

export class KaryvoAIService {
  private provider: "gemini" | "smart-engine";

  constructor() {
    this.provider = process.env.GEMINI_API_KEY ? "gemini" : "smart-engine";
  }

  /**
   * Improves a single bullet point using Google's XYZ formula:
   * "Accomplished [X], as measured by [Y], by doing [Z]"
   */
  async improveBullet(rawBullet: string, roleOrContext?: string): Promise<{
    improved: string;
    actionVerbUsed: string;
    quantificationAdded: boolean;
    explanation: string;
  }> {
    const trimmed = rawBullet.trim();
    if (!trimmed) {
      return {
        improved: "Engineered scalable feature reducing response latency by 32% across peak traffic.",
        actionVerbUsed: "Engineered",
        quantificationAdded: true,
        explanation: "Added high-impact action verb and measurable latency metric.",
      };
    }

    // High impact verbs
    const powerVerbs = [
      "Architected",
      "Engineered",
      "Spearheaded",
      "Optimized",
      "Orchestrated",
      "Streamlined",
      "Automated",
      "Revamped",
    ];
    const selectedVerb = powerVerbs[Math.floor(Math.random() * powerVerbs.length)];

    // If API key is available, call external model; otherwise use smart structural synthesis
    if (process.env.GEMINI_API_KEY) {
      try {
        const prompt = `You are a Principal Technical Resume Coach. Transform this bullet point using Google's XYZ formula (Accomplished [X], measured by [Y], by doing [Z]).
Do NOT invent fake company names or fake degrees.
Return JSON with { "improved": "...", "actionVerbUsed": "...", "quantificationAdded": true, "explanation": "..." }
Original bullet: "${trimmed}"
Role context: "${roleOrContext || "Software Engineer"}"`;

        // M7: Use x-goog-api-key header instead of query param to avoid key in URL/logs
        const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": process.env.GEMINI_API_KEY,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        });
        const data = await res.json();
        const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (jsonText) {
          const parsed = JSON.parse(jsonText);
          // H1: Validate AI response shape with Zod before trusting it
          const validated = BulletImprovementSchema.safeParse(parsed);
          if (validated.success) {
            return validated.data;
          }
          console.warn("AI response failed shape validation, falling back to smart engine.");
        }
      } catch (err) {
        console.error("External AI call error, falling back to smart engine:", err);
      }
    }

    // Smart deterministic structural improvement engine
    const cleanLower = trimmed.toLowerCase();
    let improvedBullet = trimmed;

    // Check if starts with weak verb like "worked on", "responsible for", "helped", "did"
    const weakStarters = ["worked on", "responsible for", "helped in", "helped to", "handled", "was doing", "did", "made"];
    let replacedStarter = false;

    for (const weak of weakStarters) {
      if (cleanLower.startsWith(weak)) {
        const remainder = trimmed.slice(weak.length).trim();
        improvedBullet = `${selectedVerb} ${remainder}`;
        replacedStarter = true;
        break;
      }
    }

    if (!replacedStarter && !/^[A-Z][a-z]+ed\b/.test(trimmed)) {
      improvedBullet = `${selectedVerb} ${trimmed.charAt(0).toLowerCase() + trimmed.slice(1)}`;
    }

    // Ensure quantified metric is present
    const hasMetric = /\d+%|\d+x|\$\d+|₹\d+|\d+\+?\s*(users|ms|daily|transactions|queries|rps)/i.test(improvedBullet);
    let quantificationAdded = false;

    if (!hasMetric) {
      if (/latency|speed|performance|response time/i.test(improvedBullet)) {
        improvedBullet += ", driving a 35% reduction in latency and boosting system throughput.";
        quantificationAdded = true;
      } else if (/test|qa|bug|quality/i.test(improvedBullet)) {
        improvedBullet += ", expanding automated test coverage by 40% and eliminating recurring production regressions.";
        quantificationAdded = true;
      } else if (/cost|cloud|aws|server|infra/i.test(improvedBullet)) {
        improvedBullet += ", slashing cloud infrastructure expenditure by 22% through automated resource de-allocation.";
        quantificationAdded = true;
      } else {
        improvedBullet += ", elevating user engagement by 28% and ensuring 99.9% operational reliability.";
        quantificationAdded = true;
      }
    }

    return {
      improved: improvedBullet.replace(/\.$/, "") + ".",
      actionVerbUsed: selectedVerb,
      quantificationAdded,
      explanation: "Restructured with high-impact action verb and quantifiable business/engineering outcome.",
    };
  }

  /**
   * M1: Calculate years of experience from profile data instead of hardcoding
   */
  private calculateYearsOfExperience(profile: MasterCareerProfile): string {
    if (profile.isFresherMode || !profile.experience?.length) {
      return "";
    }

    const now = new Date();
    let earliestStartYear = now.getFullYear();

    for (const exp of profile.experience) {
      // Parse start date like "July 2022" or "Jan 2022"
      const match = exp.startDate?.match(/(\d{4})/);
      if (match) {
        const year = parseInt(match[1], 10);
        if (year < earliestStartYear) {
          earliestStartYear = year;
        }
      }
    }

    const years = now.getFullYear() - earliestStartYear;
    return years <= 0 ? "1" : String(years);
  }

  /**
   * Generates a focused, high-impact 3-sentence professional summary
   */
  async generateSummary(profile: MasterCareerProfile, targetRole: string): Promise<string> {
    // L3: Null-safe access for profile.skills
    const topSkills = [
      ...(profile.skills?.technical || []),
      ...(profile.skills?.frameworks || []),
    ].slice(0, 4).join(", ") || "Modern Web & Distributed Systems";

    // M1: Dynamic years calculation
    const yearsExp = profile.isFresherMode
      ? "Motivated Engineering graduate"
      : `Results-driven Engineer with ${this.calculateYearsOfExperience(profile)}+ years of hands-on experience`;

    const topProject = profile.projects?.[0]?.title || "high-throughput distributed applications";

    return `${yearsExp} specializing in ${targetRole}, with deep proficiency across ${topSkills}. Proven track record architecting robust solutions including ${topProject}, delivering measurable performance gains, high reliability, and scalable code. Committed to engineering excellence, continuous learning, and driving collaborative product velocity.`;
  }

  /**
   * Generates a tailored Cover Letter based on Profile + Target Company + Target Role + Tone
   */
  async generateCoverLetter(
    profile: MasterCareerProfile,
    companyName: string,
    targetRole: string,
    tone: CoverLetterTone
  ): Promise<string> {
    const today = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // L3: Null-safe access for profile.skills
    const primarySkills = [
      ...(profile.skills?.technical || []),
      ...(profile.skills?.frameworks || []),
    ].slice(0, 4).join(", ") || "software design, frontend architecture, and microservices";

    const highlightExperience = profile.experience?.[0];
    const expSentence = highlightExperience
      ? `During my tenure as ${highlightExperience.role} at ${highlightExperience.company}, I led critical engineering initiatives, including: "${highlightExperience.bullets?.[0] || "optimizing core platform systems"}".`
      : `Throughout my academic and project journey at ${profile.education?.[0]?.college || "university"}, I have spearheaded complex implementations such as "${profile.projects?.[0]?.title || "full-stack distributed projects"}".`;

    let openingHook = `I am writing to express my strong interest in the ${targetRole} opportunity at ${companyName}.`;
    if (tone === "Enthusiastic Fresher") {
      openingHook = `As an ambitious engineering graduate passionate about modern engineering paradigms, I am thrilled to apply for the ${targetRole} position at ${companyName}.`;
    } else if (tone === "Confident & High-Impact") {
      openingHook = `With a demonstrated history of driving measurable architectural efficiency and product velocity, I am excited to bring my engineering rigor to ${companyName} as your next ${targetRole}.`;
    }

    return `${today}

Hiring Team  
${companyName}

Dear Hiring Team,

${openingHook} Having followed ${companyName}'s rapid innovation and technical impact, I am energized by the opportunity to contribute to your engineering excellence and scale.

${expSentence} My technical toolkit spans ${primarySkills}, paired with a relentless focus on clean architecture, sub-second latency, and user-centric problem solving. 

What draws me specifically to ${companyName} is your dedication to solving complex engineering challenges at scale. I thrive in collaborative environments where performance, code maintainability, and customer outcomes are prioritized. I am confident that my experience delivering resilient features will enable me to hit the ground running and create immediate value for your team.

Thank you for your time and consideration. I welcome the opportunity to discuss how my skill set and passion align with ${companyName}'s vision.

Warm regards,

${profile.fullName}
${profile.email} | ${profile.phone}
${profile.location}
${profile.linkedinUrl}`;
  }

  /**
   * Generates realistic role-specific interview questions
   */
  async generateInterviewQuestions(targetRole: string, profile: MasterCareerProfile): Promise<InterviewQuestionItem[]> {
    // L3: Null-safe access
    const techSkill = profile.skills?.technical?.[0] || "System Architecture";
    const framework = profile.skills?.frameworks?.[0] || "React & Node.js";
    const topProject = profile.projects?.[0]?.title || "Distributed Application";

    return [
      {
        id: "q-1",
        questionIndex: 1,
        category: "Technical",
        questionText: `For a ${targetRole} role, how do you diagnose and optimize a sudden 300% spike in p99 API latency across a distributed service? Walk through your step-by-step triage.`,
        modelAnswer:
          "Start by checking APM metrics (Datadog/Prometheus) to pinpoint the bottleneck: database query locks, CPU/memory throttling, connection pool exhaustion, or downstream third-party timeouts. Inspect recent git deployments, enable slow query logging, review indexing, and implement circuit breakers or Redis caching for read-heavy hotspots.",
      },
      {
        id: "q-2",
        questionIndex: 2,
        category: "Project",
        questionText: `In your project "${topProject}", what was the most difficult architectural trade-off you encountered, and how did you validate your final technical decision?`,
        modelAnswer:
          "Highlight a concrete engineering trade-off (e.g. choosing WebSockets vs polling, or SQL vs NoSQL for event logs). Explain the evaluation criteria: throughput, memory overhead, developer velocity, and how benchmark load testing validated the decision.",
      },
      {
        id: "q-3",
        questionIndex: 3,
        category: "Technical",
        questionText: `Explain how you implement optimistic UI updates, state synchronization, and race condition prevention when using ${framework}.`,
        modelAnswer:
          "Use transactional local state mutations with immediate UI feedback while dispatching asynchronous mutations. If an error occurs, perform an idempotent state rollback and trigger an unobtrusive notification. Use abort controllers or unique request sequence IDs to prevent out-of-order race condition overwrites.",
      },
      {
        id: "q-4",
        questionIndex: 4,
        category: "Situational",
        questionText: `Imagine a critical product feature must ship in 48 hours for an enterprise client, but you identify significant technical debt in the legacy code path. How do you resolve this conflict with the Product Manager?`,
        modelAnswer:
          "Assess blast radius and risk. Separate non-negotiable stability/security risks from cosmetic refactoring. Propose a pragmatic two-phase delivery: ship a scoped, safely feature-flagged patch with telemetry for the 48-hour deadline, and schedule dedicated sprint capacity immediately after for root-cause refactoring.",
      },
      {
        id: "q-5",
        questionIndex: 5,
        category: "HR",
        questionText: `Why are you interested in advancing your career as a ${targetRole}, and what specific engineering culture enables you to do your best work?`,
        modelAnswer:
          "Express genuine passion for solving real-world scale problems, taking ownership from RFC design through production observability, and thriving in blameless, high-trust engineering cultures with automated CI/CD and strong mentorship.",
      },
    ];
  }

  /**
   * Evaluates user's interview answer
   */
  async evaluateInterviewAnswer(
    question: string,
    userAnswer: string,
    category: string
  ): Promise<{
    score: number;
    feedbackStrengths: string[];
    feedbackImprovements: string[];
    betterAnswer: string;
  }> {
    const text = userAnswer.trim();
    if (text.length < 20) {
      return {
        score: 35,
        feedbackStrengths: ["Answer submitted."],
        feedbackImprovements: [
          "Answer is too brief. In a technical interview, elaborate using the STAR method (Situation, Task, Action, Result).",
          "Include concrete technical terms, metrics, and tools you utilized.",
        ],
        betterAnswer:
          "Provide a structured response: 'In my experience tackling this, I first isolated the metrics using APM tooling. Next, I identified the database lock contention and resolved it by re-indexing the composite keys, which decreased p99 latency from 450ms down to 40ms.'",
      };
    }

    // Score based on technical depth, structure, and action verbs
    let score = 70;
    const strengths: string[] = [];
    const improvements: string[] = [];

    if (/\b(because|first|then|finally|result|measured|specifically|implemented)\b/i.test(text)) {
      score += 10;
      strengths.push("Clear logical progression and structured explanation.");
    } else {
      improvements.push("Structure your response more sequentially (First → Then → Result).");
    }

    if (/\b(database|latency|cache|redis|async|cluster|scale|testing|monitoring|metric)\b/i.test(text)) {
      score += 10;
      strengths.push("Good domain-specific terminology demonstrating engineering depth.");
    } else {
      improvements.push("Incorporate more industry-standard architecture concepts and specific tooling names.");
    }

    if (/\b(\d+%|\d+x|\d+ms|million|reduced|increased)\b/i.test(text)) {
      score += 5;
      strengths.push("Strong quantification of outcomes and metrics.");
    } else {
      improvements.push("State measurable impact (e.g. '% latency improvement' or 'concurrency handled').");
    }

    const finalScore = Math.min(score, 96);

    return {
      score: finalScore,
      feedbackStrengths: strengths.length > 0 ? strengths : ["Communicated core concept directly."],
      feedbackImprovements: improvements.length > 0 ? improvements : ["Continue demonstrating concise technical leadership."],
      betterAnswer:
        "To elevate this answer to top-percentile standards, frame it crisply: 'When faced with this scenario, I prioritize telemetry first. I analyze system logs to isolate the root cause, validate candidate hypotheses in a staging environment, deploy an automated hotfix behind a canary feature flag, and finally author an incident post-mortem to prevent future occurrences.'",
    };
  }
}

export const karyvoAI = new KaryvoAIService();
