"use client";

import Link from "next/link";
import { MasterCareerProfile } from "@/types/profile";
import { Resume, ResumeVersion } from "@/types/resume";
import { ATSScanResult } from "@/types/ats";
import { InterviewSession } from "@/types/interview";
import {
  GlassCard,
  GlassBadge,
  GlassButton,
} from "@/components/ui/glass";
import {
  User,
  FileText,
  ShieldCheck,
  Send,
  Headphones,
  Crown,
  Sparkles,
  ArrowRight,
  History,
} from "lucide-react";

interface Props {
  profile: MasterCareerProfile;
  resumes: Resume[];
  versions: ResumeVersion[];
  atsScans: ATSScanResult[];
  interviews: InterviewSession[];
}

export function DashboardWorkspace({
  profile,
  resumes,
  versions,
  atsScans,
  interviews,
}: Props) {
  const primaryResume = resumes[0];
  const latestScan = atsScans[0];
  const latestInterview = interviews[0];

  // Calculate profile completeness %
  let profileScore = 40;
  if (profile.education.length > 0) profileScore += 15;
  if (profile.experience.length > 0) profileScore += 15;
  if (profile.projects.length > 0) profileScore += 15;
  if (profile.skills.technical.length > 0) profileScore += 15;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome & Overview Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-heading flex items-center gap-2">
            Welcome back, {profile.fullName.split(" ")[0]}
            <Sparkles className="h-6 w-6 text-amber-500" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            India-first unified career cockpit. All tools draw directly from your single Master Career Profile.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/resume">
            <GlassButton variant="primary" size="md">
              <FileText className="h-4 w-4" />
              <span>Open Resume Builder</span>
            </GlassButton>
          </Link>
        </div>
      </div>

      {/* Top 4 Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Profile Completeness */}
        <GlassCard className="p-5 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <User className="h-4 w-4 text-indigo-600" /> Profile Strength
            </span>
            <span className="font-heading font-extrabold text-indigo-700 text-sm">{profileScore}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full"
              style={{ width: `${profileScore}%` }}
            />
          </div>
          <Link href="/profile" className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1 font-medium">
            Update Master Profile <ArrowRight className="h-3 w-3" />
          </Link>
        </GlassCard>

        {/* ATS Health */}
        <GlassCard className="p-5 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> ATS Baseline
            </span>
            <span className="font-heading font-extrabold text-emerald-700 text-sm">
              {latestScan ? `${latestScan.overallScore}/100` : "Ready"}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${latestScan ? latestScan.overallScore : 88}%` }}
            />
          </div>
          <Link href="/ats" className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 font-medium">
            Run Standalone Scan <ArrowRight className="h-3 w-3" />
          </Link>
        </GlassCard>

        {/* Version Snapshots */}
        <GlassCard className="p-5 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <History className="h-4 w-4 text-amber-600" /> Resume Versions
            </span>
            <span className="font-heading font-extrabold text-amber-800 text-sm">{versions.length} Saved</span>
          </div>
          <p className="text-[11px] text-slate-600 truncate">
            Latest: {versions[0]?.versionLabel || "Initial Version"}
          </p>
          <Link href="/resume" className="text-[11px] text-amber-700 hover:underline flex items-center gap-1 font-medium">
            Manage Labeled Versions <ArrowRight className="h-3 w-3" />
          </Link>
        </GlassCard>

        {/* Mock Interview Status */}
        <GlassCard className="p-5 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Headphones className="h-4 w-4 text-indigo-600" /> Interview Prep
            </span>
            <span className="font-heading font-extrabold text-indigo-700 text-sm">
              {latestInterview ? `${latestInterview.overallScore || 85}%` : "5 Roles"}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 truncate">
            {latestInterview ? latestInterview.targetRole : "Practice Tech Roles"}
          </p>
          <Link href="/interview" className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1 font-medium">
            Start Mock Session <ArrowRight className="h-3 w-3" />
          </Link>
        </GlassCard>
      </div>

      {/* Main Grid: Active Resume & Connected Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Primary Resume & Version Snapshots */}
        <div className="lg:col-span-7 space-y-6">
          <GlassCard className="p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900 font-heading">Active Primary Resume</h2>
              </div>
              <GlassBadge variant="violet" className="text-xs">
                {primaryResume.templateId.toUpperCase()}
              </GlassBadge>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 font-heading">{primaryResume.title}</h3>
              <p className="text-xs text-slate-500">
                Targeting: <span className="text-indigo-700 font-semibold">{primaryResume.targetRole}</span>
              </p>
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed pt-1">
                {primaryResume.content.personal.summary || "Complete professional summary configured."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
              <Link href="/resume">
                <GlassButton variant="primary" size="sm">
                  Edit in 7-Step Builder
                </GlassButton>
              </Link>
              <Link href="/ats">
                <GlassButton variant="secondary" size="sm">
                  Run ATS Audit
                </GlassButton>
              </Link>
            </div>
          </GlassCard>

          {/* Version History Quick Viewer */}
          <GlassCard className="p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-heading">
                  Labeled Resume Versions
                </h3>
              </div>
              <Link href="/resume" className="text-xs text-indigo-600 hover:underline">
                View All ({versions.length})
              </Link>
            </div>

            <div className="space-y-2.5">
              {versions.map((v) => (
                <div
                  key={v.id}
                  className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between transition-colors"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-900 font-heading">{v.versionLabel}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {new Date(v.createdAt).toLocaleDateString("en-IN")} • v{v.versionNumber}
                    </span>
                  </div>
                  <Link href="/resume">
                    <GlassBadge variant="violet" className="hover:bg-indigo-100 cursor-pointer">
                      Restore
                    </GlassBadge>
                  </Link>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Connected Platform Shortcuts */}
        <div className="lg:col-span-5 space-y-6">
          <GlassCard className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 font-heading">
              Connected Platform Tools
            </h3>

            <div className="space-y-3">
              {/* Standalone ATS Scanner */}
              <Link
                href="/ats"
                className="group block p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-500/50 shadow-sm transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 group-hover:text-emerald-700 font-heading">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" /> Standalone ATS Scanner
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Grades Formatting, Completeness, Keyword Strength & Quantified Metrics without needing a JD.
                </p>
              </Link>

              {/* Cover Letter AI */}
              <Link
                href="/cover-letter"
                className="group block p-4 rounded-xl bg-white border border-slate-200 hover:border-indigo-500/50 shadow-sm transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 group-hover:text-indigo-700 font-heading">
                    <Send className="h-4 w-4 text-indigo-600" /> Role Cover Letter AI
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Enter Company + Role + Tone for a persuasive, grounded cover letter ready for export.
                </p>
              </Link>

              {/* Interview AI */}
              <Link
                href="/interview"
                className="group block p-4 rounded-xl bg-white border border-slate-200 hover:border-amber-500/50 shadow-sm transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 group-hover:text-amber-700 font-heading">
                    <Headphones className="h-4 w-4 text-amber-600" /> Role Mock Interview AI
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-amber-600 transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Select your target role dropdown. Submit answers to receive instant scoring and model solutions.
                </p>
              </Link>
            </div>
          </GlassCard>

          {/* Pro Upgrade Promotion */}
          <GlassCard variant="gold" className="p-6 space-y-3">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-600 fill-amber-500/20" />
              <h3 className="text-sm font-bold text-slate-900 font-heading">Upgrade to Karyvo Pro</h3>
            </div>
            <p className="text-xs text-amber-950/80 leading-relaxed">
              Unlock unlimited XYZ AI bullet enhancements, unlimited named version snapshots, and priority interview feedback.
            </p>
            <Link href="/pricing" className="block pt-1">
              <GlassButton variant="gold" size="sm" className="w-full">
                View Pro Plans (₹499/mo)
              </GlassButton>
            </Link>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
