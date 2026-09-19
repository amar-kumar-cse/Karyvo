"use client";

import { useState } from "react";
import { MasterCareerProfile } from "@/types/profile";
import { Resume, ResumeContent, ResumeVersion } from "@/types/resume";
import { PhysicallyLitResumePreview } from "./physically-lit-preview";
import {
  GlassCard,
  GlassPanel,
  GlassButton,
  GlassInput,
  GlassTextarea,
  GlassBadge,
  GlassModal,
} from "@/components/ui/glass";
import {
  Sparkles,
  Save,
  History,
  Download,
  Plus,
  Trash2,
  Check,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Eye,
  Edit3,
  Layers,
  Wand2,
  FileDown,
} from "lucide-react";

interface Props {
  initialResume: Resume;
  profile: MasterCareerProfile;
  versions: ResumeVersion[];
}

export function ResumeBuilderWorkspace({ initialResume, profile, versions: initialVersions }: Props) {
  const [resume, setResume] = useState<Resume>(initialResume);
  const [content, setContent] = useState<ResumeContent>(initialResume.content);
  const [step, setStep] = useState<number>(1);
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [improvingIndex, setImprovingIndex] = useState<string | null>(null);
  const [versions, setVersions] = useState<ResumeVersion[]>(initialVersions);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [newVersionLabel, setNewVersionLabel] = useState("");
  const [createVersionOnSave, setCreateVersionOnSave] = useState(false);

  // Steps definition
  const steps = [
    { num: 1, label: "Personal" },
    { num: 2, label: "Education" },
    { num: 3, label: "Experience" },
    { num: 4, label: "Projects" },
    { num: 5, label: "Skills" },
    { num: 6, label: "Certifications" },
    { num: 7, label: "Finalize & Export" },
  ];

  // AI Bullet Improver handler
  const handleImproveBullet = async (section: "exp" | "proj", itemId: string, bulletIdx: number) => {
    const key = `${section}-${itemId}-${bulletIdx}`;
    setImprovingIndex(key);

    let rawText = "";
    if (section === "exp") {
      const exp = content.experience.find((e) => e.id === itemId);
      rawText = exp?.bullets[bulletIdx] || "";
    } else {
      const proj = content.projects.find((p) => p.id === itemId);
      rawText = proj?.bullets[bulletIdx] || "";
    }

    try {
      const res = await fetch("/api/ai/improve-bullet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bullet: rawText, context: resume.targetRole }),
      });
      const data = await res.json();
      if (data.success && data.data?.improved) {
        if (section === "exp") {
          setContent((prev) => ({
            ...prev,
            experience: prev.experience.map((e) =>
              e.id === itemId
                ? {
                  ...e,
                  bullets: e.bullets.map((b, i) => (i === bulletIdx ? data.data.improved : b)),
                }
                : e
            ),
          }));
        } else {
          setContent((prev) => ({
            ...prev,
            projects: prev.projects.map((p) =>
              p.id === itemId
                ? {
                  ...p,
                  bullets: p.bullets.map((b, i) => (i === bulletIdx ? data.data.improved : b)),
                }
                : p
            ),
          }));
        }
      }
    } catch (err) {
      console.error("AI Bullet improvement failed:", err);
    } finally {
      setImprovingIndex(null);
    }
  };

  // AI Summary Generator handler
  const handleGenerateSummary = async () => {
    try {
      const res = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRole: resume.targetRole }),
      });
      const data = await res.json();
      if (data.success && data.data?.summary) {
        setContent((prev) => ({
          ...prev,
          personal: {
            ...prev.personal,
            summary: data.data.summary,
          },
        }));
      }
    } catch (err) {
      console.error("Failed to generate summary:", err);
    }
  };

  // Sync from Master Career Profile
  const handleSyncFromProfile = () => {
    setContent({
      personal: {
        fullName: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        location: profile.location,
        linkedinUrl: profile.linkedinUrl,
        githubUrl: profile.githubUrl,
        portfolioUrl: profile.portfolioUrl,
        summary: profile.summary,
      },
      education: profile.education,
      experience: profile.experience,
      projects: profile.projects,
      skills: profile.skills,
      certifications: profile.certifications,
      achievements: profile.achievements,
    });
  };

  // Save Resume & create version if requested
  const handleSaveResume = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: resume.id,
          title: resume.title,
          targetRole: resume.targetRole,
          templateId: resume.templateId,
          content,
          createVersion: createVersionOnSave,
          versionLabel: newVersionLabel.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        if (createVersionOnSave) {
          const vRes = await fetch(`/api/resume/${resume.id}/versions`);
          const vData = await vRes.json();
          if (vData.success) {
            setVersions(vData.data);
          }
          setCreateVersionOnSave(false);
          setNewVersionLabel("");
        }
      }
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Restore Version
  const handleRestoreVersion = async (v: ResumeVersion) => {
    try {
      const res = await fetch(`/api/resume/${resume.id}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionId: v.id }),
      });
      const data = await res.json();
      if (data.success) {
        setContent(data.data.content);
        setShowVersionModal(false);
      }
    } catch (err) {
      console.error("Restore failed:", err);
    }
  };

  return (
    <div className="mx-auto max-w-[1600px] px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Floating Glass Header Bar */}
      <GlassPanel className="p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={resume.title}
                onChange={(e) => setResume({ ...resume, title: e.target.value })}
                className="bg-transparent text-xl sm:text-2xl font-extrabold text-slate-900 font-heading focus:outline-none focus:border-b border-indigo-500 max-w-sm"
              />
              <GlassBadge variant="violet" className="text-[10px]">
                {resume.templateId.replace("-", " ").toUpperCase()}
              </GlassBadge>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span>Target Role:</span>
              <input
                type="text"
                value={resume.targetRole}
                onChange={(e) => setResume({ ...resume, targetRole: e.target.value })}
                placeholder="e.g. Full-Stack Developer"
                className="bg-white/90 px-2.5 py-1 rounded-lg text-slate-800 border border-slate-200 focus:border-indigo-500 focus:outline-none text-xs shadow-sm"
              />
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Template Switcher */}
            <select
              value={resume.templateId}
              onChange={(e) => setResume({ ...resume, templateId: e.target.value as any })}
              className="bg-white/95 text-xs font-medium text-slate-800 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 shadow-sm"
            >
              <option value="modern-tech">Template: Modern Tech</option>
              <option value="minimal-ats">Template: Minimal ATS</option>
              <option value="executive">Template: Executive</option>
              <option value="fresher-friendly">Template: Fresher Friendly</option>
            </select>

            {/* Sync from Master Profile */}
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={handleSyncFromProfile}
              title="Import updated facts from Master Career Profile"
            >
              <RotateCcw className="h-3.5 w-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Sync Profile</span>
            </GlassButton>

            {/* Version History Button */}
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={() => setShowVersionModal(true)}
            >
              <History className="h-3.5 w-3.5 text-amber-400" />
              <span>Versions ({versions.length})</span>
            </GlassButton>

            {/* Print/Download PDF */}
            <GlassButton
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="border-amber-400/40 text-amber-300 hover:bg-amber-500/10"
            >
              <FileDown className="h-3.5 w-3.5" />
              <span>Print PDF</span>
            </GlassButton>

            {/* Save Button */}
            <GlassButton
              variant="primary"
              size="sm"
              onClick={handleSaveResume}
              loading={isSaving}
            >
              {saveSuccess ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Save className="h-3.5 w-3.5" />}
              <span>{saveSuccess ? "Saved!" : "Save Resume"}</span>
            </GlassButton>
          </div>
        </div>
      </GlassPanel>

      {/* Mobile Tab Switcher (Edit vs Preview) */}
      <div className="flex md:hidden items-center justify-center p-1 rounded-2xl glass-surface border border-white/[0.08]">
        <button
          onClick={() => setMobileTab("edit")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all ${mobileTab === "edit" ? "bg-violet-600 text-white shadow-md" : "text-slate-400"
            }`}
        >
          <Edit3 className="h-3.5 w-3.5" /> Edit Resume
        </button>
        <button
          onClick={() => setMobileTab("preview")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all ${mobileTab === "preview" ? "bg-violet-600 text-white shadow-md" : "text-slate-400"
            }`}
        >
          <Eye className="h-3.5 w-3.5" /> Live Preview
        </button>
      </div>

      {/* 7-Step Navigation Bar */}
      <div className="overflow-x-auto no-print">
        <div className="flex items-center gap-2 min-w-[720px]">
          {steps.map((s) => (
            <button
              key={s.num}
              onClick={() => setStep(s.num)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${step === s.num
                  ? "bg-violet-600/20 text-violet-200 border-violet-500/40 shadow-[0_0_15px_rgba(139,92,246,0.18)]"
                  : "bg-white/[0.02] text-slate-400 border-white/[0.06] hover:bg-white/[0.05]"
                }`}
            >
              <span
                className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold font-heading ${step === s.num ? "bg-violet-600 text-white" : "bg-white/10 text-slate-400"
                  }`}
              >
                {s.num}
              </span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Workspace Split Layout: Desktop (Editor | Physically-Lit Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-2">
        {/* ========================================================= */}
        {/* LEFT COLUMN: 7-STEP EDITOR IN GLASS CARDS */}
        {/* ========================================================= */}
        <div
          className={`lg:col-span-6 space-y-6 ${mobileTab === "preview" ? "hidden lg:block" : "block"
            }`}
        >
          {/* STEP 1: PERSONAL */}
          {step === 1 && (
            <GlassPanel header="1. Personal & Contact Information">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Full Name</label>
                  <GlassInput
                    type="text"
                    value={content.personal.fullName}
                    onChange={(e) =>
                      setContent({ ...content, personal: { ...content.personal, fullName: e.target.value } })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Email</label>
                  <GlassInput
                    type="email"
                    value={content.personal.email}
                    onChange={(e) =>
                      setContent({ ...content, personal: { ...content.personal, email: e.target.value } })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Phone</label>
                  <GlassInput
                    type="text"
                    value={content.personal.phone}
                    onChange={(e) =>
                      setContent({ ...content, personal: { ...content.personal, phone: e.target.value } })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Location</label>
                  <GlassInput
                    type="text"
                    value={content.personal.location}
                    onChange={(e) =>
                      setContent({ ...content, personal: { ...content.personal, location: e.target.value } })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">LinkedIn URL</label>
                  <GlassInput
                    type="text"
                    value={content.personal.linkedinUrl}
                    onChange={(e) =>
                      setContent({ ...content, personal: { ...content.personal, linkedinUrl: e.target.value } })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">GitHub URL</label>
                  <GlassInput
                    type="text"
                    value={content.personal.githubUrl}
                    onChange={(e) =>
                      setContent({ ...content, personal: { ...content.personal, githubUrl: e.target.value } })
                    }
                  />
                </div>
              </div>

              {/* Summary with AI Generator */}
              <div className="pt-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-slate-400">Professional Summary</label>
                  <button
                    onClick={handleGenerateSummary}
                    className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 font-semibold"
                  >
                    <Wand2 className="h-3 w-3" />
                    <span>AI Generate Summary</span>
                  </button>
                </div>
                <GlassTextarea
                  rows={4}
                  value={content.personal.summary}
                  onChange={(e) =>
                    setContent({ ...content, personal: { ...content.personal, summary: e.target.value } })
                  }
                />
              </div>
            </GlassPanel>
          )}

          {/* STEP 2: EDUCATION */}
          {step === 2 && (
            <GlassPanel
              header="2. Education & Degree"
              actions={
                <GlassButton
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setContent((prev) => ({
                      ...prev,
                      education: [
                        ...prev.education,
                        {
                          id: `edu-${Date.now()}`,
                          college: "",
                          degree: "B.Tech",
                          branch: "Computer Science",
                          cgpa: "",
                          startYear: "2020",
                          graduationYear: "2024",
                        },
                      ],
                    }))
                  }
                  className="text-violet-400"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Degree
                </GlassButton>
              }
            >
              {content.education.map((edu, idx) => (
                <div key={edu.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-violet-300 font-heading">Degree #{idx + 1}</span>
                    <button
                      onClick={() =>
                        setContent((prev) => ({
                          ...prev,
                          education: prev.education.filter((e) => e.id !== edu.id),
                        }))
                      }
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">College / University</label>
                      <GlassInput
                        type="text"
                        value={edu.college}
                        onChange={(e) =>
                          setContent((prev) => ({
                            ...prev,
                            education: prev.education.map((item) =>
                              item.id === edu.id ? { ...item, college: e.target.value } : item
                            ),
                          }))
                        }
                        className="py-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Degree & Branch</label>
                      <GlassInput
                        type="text"
                        value={`${edu.degree} in ${edu.branch}`}
                        onChange={(e) =>
                          setContent((prev) => ({
                            ...prev,
                            education: prev.education.map((item) =>
                              item.id === edu.id ? { ...item, degree: e.target.value } : item
                            ),
                          }))
                        }
                        className="py-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">CGPA / Percentage</label>
                      <GlassInput
                        type="text"
                        value={edu.cgpa}
                        placeholder="e.g. 8.92"
                        onChange={(e) =>
                          setContent((prev) => ({
                            ...prev,
                            education: prev.education.map((item) =>
                              item.id === edu.id ? { ...item, cgpa: e.target.value } : item
                            ),
                          }))
                        }
                        className="py-1.5 text-xs font-heading font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Graduation Year</label>
                      <GlassInput
                        type="text"
                        value={edu.graduationYear}
                        onChange={(e) =>
                          setContent((prev) => ({
                            ...prev,
                            education: prev.education.map((item) =>
                              item.id === edu.id ? { ...item, graduationYear: e.target.value } : item
                            ),
                          }))
                        }
                        className="py-1.5 text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </GlassPanel>
          )}

          {/* STEP 3: EXPERIENCE WITH 1-CLICK AI BULLET IMPROVER */}
          {step === 3 && (
            <GlassPanel
              header="3. Professional Experience & Internships"
              actions={
                <GlassButton
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setContent((prev) => ({
                      ...prev,
                      experience: [
                        ...prev.experience,
                        {
                          id: `exp-${Date.now()}`,
                          company: "",
                          role: "",
                          location: "India",
                          startDate: "2023",
                          endDate: "Present",
                          isCurrent: true,
                          bullets: ["Architected scalable service delivering measurable outcome."],
                        },
                      ],
                    }))
                  }
                  className="text-violet-400"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Experience
                </GlassButton>
              }
            >
              {content.experience.map((exp) => (
                <div key={exp.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-violet-300 font-heading">
                      {exp.company || "New Company"}
                    </span>
                    <button
                      onClick={() =>
                        setContent((prev) => ({
                          ...prev,
                          experience: prev.experience.filter((e) => e.id !== exp.id),
                        }))
                      }
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Company</label>
                      <GlassInput
                        type="text"
                        value={exp.company}
                        onChange={(e) =>
                          setContent((prev) => ({
                            ...prev,
                            experience: prev.experience.map((item) =>
                              item.id === exp.id ? { ...item, company: e.target.value } : item
                            ),
                          }))
                        }
                        className="py-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Role Title</label>
                      <GlassInput
                        type="text"
                        value={exp.role}
                        onChange={(e) =>
                          setContent((prev) => ({
                            ...prev,
                            experience: prev.experience.map((item) =>
                              item.id === exp.id ? { ...item, role: e.target.value } : item
                            ),
                          }))
                        }
                        className="py-1.5 text-xs"
                      />
                    </div>
                  </div>

                  {/* Bullet points */}
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-semibold text-slate-400">Accomplishment Bullets</label>
                      <button
                        onClick={() =>
                          setContent((prev) => ({
                            ...prev,
                            experience: prev.experience.map((item) =>
                              item.id === exp.id
                                ? { ...item, bullets: [...item.bullets, "Developed high-impact deliverable."] }
                                : item
                            ),
                          }))
                        }
                        className="text-[11px] text-violet-400 hover:underline"
                      >
                        + Add Bullet
                      </button>
                    </div>

                    {exp.bullets.map((bullet, bIdx) => (
                      <div key={bIdx} className="space-y-1">
                        <div className="flex items-start gap-2">
                          <GlassTextarea
                            rows={2}
                            value={bullet}
                            onChange={(e) =>
                              setContent((prev) => ({
                                ...prev,
                                experience: prev.experience.map((item) =>
                                  item.id === exp.id
                                    ? {
                                      ...item,
                                      bullets: item.bullets.map((b, i) => (i === bIdx ? e.target.value : b)),
                                    }
                                    : item
                                ),
                              }))
                            }
                            className="p-2 text-xs"
                          />
                          <button
                            onClick={() => handleImproveBullet("exp", exp.id, bIdx)}
                            disabled={improvingIndex === `exp-${exp.id}-${bIdx}`}
                            title="Transform using Google XYZ Formula"
                            className="p-2 rounded-xl bg-violet-600/20 hover:bg-violet-600/35 border border-violet-500/30 text-violet-300 text-xs flex items-center gap-1 font-medium transition-all shrink-0"
                          >
                            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                            <span className="hidden sm:inline">XYZ AI</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </GlassPanel>
          )}

          {/* STEP 4: PROJECTS */}
          {step === 4 && (
            <GlassPanel
              header="4. Technical Projects"
              actions={
                <GlassButton
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setContent((prev) => ({
                      ...prev,
                      projects: [
                        ...prev.projects,
                        {
                          id: `proj-${Date.now()}`,
                          title: "",
                          techStack: ["React", "TypeScript", "Node.js"],
                          liveUrl: "",
                          bullets: ["Engineered full-stack system with sub-second latency."],
                        },
                      ],
                    }))
                  }
                  className="text-violet-400"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Project
                </GlassButton>
              }
            >
              {content.projects.map((proj) => (
                <div key={proj.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-violet-300 font-heading">
                      {proj.title || "Project Title"}
                    </span>
                    <button
                      onClick={() =>
                        setContent((prev) => ({
                          ...prev,
                          projects: prev.projects.filter((p) => p.id !== proj.id),
                        }))
                      }
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Project Title</label>
                      <GlassInput
                        type="text"
                        value={proj.title}
                        onChange={(e) =>
                          setContent((prev) => ({
                            ...prev,
                            projects: prev.projects.map((item) =>
                              item.id === proj.id ? { ...item, title: e.target.value } : item
                            ),
                          }))
                        }
                        className="py-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Tech Stack (comma separated)</label>
                      <GlassInput
                        type="text"
                        value={proj.techStack?.join(", ") || ""}
                        onChange={(e) =>
                          setContent((prev) => ({
                            ...prev,
                            projects: prev.projects.map((item) =>
                              item.id === proj.id
                                ? { ...item, techStack: e.target.value.split(",").map((s) => s.trim()) }
                                : item
                            ),
                          }))
                        }
                        className="py-1.5 text-xs"
                      />
                    </div>
                  </div>

                  {/* Bullets with AI improver */}
                  <div className="space-y-2 pt-1">
                    {proj.bullets.map((b, bIdx) => (
                      <div key={bIdx} className="flex items-start gap-2">
                        <GlassTextarea
                          rows={2}
                          value={b}
                          onChange={(e) =>
                            setContent((prev) => ({
                              ...prev,
                              projects: prev.projects.map((item) =>
                                item.id === proj.id
                                  ? {
                                    ...item,
                                    bullets: item.bullets.map((bul, i) => (i === bIdx ? e.target.value : bul)),
                                  }
                                  : item
                              ),
                            }))
                          }
                          className="p-2 text-xs"
                        />
                        <button
                          onClick={() => handleImproveBullet("proj", proj.id, bIdx)}
                          className="p-2 rounded-xl bg-violet-600/20 hover:bg-violet-600/35 border border-violet-500/30 text-violet-300 text-xs flex items-center gap-1 font-medium shrink-0"
                        >
                          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                          <span className="hidden sm:inline">XYZ AI</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </GlassPanel>
          )}

          {/* STEP 5: SKILLS */}
          {step === 5 && (
            <GlassPanel header="5. Technical & Leadership Competencies">
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Core & Technical Skills</label>
                  <GlassInput
                    type="text"
                    value={content.skills.technical.join(", ")}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        skills: {
                          ...content.skills,
                          technical: e.target.value.split(",").map((s) => s.trim()),
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Frameworks & Libraries</label>
                  <GlassInput
                    type="text"
                    value={content.skills.frameworks.join(", ")}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        skills: {
                          ...content.skills,
                          frameworks: e.target.value.split(",").map((s) => s.trim()),
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Tools, Databases & Cloud</label>
                  <GlassInput
                    type="text"
                    value={content.skills.tools.join(", ")}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        skills: {
                          ...content.skills,
                          tools: e.target.value.split(",").map((s) => s.trim()),
                        },
                      })
                    }
                  />
                </div>
              </div>
            </GlassPanel>
          )}

          {/* STEP 6: CERTIFICATIONS */}
          {step === 6 && (
            <GlassPanel header="6. Certifications & Key Achievements">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-semibold block">Key Honors & Hackathon Ranks</label>
                  <GlassTextarea
                    rows={3}
                    value={content.achievements.join("\n")}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        achievements: e.target.value.split("\n").filter((a) => a.trim()),
                      })
                    }
                    placeholder="Enter one achievement per line"
                  />
                </div>
              </div>
            </GlassPanel>
          )}

          {/* STEP 7: FINALIZE, LABEL-BASED VERSIONING & PRINT */}
          {step === 7 && (
            <GlassPanel header="7. Finalize, Version & Export">
              {/* Version Snapshot Section */}
              <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/[0.04] space-y-3">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm font-semibold text-slate-900 font-heading">Save as Labeled Version</span>
                </div>
                <p className="text-xs text-slate-600">
                  Tag this snapshot so you can instantly switch between focused variants (e.g. &quot;Backend Focus&quot;, &quot;Fresher Placement&quot;, &quot;SDE-2&quot;).
                </p>
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <GlassInput
                    type="text"
                    value={newVersionLabel}
                    onChange={(e) => setNewVersionLabel(e.target.value)}
                    placeholder="e.g. Backend Focus v2"
                    className="flex-1 py-1.5 text-xs"
                  />
                  <GlassButton
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setCreateVersionOnSave(true);
                      handleSaveResume();
                    }}
                  >
                    Snapshot Version
                  </GlassButton>
                </div>
              </div>

              {/* PDF Export Banner */}
              <div className="p-4 rounded-xl border border-amber-400/30 bg-amber-500/[0.04] space-y-2">
                <span className="text-sm font-semibold text-amber-300 block font-heading">
                  Print & Chromium Export Ready
                </span>
                <p className="text-xs text-slate-400">
                  Your resume preview matches the exported PDF pixel-for-pixel with zero client-side layout distortion.
                </p>
                <GlassButton
                  variant="gold"
                  size="md"
                  onClick={() => window.print()}
                  className="mt-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download / Print Clean PDF</span>
                </GlassButton>
              </div>
            </GlassPanel>
          )}

          {/* Bottom Step Prev/Next Navigator */}
          <div className="flex justify-between items-center pt-2">
            <GlassButton
              variant="outline"
              size="sm"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Previous
            </GlassButton>
            <GlassButton
              variant="primary"
              size="sm"
              onClick={() => setStep((s) => Math.min(7, s + 1))}
              disabled={step === 7}
            >
              Next Step <ArrowRight className="h-3.5 w-3.5" />
            </GlassButton>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: PHYSICALLY-LIT FLOATING LIVE PREVIEW */}
        {/* ========================================================= */}
        <div
          className={`lg:col-span-6 sticky top-24 ${mobileTab === "edit" ? "hidden lg:block" : "block"
            }`}
        >
          <div className="flex justify-between items-center px-4 py-2 mb-2 rounded-xl glass-surface border border-white/[0.06] text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-time Tactile Document Rendering</span>
            </div>
            <span className="font-heading text-[11px] text-violet-300 font-bold">100% ATS Safe</span>
          </div>

          <PhysicallyLitResumePreview content={content} templateId={resume.templateId} />
        </div>
      </div>

      {/* Version History Modal */}
      <GlassModal
        isOpen={showVersionModal}
        onClose={() => setShowVersionModal(false)}
        title="Resume Version History"
        icon={<History className="h-4 w-4 text-amber-400" />}
      >
        <div className="max-h-[350px] overflow-y-auto space-y-2.5">
          {versions.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No snapshots saved yet.</p>
          ) : (
            versions.map((v) => (
              <div
                key={v.id}
                className="p-3.5 rounded-xl bg-white/80 border border-slate-200 flex items-center justify-between shadow-sm"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 font-heading">
                    <span>{v.versionLabel}</span>
                    <GlassBadge variant="violet" className="text-[10px] py-0 px-1.5">
                      v{v.versionNumber}
                    </GlassBadge>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {new Date(v.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                  {v.changeSummary && (
                    <p className="text-[11px] text-slate-500 mt-1 italic">{v.changeSummary}</p>
                  )}
                </div>
                <GlassButton
                  variant="outline"
                  size="sm"
                  onClick={() => handleRestoreVersion(v)}
                >
                  Restore
                </GlassButton>
              </div>
            ))
          )}
        </div>
      </GlassModal>
    </div>
  );
}
