import { repository } from "@/lib/db/repository";
import { ATSScannerWorkspace } from "@/components/ats/ats-scanner-workspace";
import { atsScanner } from "@/lib/ats/scanner";

export const dynamic = "force-dynamic";

export default async function ATSPage() {
  const userId = "user-default";
  let scans = await repository.getATSScans(userId);
  const resumes = await repository.getResumes(userId);
  const primaryResume = resumes[0];

  // Synthesize clean plain-text resume for quick 1-click audit
  let sampleText = "";
  if (primaryResume) {
    const c = primaryResume.content;
    sampleText = `${c.personal.fullName}
${c.personal.email} | ${c.personal.phone} | ${c.personal.location}
LinkedIn: ${c.personal.linkedinUrl} | GitHub: ${c.personal.githubUrl}

PROFESSIONAL SUMMARY
${c.personal.summary}

WORK EXPERIENCE
${c.experience
  .map(
    (e: any) => `${e.role} at ${e.company} (${e.startDate} - ${e.endDate})\n${e.bullets.map((b: any) => `- ${b}`).join("\n")}`
  )
  .join("\n\n")}

TECHNICAL PROJECTS
${c.projects
  .map((p: any) => `${p.title} (${p.techStack.join(", ")})\n${p.bullets.map((b: any) => `- ${b}`).join("\n")}`)
  .join("\n\n")}

EDUCATION
${c.education.map((ed: any) => `${ed.college} - ${ed.degree} in ${ed.branch} (CGPA: ${ed.cgpa})`).join("\n")}

SKILLS
Technical: ${c.skills.technical.join(", ")}
Frameworks: ${c.skills.frameworks.join(", ")}
Tools: ${c.skills.tools.join(", ")}`;
  }

  // Pre-seed initial scan if repository has no scan history yet
  if (scans.length === 0 && sampleText) {
    const defaultScan = atsScanner.analyzeResume(sampleText, "Arjun_Sharma_Resume.pdf");
    await repository.saveATSScan(defaultScan, userId);
    scans = [defaultScan];
  }

  return <ATSScannerWorkspace initialScans={scans} sampleResumeText={sampleText} />;
}
