"use client";

import { useState } from "react";
import { MasterCareerProfile } from "@/types/profile";
import {
  GlassCard,
  GlassPanel,
  GlassButton,
  GlassInput,
  GlassTextarea,
  GlassBadge,
} from "@/components/ui/glass";
import {
  Save,
  Check,
  User,
  GraduationCap,
  Briefcase,
  Code2,
  Award,
  Sparkles,
  Zap,
  Plus,
  Trash2,
  Coins,
  Clock,
  MapPin,
  Download,
  Upload,
} from "lucide-react";

interface Props {
  initialProfile: MasterCareerProfile;
}

export function MasterProfileWorkspace({ initialProfile }: Props) {
  const [profile, setProfile] = useState<MasterCareerProfile>(initialProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    const safeName = profile.fullName ? profile.fullName.replace(/\s+/g, "_") : "user";
    downloadAnchor.setAttribute("download", `karyvo_profile_${safeName}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && typeof parsed === "object" && ("fullName" in parsed || "personalInfo" in parsed)) {
            // Handle if someone imports either format
            if ("personalInfo" in parsed && parsed.personalInfo) {
              setProfile({
                ...profile,
                fullName: parsed.personalInfo.fullName || profile.fullName,
                email: parsed.personalInfo.email || profile.email,
                phone: parsed.personalInfo.phone || profile.phone,
                location: parsed.personalInfo.location || profile.location,
              });
            } else {
              setProfile({ ...profile, ...parsed });
            }
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
          }
        } catch (err) {
          console.error("Invalid JSON profile:", err);
        }
      };
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Save profile error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-heading flex items-center gap-2">
              <User className="h-7 w-7 text-indigo-600" />
              Master Career Profile
            </h1>
            <GlassBadge variant="emerald" className="font-heading">
              Single Source of Truth
            </GlassBadge>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            Enter your career details once. Karyvo automatically routes these verified facts into your Resume Builder, Standalone ATS Scanner, Cover Letter AI, and Interview Coach.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <input
            type="file"
            id="import-profile-input"
            accept=".json"
            onChange={handleImportJson}
            className="hidden"
          />
          <GlassButton
            variant="secondary"
            size="md"
            onClick={() => document.getElementById("import-profile-input")?.click()}
            className="flex-1 sm:flex-initial"
            title="Import profile from a JSON backup"
          >
            <Upload className="h-4 w-4 text-violet-400" />
            <span>Import JSON</span>
          </GlassButton>

          <GlassButton
            variant="secondary"
            size="md"
            onClick={handleExportJson}
            className="flex-1 sm:flex-initial"
            title="Download profile backup as JSON"
          >
            <Download className="h-4 w-4 text-emerald-400" />
            <span>Export JSON</span>
          </GlassButton>

          <GlassButton
            variant="primary"
            size="md"
            onClick={handleSave}
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            {isSaving ? (
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : saveSuccess ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{saveSuccess ? "Profile Saved!" : "Save Master Profile"}</span>
          </GlassButton>
        </div>
      </div>

      {/* Fresher Mode & Indian Market Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Fresher Mode Card */}
        <GlassCard className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-sm font-bold text-slate-900 font-heading flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              Fresher Acceleration Mode
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              Emphasizes College, CGPA, Projects, and Hackathons rather than years of experience.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
            <input
              type="checkbox"
              checked={profile.isFresherMode}
              onChange={(e) => setProfile({ ...profile, isFresherMode: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </GlassCard>

        {/* Indian Market Metrics (CTC & Notice Period) */}
        <GlassCard className="p-5 grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1 mb-1 font-heading">
              <Coins className="h-3 w-3 text-amber-500" /> Current / Expected CTC
            </label>
            <div className="flex gap-2">
              <GlassInput
                type="text"
                value={profile.currentCtc}
                placeholder="18 LPA"
                onChange={(e) => setProfile({ ...profile, currentCtc: e.target.value })}
                className="py-1.5 px-2.5 text-xs"
              />
              <GlassInput
                type="text"
                value={profile.expectedCtc}
                placeholder="28 LPA"
                onChange={(e) => setProfile({ ...profile, expectedCtc: e.target.value })}
                className="py-1.5 px-2.5 text-xs"
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1 mb-1 font-heading">
              <Clock className="h-3 w-3 text-indigo-600" /> Notice Period
            </label>
            <select
              value={profile.noticePeriod}
              onChange={(e) => setProfile({ ...profile, noticePeriod: e.target.value })}
              className="w-full bg-white/95 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 shadow-sm"
            >
              <option value="Immediate">Immediate</option>
              <option value="15 Days">15 Days</option>
              <option value="30 Days">30 Days</option>
              <option value="60 Days">60 Days</option>
              <option value="90 Days">90 Days</option>
            </select>
          </div>
        </GlassCard>
      </div>

      {/* SECTION 1: PERSONAL & CONTACT */}
      <GlassPanel
        header={
          <span className="flex items-center gap-2">
            <User className="h-4 w-4 text-violet-400" />
            1. Personal & Contact Information
          </span>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Full Name</label>
            <GlassInput
              type="text"
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Email Address</label>
            <GlassInput
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Mobile Contact</label>
            <GlassInput
              type="text"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Location</label>
            <GlassInput
              type="text"
              value={profile.location}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">LinkedIn Profile</label>
            <GlassInput
              type="text"
              value={profile.linkedinUrl}
              onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">GitHub Profile</label>
            <GlassInput
              type="text"
              value={profile.githubUrl}
              onChange={(e) => setProfile({ ...profile, githubUrl: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-1">Default Professional Summary</label>
          <GlassTextarea
            rows={3}
            value={profile.summary}
            onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
          />
        </div>
      </GlassPanel>

      {/* SECTION 2: EDUCATION */}
      <GlassPanel
        header={
          <span className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-violet-400" />
            2. Academic Background
          </span>
        }
        actions={
          <GlassButton
            variant="ghost"
            size="sm"
            onClick={() =>
              setProfile((prev) => ({
                ...prev,
                education: [
                  ...prev.education,
                  {
                    id: `edu-${Date.now()}`,
                    college: "",
                    degree: "B.Tech",
                    branch: "Computer Science",
                    cgpa: "8.5",
                    startYear: "2019",
                    graduationYear: "2023",
                  },
                ],
              }))
            }
            className="text-violet-400 hover:text-violet-300"
          >
            <Plus className="h-3.5 w-3.5" /> Add College
          </GlassButton>
        }
      >
        {profile.education.map((edu) => (
          <div key={edu.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[11px] text-slate-400 block mb-1">College / Institute</label>
                <GlassInput
                  type="text"
                  value={edu.college}
                  onChange={(e) =>
                    setProfile((prev) => ({
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
                  value={`${edu.degree} - ${edu.branch}`}
                  onChange={(e) =>
                    setProfile((prev) => ({
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
                <label className="text-[11px] text-slate-400 block mb-1">CGPA / %</label>
                <GlassInput
                  type="text"
                  value={edu.cgpa}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      education: prev.education.map((item) =>
                        item.id === edu.id ? { ...item, cgpa: e.target.value } : item
                      ),
                    }))
                  }
                  className="py-1.5 text-xs font-heading font-bold"
                />
              </div>
            </div>
          </div>
        ))}
      </GlassPanel>

      {/* SECTION 3: SKILLS */}
      <GlassPanel
        header={
          <span className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-violet-400" />
            3. Verified Skills
          </span>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Core & Technical Skills (comma separated)</label>
            <GlassInput
              type="text"
              value={profile.skills.technical.join(", ")}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  skills: { ...profile.skills, technical: e.target.value.split(",").map((s) => s.trim()) },
                })
              }
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Frameworks & Libraries</label>
            <GlassInput
              type="text"
              value={profile.skills.frameworks.join(", ")}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  skills: { ...profile.skills, frameworks: e.target.value.split(",").map((s) => s.trim()) },
                })
              }
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Databases & Cloud Tools</label>
            <GlassInput
              type="text"
              value={profile.skills.tools.join(", ")}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  skills: { ...profile.skills, tools: e.target.value.split(",").map((s) => s.trim()) },
                })
              }
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Leadership & Soft Skills</label>
            <GlassInput
              type="text"
              value={profile.skills.soft.join(", ")}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  skills: { ...profile.skills, soft: e.target.value.split(",").map((s) => s.trim()) },
                })
              }
            />
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}
