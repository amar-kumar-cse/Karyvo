import { repository } from "@/lib/db/repository";
import { ATSScannerWorkspace } from "@/components/ats/ats-scanner-workspace";
import { atsScanner } from "@/lib/ats/scanner";

export const dynamic = "force-dynamic";

export default async function ATSPage() {
  let scans = repository.getATSScans();
  const resumes = repository.getResumes();
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
    (e) => `${e.role} at ${e.company} (${e.startDate} - ${e.endDate})\n${e.bullets.map((b) => `- ${b}`).join("\n")}`
  )
  .join("\n\n")}

TECHNICAL PROJECTS
${c.projects
  .map((p) => `${p.title} (${p.techStack.join(", ")})\n${p.bullets.map((b) => `- ${b}`).join("\n")}`)
  .join("\n\n")}

EDUCATION
${c.education.map((ed) => `${ed.college} - ${ed.degree} in ${ed.branch} (CGPA: ${ed.cgpa})`).join("\n")}

SKILLS
Technical: ${c.skills.technical.join(", ")}
Frameworks: ${c.skills.frameworks.join(", ")}
Tools: ${c.skills.tools.join(", ")}`;
  }

  // Pre-seed initial scan if repository has no scan history yet
  if (scans.length === 0 && sampleText) {
    const defaultScan = atsScanner.analyzeResume(sampleText, "Arjun_Sharma_Resume.pdf");
    repository.saveATSScan(defaultScan);
    scans = [defaultScan];
  }

  return <ATSScannerWorkspace initialScans={scans} sampleResumeText={sampleText} />;
}
