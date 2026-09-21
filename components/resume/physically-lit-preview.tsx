"use client";

import { ResumeContent } from "@/types/resume";
import { Mail, Phone, MapPin, Globe, ExternalLink } from "lucide-react";

interface Props {
  content: ResumeContent;
  templateId?: "modern-tech" | "minimal-ats" | "executive" | "fresher-friendly";
}

export function PhysicallyLitResumePreview({ content, templateId = "modern-tech" }: Props) {
  const { personal, education, experience, projects, skills, certifications, achievements } = content;

  return (
    <div className="relative w-full flex justify-center py-6 px-2 overflow-auto select-text">
      {/* Soft warm ambient lighting behind the floating sheet */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[800px] h-[90%] bg-gradient-to-tr from-violet-600/10 via-indigo-500/5 to-amber-500/10 rounded-xl blur-3xl -z-10 pointer-events-none" />

      {/* Physically-Lit Paper Sheet (A4 Proportion standard 800px width) */}
      <div className="paper-lit-sheet w-full max-w-[820px] min-h-[1050px] p-8 sm:p-12 text-slate-900 transition-all font-sans leading-relaxed text-sm">
        {/* Subtle physical paper top-edge bevel highlight */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />

        {/* ============================================================ */}
        {/* TEMPLATE 1: MODERN TECH */}
        {/* ============================================================ */}
        {templateId === "modern-tech" && (
          <div className="space-y-6">
            {/* Header */}
            <div className="border-b-2 border-indigo-600/20 pb-5">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                {personal.fullName || "Your Full Name"}
              </h1>
              <div className="flex flex-wrap gap-y-1 gap-x-4 text-xs font-medium text-slate-600 mt-2">
                {personal.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-indigo-600" />
                    {personal.email}
                  </span>
                )}
                {personal.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-indigo-600" />
                    {personal.phone}
                  </span>
                )}
                {personal.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-indigo-600" />
                    {personal.location}
                  </span>
                )}
                {personal.linkedinUrl && (
                  <span className="flex items-center gap-1.5 text-indigo-700">
                    <Globe className="h-3.5 w-3.5" />
                    LinkedIn
                  </span>
                )}
                {personal.githubUrl && (
                  <span className="flex items-center gap-1.5 text-indigo-700">
                    <ExternalLink className="h-3.5 w-3.5" />
                    GitHub
                  </span>
                )}
              </div>
            </div>

            {/* Summary */}
            {personal.summary && (
              <div>
                <h2 className="text-sm font-bold text-slate-900 mb-1.5 border-b border-slate-200 pb-1">
                  Professional Summary
                </h2>
                <p className="text-xs text-slate-700 leading-relaxed">{personal.summary}</p>
              </div>
            )}

            {/* Experience */}
            {experience && experience.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-slate-900 mb-3 border-b border-slate-200 pb-1">
                  Work Experience
                </h2>
                <div className="space-y-4">
                  {experience.map((exp) => (
                    <div key={exp.id} className="space-y-1">
                      <div className="flex justify-between items-baseline">
                        <div className="font-bold text-slate-900 text-sm">{exp.role}</div>
                        <div className="text-xs text-slate-600 font-medium">
                          {exp.startDate} – {exp.isCurrent ? "Present" : exp.endDate}
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-indigo-700 font-semibold">
                        <span>{exp.company}</span>
                        <span className="text-slate-600 font-normal">{exp.location}</span>
                      </div>
                      <ul className="list-disc list-outside ml-4 text-xs text-slate-700 space-y-1 pt-1">
                        {exp.bullets.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {projects && projects.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-slate-900 mb-3 border-b border-slate-200 pb-1">
                  Key Technical Projects
                </h2>
                <div className="space-y-3.5">
                  {projects.map((proj) => (
                    <div key={proj.id} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          {proj.title}
                          {proj.liveUrl && <ExternalLink className="h-3.5 w-3.5 text-indigo-600" />}
                        </span>
                        {proj.techStack?.length > 0 && (
                          <span className="text-xs text-slate-600 font-mono">
                            {proj.techStack.join(" • ")}
                          </span>
                        )}
                      </div>
                      <ul className="list-disc list-outside ml-4 text-xs text-slate-700 space-y-1">
                        {proj.bullets.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {skills && (
              <div>
                <h2 className="text-sm font-bold text-slate-900 mb-2 border-b border-slate-200 pb-1">
                  Technical Competencies
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {skills.technical?.length > 0 && (
                    <div>
                      <span className="font-semibold text-slate-900">Languages & Core: </span>
                      <span className="text-slate-700">{skills.technical.join(", ")}</span>
                    </div>
                  )}
                  {skills.frameworks?.length > 0 && (
                    <div>
                      <span className="font-semibold text-slate-900">Frameworks: </span>
                      <span className="text-slate-700">{skills.frameworks.join(", ")}</span>
                    </div>
                  )}
                  {skills.tools?.length > 0 && (
                    <div>
                      <span className="font-semibold text-slate-900">DevOps & Tools: </span>
                      <span className="text-slate-700">{skills.tools.join(", ")}</span>
                    </div>
                  )}
                  {skills.soft?.length > 0 && (
                    <div>
                      <span className="font-semibold text-slate-900">Leadership: </span>
                      <span className="text-slate-700">{skills.soft.join(", ")}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Education */}
            {education && education.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-slate-900 mb-2 border-b border-slate-200 pb-1">
                  Education
                </h2>
                <div className="space-y-2">
                  {education.map((edu) => (
                    <div key={edu.id} className="flex justify-between items-baseline text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{edu.college}</div>
                        <div className="text-slate-700">
                          {edu.degree} in {edu.branch} {edu.cgpa && `• CGPA: ${edu.cgpa}`}
                        </div>
                      </div>
                      <div className="text-xs text-slate-600 font-medium">Graduation: {edu.graduationYear}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications & Achievements */}
            {((certifications && certifications.length > 0) || (achievements && achievements.length > 0)) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {certifications && certifications.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 mb-1 border-b border-slate-200 pb-0.5">
                      Certifications
                    </h3>
                    <ul className="list-disc list-outside ml-4 text-xs text-slate-700 space-y-0.5">
                      {certifications.map((c) => (
                        <li key={c.id}>
                          <span className="font-medium">{c.name}</span> – {c.issuer} ({c.issueDate})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {achievements && achievements.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 mb-1 border-b border-slate-200 pb-0.5">
                      Key Honors
                    </h3>
                    <ul className="list-disc list-outside ml-4 text-xs text-slate-700 space-y-0.5">
                      {achievements.map((ach, i) => (
                        <li key={i}>{ach}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TEMPLATE 2: MINIMAL ATS */}
        {/* ============================================================ */}
        {templateId === "minimal-ats" && (
          <div className="space-y-5 font-serif text-slate-900">
            <div className="text-center border-b border-slate-800 pb-3">
              <h1 className="text-2xl font-bold">{personal.fullName}</h1>
              <p className="text-xs text-slate-700 mt-1">
                {[personal.location, personal.phone, personal.email, personal.linkedinUrl]
                  .filter(Boolean)
                  .join(" | ")}
              </p>
            </div>

            {personal.summary && (
              <div>
                <h2 className="text-sm font-bold border-b border-slate-400 pb-0.5 mb-1.5">
                  Summary
                </h2>
                <p className="text-xs leading-relaxed">{personal.summary}</p>
              </div>
            )}

            {experience && experience.length > 0 && (
              <div>
                <h2 className="text-sm font-bold border-b border-slate-400 pb-0.5 mb-2">
                  Experience
                </h2>
                <div className="space-y-3">
                  {experience.map((exp) => (
                    <div key={exp.id}>
                      <div className="flex justify-between font-bold text-xs">
                        <span>{exp.company} – {exp.location}</span>
                        <span>{exp.startDate} – {exp.isCurrent ? "Present" : exp.endDate}</span>
                      </div>
                      <div className="italic text-xs text-slate-700">{exp.role}</div>
                      <ul className="list-disc list-inside text-xs mt-1 space-y-0.5">
                        {exp.bullets.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {education && education.length > 0 && (
              <div>
                <h2 className="text-sm font-bold border-b border-slate-400 pb-0.5 mb-1.5">
                  Education
                </h2>
                {education.map((edu) => (
                  <div key={edu.id} className="flex justify-between text-xs">
                    <div>
                      <span className="font-bold">{edu.college}</span>, {edu.degree} in {edu.branch}
                      {edu.cgpa && ` (CGPA: ${edu.cgpa})`}
                    </div>
                    <span>{edu.graduationYear}</span>
                  </div>
                ))}
              </div>
            )}

            {skills && (
              <div>
                <h2 className="text-sm font-bold border-b border-slate-400 pb-0.5 mb-1.5">
                  Skills
                </h2>
                <p className="text-xs leading-relaxed">
                  <span className="font-bold">Technical: </span>
                  {[...(skills.technical || []), ...(skills.frameworks || []), ...(skills.tools || [])].join(", ")}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TEMPLATE 3 & 4: EXECUTIVE & FRESHER-FRIENDLY FALLBACK/STYLED */}
        {/* ============================================================ */}
        {(templateId === "executive" || templateId === "fresher-friendly") && (
          <div className="space-y-5">
            <div className={`p-4 rounded-lg ${templateId === "executive" ? "bg-slate-100 border-l-4 border-slate-900" : "bg-emerald-50 border-l-4 border-emerald-600"}`}>
              <h1 className="text-2xl font-black text-slate-900">{personal.fullName}</h1>
              <p className="text-xs font-medium text-slate-600 mt-1">
                {[personal.email, personal.phone, personal.location].filter(Boolean).join(" • ")}
              </p>
            </div>

            {/* In Fresher mode, education comes first! */}
            {templateId === "fresher-friendly" && education && education.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-emerald-900 border-b border-emerald-200 pb-1 mb-2">
                  Academic Background (Fresher Priority)
                </h2>
                {education.map((edu) => (
                  <div key={edu.id} className="flex justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{edu.college}</div>
                      <div>{edu.degree} in {edu.branch} • <span className="font-semibold text-emerald-700">CGPA: {edu.cgpa}</span></div>
                    </div>
                    <span className="font-medium text-xs text-slate-600">Class of {edu.graduationYear}</span>
                  </div>
                ))}
              </div>
            )}

            {personal.summary && (
              <div>
                <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-1 mb-1.5">
                  Executive Profile
                </h2>
                <p className="text-xs text-slate-700 leading-relaxed">{personal.summary}</p>
              </div>
            )}

            {projects && projects.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-1 mb-2">
                  Projects & Implementations
                </h2>
                <div className="space-y-3">
                  {projects.map((proj) => (
                    <div key={proj.id} className="text-xs">
                      <div className="font-bold text-slate-900">{proj.title}</div>
                      <ul className="list-disc list-inside text-slate-700 mt-0.5 space-y-0.5">
                        {proj.bullets.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {skills && (
              <div>
                <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-1 mb-1.5">
                  Core Skills & Tooling
                </h2>
                <p className="text-xs text-slate-700">
                  {[...(skills.technical || []), ...(skills.frameworks || []), ...(skills.tools || [])].join(", ")}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
