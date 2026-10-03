import { MasterCareerProfile } from "@/types/profile";
import { CoverLetterTone } from "@/types/cover-letter";
import { InterviewQuestionItem } from "@/types/interview";
import { z } from "zod";

// Zod schemas for AI response structure validation
const BulletImprovementSchema = z.object({
  improved: z.string(),
  actionVerbUsed: z.string(),
  quantificationAdded: z.boolean(),
  explanation: z.string(),
});

const InterviewQuestionsSchema = z.array(
  z.object({
    id: z.string(),
    questionIndex: z.number(),
    category: z.enum(["Technical", "Project", "HR", "Situational"]),
    questionText: z.string(),
    modelAnswer: z.string(),
  })
);

const InterviewEvaluationSchema = z.object({
  score: z.number().min(0).max(100),
  feedbackStrengths: z.array(z.string()),
  feedbackImprovements: z.array(z.string()),
  betterAnswer: z.string(),
});

export class KaryvoAIService {
  /**
   * Helper to make robust, timeout-bounded calls to Google Gemini API
   */
  private async callGemini(prompt: string, expectJson = true): Promise<string | null> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15_000);

    try {
      const res = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: expectJson ? { responseMimeType: "application/json" } : undefined,
          }),
        }
      );

      clearTimeout(timeoutId);

      if (!res.ok) {
        console.warn(`Gemini API returned status ${res.status}`);
        return null;
      }

      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    } catch (err) {
      clearTimeout(timeoutId);
      console.error("Gemini API call error:", err);
      return null;
    }
  }

  /**
   * Improves a single bullet point using Google's XYZ formula:
   * "Accomplished [X], as measured by [Y], by doing [Z]"
   * Strict Factual Grounding: Never hallucinates fake metrics or fabricated percentages.
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
        improved: "Engineered scalable feature to enhance system throughput and operational stability.",
        actionVerbUsed: "Engineered",
        quantificationAdded: false,
        explanation: "Added high-impact action verb and clear engineering deliverable.",
      };
    }

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

    // 1. Try Real Gemini AI Call with Factual Grounding Constraints
    const prompt = `You are a Principal Technical Resume Coach. Transform this resume bullet point using Google's XYZ formula (Accomplished [X], measured by [Y], by doing [Z]).
CRITICAL FACTUAL GROUNDING RULES:
1. Do NOT invent fake metrics, percentages, dollar amounts, company names, or statistics that were not present in the original bullet.
2. If a metric was present, sharpen it. If no metric was present, articulate the concrete qualitative engineering result directly, or include a clear placeholder like "[X%]" if relevant.
3. Return ONLY valid JSON with: { "improved": "...", "actionVerbUsed": "...", "quantificationAdded": boolean, "explanation": "..." }

Original bullet: "${trimmed}"
Role context: "${roleOrContext || "Software Engineer"}"`;

    const rawJson = await this.callGemini(prompt, true);
    if (rawJson) {
      try {
        const parsed = JSON.parse(rawJson);
        const validated = BulletImprovementSchema.safeParse(parsed);
        if (validated.success) {
          return validated.data;
        }
      } catch (e) {
        console.warn("Gemini bullet improvement parse failed, falling back to smart engine.");
      }
    }

    // 2. Deterministic Fallback Engine (Factual & Honest — NO Fake Metrics)
    const cleanLower = trimmed.toLowerCase();
    let improvedBullet = trimmed;

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

    // Preserve real metric if present, or append qualitative outcome (never invent fake numbers like 35%)
    const hasMetric = /\d+%|\d+x|\$\d+|₹\d+|\d+\+?\s*(users|ms|daily|transactions|queries|rps)/i.test(improvedBullet);
    let quantificationAdded = false;

    if (!hasMetric) {
      if (/latency|speed|performance|response time/i.test(improvedBullet)) {
        improvedBullet += ", resulting in enhanced response times and system throughput";
      } else if (/test|qa|bug|quality/i.test(improvedBullet)) {
        improvedBullet += ", expanding test coverage and preventing production regressions";
      } else if (/cost|cloud|aws|server|infra/i.test(improvedBullet)) {
        improvedBullet += ", optimizing cloud infrastructure and automated resource allocation";
      } else {
        improvedBullet += ", elevating system reliability and operational efficiency";
      }
    } else {
      quantificationAdded = true;
    }

    return {
      improved: improvedBullet.replace(/\.$/, "") + ".",
      actionVerbUsed: selectedVerb,
      quantificationAdded,
      explanation: "Restructured with high-impact action verb and clear engineering deliverable.",
    };
  }

  /**
   * Calculate years of experience from profile data
   */
  private calculateYearsOfExperience(profile: MasterCareerProfile): string {
    if (profile.isFresherMode || !profile.experience?.length) {
      return "";
    }

    const now = new Date();
    let earliestStartYear = now.getFullYear();

    for (const exp of profile.experience) {
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
   * Grounded in candidate's real skills, projects, and target role.
   */
  async generateSummary(profile: MasterCareerProfile, targetRole: string): Promise<string> {
    const topSkills = [
      ...(profile.skills?.technical || []),
      ...(profile.skills?.frameworks || []),
    ].slice(0, 5).join(", ");

    const topProject = profile.projects?.[0]?.title;
    const topExperience = profile.experience?.[0];

    const prompt = `You are a Principal Career Advisor. Write a compelling, high-impact 3-sentence professional resume summary for a candidate targeting the role of "${targetRole}".
CANDIDATE FACTS (Do NOT invent facts outside these):
- Skills: ${topSkills || "Software Engineering, Problem Solving"}
- Experience: ${topExperience ? `${topExperience.role} at ${topExperience.company}` : profile.isFresherMode ? "Recent Graduate / Fresher" : "Experienced professional"}
- Featured Project: ${topProject || "Full-stack development"}
- Education: ${profile.education?.[0]?.college || "Higher Education"}

RULES:
- Return ONLY the summary paragraph text (plain text, 3-4 sentences max).
- Tone: confident, professional, and action-oriented.
- Do NOT include quotes, markdown headers, or JSON formatting.`;

    const aiSummary = await this.callGemini(prompt, false);
    if (aiSummary && aiSummary.trim().length > 40) {
      return aiSummary.trim().replace(/^["']|["']$/g, "");
    }

    // High quality deterministic fallback
    const skillsList = topSkills || "Modern Web & Distributed Systems";
    const yearsExp = profile.isFresherMode
      ? "Motivated Engineering graduate"
      : `Results-driven Engineer with ${this.calculateYearsOfExperience(profile)}+ years of hands-on experience`;

    const projectText = topProject || "high-throughput distributed applications";

    return `${yearsExp} specializing in ${targetRole}, with deep proficiency across ${skillsList}. Proven track record architecting robust solutions including ${projectText}, delivering measurable performance gains, high reliability, and scalable code. Committed to engineering excellence, continuous learning, and driving collaborative product velocity.`;
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

    const topSkills = [
      ...(profile.skills?.technical || []),
      ...(profile.skills?.frameworks || []),
    ].slice(0, 5).join(", ");

    const highlightExp = profile.experience?.[0];
    const highlightProj = profile.projects?.[0];

    const prompt = `You are an elite Executive Career Coach. Write a tailored, persuasive, professional cover letter.
DETAILS:
- Candidate Name: ${profile.fullName || "Candidate"}
- Target Company: ${companyName}
- Target Role: ${targetRole}
- Chosen Tone: ${tone}
- Candidate Skills: ${topSkills || "Software Architecture, Full-Stack Development"}
- Experience: ${highlightExp ? `${highlightExp.role} at ${highlightExp.company}` : "Engineering background"}
- Notable Project: ${highlightProj ? highlightProj.title : "Complex web applications"}

FORMAT:
Start directly with the date (${today}), recipient address block, salutation ("Dear Hiring Team,"), 3-4 cohesive paragraphs highlighting candidate relevance to ${companyName}, and sign off with candidate details.
Do NOT invent fake degrees or fake awards. Return clean text.`;

    const aiLetter = await this.callGemini(prompt, false);
    if (aiLetter && aiLetter.trim().length > 100) {
      return aiLetter.trim();
    }

    // Deterministic Fallback
    const primarySkills = topSkills || "software design, frontend architecture, and microservices";
    const expSentence = highlightExp
      ? `During my tenure as ${highlightExp.role} at ${highlightExp.company}, I led critical engineering initiatives, including: "${highlightExp.bullets?.[0] || "optimizing core platform systems"}".`
      : `Throughout my academic and project journey at ${profile.education?.[0]?.college || "university"}, I have spearheaded complex implementations such as "${highlightProj?.title || "full-stack distributed projects"}".`;

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

${expSentence} My technical toolkit spans ${primarySkills}, paired with a relentless focus on clean architecture, performance, and user-centric problem solving. 

What draws me specifically to ${companyName} is your dedication to solving complex engineering challenges at scale. I thrive in collaborative environments where performance, code maintainability, and customer outcomes are prioritized. I am confident that my experience delivering resilient features will enable me to hit the ground running and create immediate value for your team.

Thank you for your time and consideration. I welcome the opportunity to discuss how my skill set and passion align with ${companyName}'s vision.

Warm regards,

${profile.fullName || "Candidate"}
${profile.email || ""} ${profile.phone ? `| ${profile.phone}` : ""}
${profile.location || ""}
${profile.linkedinUrl || ""}`;
  }

  /**
   * Generates realistic role-specific interview questions using Gemini with Zod validation
   */
  async generateInterviewQuestions(targetRole: string, profile: MasterCareerProfile): Promise<InterviewQuestionItem[]> {
    const techSkills = profile.skills?.technical?.slice(0, 4).join(", ") || "System Architecture, APIs";
    const topProject = profile.projects?.[0]?.title || "Distributed Application";

    const prompt = `You are a Senior Engineering Hiring Manager at a top tech company. Generate 5 realistic, high-signal interview questions for a candidate interviewing for the role of "${targetRole}".
Candidate Skills: ${techSkills}
Candidate Project: "${topProject}"

Return a JSON array of exactly 5 questions with:
[
  {
    "id": "q-1",
    "questionIndex": 1,
    "category": "Technical",
    "questionText": "...",
    "modelAnswer": "..."
  },
  ...
]
Categories must include: "Technical", "Project", "Technical", "Situational", "HR".
Ensure modelAnswer provides a rigorous, benchmark answer demonstrating senior engineering reasoning.`;

    const rawJson = await this.callGemini(prompt, true);
    if (rawJson) {
      try {
        const parsed = JSON.parse(rawJson);
        const validated = InterviewQuestionsSchema.safeParse(parsed);
        if (validated.success && validated.data.length >= 3) {
          return validated.data;
        }
      } catch (err) {
        console.warn("Failed to parse Gemini interview questions, using fallback.");
      }
    }

    // High quality context-aware fallback
    const techSkill = profile.skills?.technical?.[0] || "System Architecture";
    const framework = profile.skills?.frameworks?.[0] || "React & Node.js";

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
        questionText: `Explain how you implement optimistic UI updates, state synchronization, and race condition prevention when building applications with ${framework} and ${techSkill}.`,
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
   * Evaluates user's interview answer using Gemini AI and STAR framework
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

    const prompt = `You are a Principal Technical Interviewer evaluating a candidate's response.
QUESTION: "${question}"
CATEGORY: "${category}"
CANDIDATE'S ANSWER: "${text}"

Critically evaluate this answer using the STAR framework (Situation, Task, Action, Result) and technical depth.
Return JSON with:
{
  "score": <number between 40 and 98>,
  "feedbackStrengths": ["strength 1", "strength 2"],
  "feedbackImprovements": ["area to improve 1", "area to improve 2"],
  "betterAnswer": "<a top-tier, polished model response to this question>"
}`;

    const rawJson = await this.callGemini(prompt, true);
    if (rawJson) {
      try {
        const parsed = JSON.parse(rawJson);
        const validated = InterviewEvaluationSchema.safeParse(parsed);
        if (validated.success) {
          return validated.data;
        }
      } catch (err) {
        console.warn("Failed to parse Gemini interview evaluation, using fallback.");
      }
    }

    // Deterministic scoring fallback
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

    return {
      score: Math.min(score, 96),
      feedbackStrengths: strengths.length > 0 ? strengths : ["Communicated core concept directly."],
      feedbackImprovements: improvements.length > 0 ? improvements : ["Continue demonstrating concise technical leadership."],
      betterAnswer:
        "To elevate this answer to top-percentile standards, frame it crisply: 'When faced with this scenario, I prioritize telemetry first. I analyze system logs to isolate the root cause, validate candidate hypotheses in a staging environment, deploy an automated hotfix behind a canary feature flag, and finally author an incident post-mortem to prevent future occurrences.'",
    };
  }
}

export const karyvoAI = new KaryvoAIService();

