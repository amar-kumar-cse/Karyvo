import { repository, SEED_PROFILE } from "@/lib/db/repository";
import { getServerUserId } from "@/lib/auth/getUser";
import { ATSScannerWorkspace } from "@/components/ats/ats-scanner-workspace";
import { atsScanner } from "@/lib/ats/scanner";

export const dynamic = "force-dynamic";

/** Safely synthesize plain-text resume — null-guards every field */
function buildResumeText(primaryResume: any): string {
  if (!primaryResume?.content) return "";
  const c = primaryResume.content;
  const personal = c.personal ?? {};
  const experience: any[] = Array.isArray(c.experience) ? c.experience : [];
  const projects: any[] = Array.isArray(c.projects) ? c.projects : [];
  const education: any[] = Array.isArray(c.education) ? c.education : [];
  const skills = c.skills ?? { technical: [], frameworks: [], tools: [] };

  return `${personal.fullName ?? ""}
${personal.email ?? ""} | ${personal.phone ?? ""} | ${personal.location ?? ""}
LinkedIn: ${personal.linkedinUrl ?? ""} | GitHub: ${personal.githubUrl ?? ""}

PROFESSIONAL SUMMARY
${personal.summary ?? ""}

WORK EXPERIENCE
${experience
  .map(
    (e: any) =>
      `${e.role ?? ""} at ${e.company ?? ""} (${e.startDate ?? ""} - ${e.endDate ?? ""})\n${
        Array.isArray(e.bullets) ? e.bullets.map((b: any) => `- ${b}`).join("\n") : ""
      }`
  )
  .join("\n\n")}

TECHNICAL PROJECTS
${projects
  .map(
    (p: any) =>
      `${p.title ?? ""} (${Array.isArray(p.techStack) ? p.techStack.join(", ") : ""})\n${
        Array.isArray(p.bullets) ? p.bullets.map((b: any) => `- ${b}`).join("\n") : ""
      }`
  )
  .join("\n\n")}

EDUCATION
${education
  .map((ed: any) => `${ed.college ?? ""} - ${ed.degree ?? ""} in ${ed.branch ?? ""} (CGPA: ${ed.cgpa ?? ""})`)
  .join("\n")}

SKILLS
Technical: ${Array.isArray(skills.technical) ? skills.technical.join(", ") : ""}
Frameworks: ${Array.isArray(skills.frameworks) ? skills.frameworks.join(", ") : ""}
Tools: ${Array.isArray(skills.tools) ? skills.tools.join(", ") : ""}`;
}

export default async function ATSPage() {
  try {
    const userId = await getServerUserId();
    const [fetchedScans, resumes] = await Promise.all([
      repository.getATSScans(userId),
      repository.getResumes(userId),
    ]);
    let scans = fetchedScans;
    const primaryResume = resumes[0];

    const sampleText = buildResumeText(primaryResume);

    // Pre-seed initial scan if repository has no scan history yet
    if (scans.length === 0 && sampleText.trim()) {
      const defaultScan = atsScanner.analyzeResume(sampleText, "Arjun_Sharma_Resume.pdf");
      await repository.saveATSScan(defaultScan, userId);
      scans = [defaultScan];
    }

    return <ATSScannerWorkspace initialScans={scans} sampleResumeText={sampleText} />;
  } catch (err) {
    console.error("[ATSPage] Failed to load:", err);
    return <ATSScannerWorkspace initialScans={[]} sampleResumeText="" />;
  }
}
