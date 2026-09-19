import { ATSScanResult, ATSIssue } from "@/types/ats";

export class ATSScannerService {
  /**
   * Scans resume text across the 4 pillars:
   * 1. Formatting
   * 2. Completeness
   * 3. Keyword Strength
   * 4. Quantification (Metrics & Impact)
   */
  public analyzeResume(resumeText: string, resumeName = "My Resume.pdf"): ATSScanResult {
    const text = resumeText || "";
    const lower = text.toLowerCase();
    const issues: ATSIssue[] = [];
    const strengths: string[] = [];
    const actionableFixes: string[] = [];

    // --- 1. FORMATTING EVALUATION ---
    let formattingScore = 80;
    const commonHeaders = [
      { name: "experience", regex: /\b(experience|work history|employment)\b/i },
      { name: "education", regex: /\b(education|academic background|qualifications)\b/i },
      { name: "projects", regex: /\b(projects|academic projects|technical projects)\b/i },
      { name: "skills", regex: /\b(skills|technical skills|technologies)\b/i },
    ];

    let matchedHeaders = 0;
    for (const h of commonHeaders) {
      if (h.regex.test(text)) {
        matchedHeaders++;
      } else {
        issues.push({
          id: `fmt-${h.name}`,
          category: "formatting",
          severity: "warning",
          title: `Missing standard "${h.name.toUpperCase()}" heading`,
          description: `ATS parsers look for standard naming conventions. Could not detect a clear "${h.name}" section header.`,
          recommendation: `Add a clearly marked section title: "${h.name.charAt(0).toUpperCase() + h.name.slice(1)}".`,
        });
      }
    }

    if (matchedHeaders >= 3) {
      formattingScore += 15;
      strengths.push("Standard, ATS-compliant section headings detected.");
    } else {
      formattingScore -= 20;
    }

    // Check for contact header formatting
    const hasEmail = /[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/.test(text);
    const hasPhone = /(\+?\d{1,4}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+91[\s-]?\d{10}|\d{10}/.test(text);

    if (hasEmail && hasPhone) {
      formattingScore = Math.min(100, formattingScore + 5);
      strengths.push("Contact header is clean and immediately parseable by automated filters.");
    } else {
      formattingScore -= 15;
      issues.push({
        id: "fmt-contact",
        category: "formatting",
        severity: "critical",
        title: "Incomplete Contact Details",
        description: "ATS scanners require a clear email and phone number at the top of the resume.",
        recommendation: "Ensure your primary email and 10-digit mobile number are placed prominently in the header.",
      });
      actionableFixes.push("Add a validated email address and contact number in your resume header.");
    }

    // --- 2. COMPLETENESS EVALUATION ---
    let completenessScore = 75;
    const hasLinkedIn = /linkedin\.com/i.test(text);
    const hasGithub = /github\.com/i.test(text);

    if (hasLinkedIn || hasGithub) {
      completenessScore += 15;
      strengths.push("Online profile links (LinkedIn/GitHub) present for instant verification.");
    } else {
      issues.push({
        id: "comp-links",
        category: "completeness",
        severity: "warning",
        title: "Missing Professional Links",
        description: "Modern recruiters and ATS scanners look for LinkedIn or GitHub/portfolio URLs.",
        recommendation: "Add clickable LinkedIn profile and GitHub repository links in the header block.",
      });
      actionableFixes.push("Include your LinkedIn and GitHub/Portfolio URLs.");
    }

    const wordCount = text.trim().split(/\s+/).length;
    if (wordCount >= 250 && wordCount <= 900) {
      completenessScore = Math.min(100, completenessScore + 10);
      strengths.push(`Optimal resume length (${wordCount} words) fitting standard 1-page density.`);
    } else if (wordCount < 250) {
      completenessScore -= 25;
      issues.push({
        id: "comp-length-short",
        category: "completeness",
        severity: "critical",
        title: "Resume Too Short",
        description: `Your resume has only ~${wordCount} words. ATS parsers may flag it as an incomplete draft.`,
        recommendation: "Expand on your project architectures, responsibilities, and technical achievements.",
      });
      actionableFixes.push("Expand bullet points under projects and experience with concrete deliverables.");
    } else {
      issues.push({
        id: "comp-length-long",
        category: "completeness",
        severity: "tip",
        title: "Resume Length Notice",
        description: `Your resume is approximately ${wordCount} words. Ensure it stays within standard 1-2 pages.`,
        recommendation: "Condense descriptions to high-signal 1-2 line bullets.",
      });
    }

    // --- 3. KEYWORD STRENGTH EVALUATION ---
    let keywordScore = 65;
    const strongActionVerbs = [
      "architected",
      "engineered",
      "spearheaded",
      "developed",
      "designed",
      "deployed",
      "optimized",
      "orchestrated",
      "streamlined",
      "automated",
      "implemented",
      "integrated",
      "resolved",
      "reduced",
      "scaled",
    ];

    const weakPhrases = [
      "responsible for",
      "helped with",
      "worked on",
      "assisted in",
      "duties included",
      "handled",
    ];

    let strongVerbCount = 0;
    for (const verb of strongActionVerbs) {
      if (new RegExp(`\\b${verb}\\b`, "i").test(text)) {
        strongVerbCount++;
      }
    }

    let weakPhraseCount = 0;
    for (const weak of weakPhrases) {
      if (lower.includes(weak)) {
        weakPhraseCount++;
      }
    }

    if (strongVerbCount >= 5) {
      keywordScore += 25;
      strengths.push(`High density of strong technical action verbs (${strongVerbCount} distinct power verbs found).`);
    } else {
      issues.push({
        id: "kw-verbs",
        category: "keyword",
        severity: "warning",
        title: "Low Action Verb Density",
        description: "Only a few strong action verbs were detected. Bullet points should start with decisive verbs.",
        recommendation: "Replace passive phrases with verbs like 'Architected', 'Optimized', 'Engineered', or 'Deployed'.",
      });
      actionableFixes.push("Use our 1-Click AI Bullet Improver to replace passive phrasing with power verbs.");
    }

    if (weakPhraseCount > 0) {
      keywordScore -= weakPhraseCount * 5;
      issues.push({
        id: "kw-weak",
        category: "keyword",
        severity: "warning",
        title: `Passive Phrasing Detected (${weakPhraseCount} instances)`,
        description: "Found phrases like 'responsible for' or 'worked on' which weaken applicant authority.",
        recommendation: "State what you directly accomplished rather than your passive responsibilities.",
      });
      actionableFixes.push("Eliminate 'responsible for' and state the direct engineering result.");
    }

    // --- 4. QUANTIFICATION EVALUATION (Metrics & Impact) ---
    let quantificationScore = 60;
    const metricsMatches = text.match(/\b\d+(\.\d+)?(%|x|k|m|cr|lakh|ms|sec|users|clients|rps|gb|tb)\b|\$\d+|\b₹\d+/gi) || [];
    const metricCount = metricsMatches.length;

    if (metricCount >= 4) {
      quantificationScore = Math.min(100, 75 + metricCount * 5);
      strengths.push(`Exceptional quantification: found ${metricCount} measurable outcomes (percentages, speed, scale, financial).`);
    } else if (metricCount >= 2) {
      quantificationScore = 72;
      strengths.push("Contains initial quantifiable figures; adding more will improve ATS rank.");
    } else {
      quantificationScore = 42;
      issues.push({
        id: "quant-low",
        category: "quantification",
        severity: "critical",
        title: "Severe Lack of Quantifiable Results",
        description: "ATS and senior hiring managers look for measurable proof of impact (e.g., 'reduced latency by 35%', 'processed 2M daily requests').",
        recommendation: "Apply Google's XYZ formula: 'Accomplished [X], measured by [Y], by doing [Z]'.",
      });
      actionableFixes.push("Add at least 3-4 specific numbers, percentage gains, or scale metrics to your achievements.");
    }

    // Clamp sub-scores between 30 and 98
    const fScore = Math.max(30, Math.min(98, Math.round(formattingScore)));
    const cScore = Math.max(30, Math.min(98, Math.round(completenessScore)));
    const kScore = Math.max(30, Math.min(98, Math.round(keywordScore)));
    const qScore = Math.max(30, Math.min(98, Math.round(quantificationScore)));

    // Overall composite score
    const overall = Math.round(fScore * 0.25 + cScore * 0.25 + kScore * 0.25 + qScore * 0.25);

    if (actionableFixes.length === 0) {
      actionableFixes.push("Your resume meets top-tier ATS criteria! Run the AI Resume Improver to polish wording further.");
    }

    return {
      id: `ats-${Date.now()}`,
      resumeName,
      overallScore: overall,
      formattingScore: fScore,
      completenessScore: cScore,
      keywordStrengthScore: kScore,
      quantificationScore: qScore,
      strengths,
      issues,
      actionableFixes,
      scannedAt: new Date().toISOString(),
    };
  }
}

export const atsScanner = new ATSScannerService();
