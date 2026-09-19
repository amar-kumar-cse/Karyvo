"use client";

import { useState } from "react";
import { ATSScanResult } from "@/types/ats";
import {
  GlassCard,
  GlassPanel,
  GlassButton,
  GlassInput,
  GlassBadge,
} from "@/components/ui/glass";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  FileText,
  Sparkles,
  ArrowRight,
  Zap,
  Check,
  Layers,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";

interface Props {
  initialScans: ATSScanResult[];
  sampleResumeText?: string;
}

export function ATSScannerWorkspace({ initialScans, sampleResumeText }: Props) {
  const [activeTab, setActiveTab] = useState<"ats-audit" | "tailoring-studio">("ats-audit");
  const [resumeText, setResumeText] = useState(sampleResumeText || "");
  const [resumeName, setResumeName] = useState("Arjun_Sharma_Resume.pdf");
  const [isScanning, setIsScanning] = useState(false);
  const [currentResult, setCurrentResult] = useState<ATSScanResult | null>(
    initialScans.length > 0 ? initialScans[0] : null
  );

  // Tailoring Studio states
  const [tailorRole, setTailorRole] = useState("Senior Full-Stack Engineer");
  const [tailorApproved, setTailorApproved] = useState<{ [key: string]: boolean }>({
    s1: true,
    s2: false,
    s3: true,
  });
  const [versionSaved, setVersionSaved] = useState(false);

  const handleRunScan = async () => {
    if (!resumeText.trim()) return;
    setIsScanning(true);
    try {
      const res = await fetch("/api/ats/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          resumeName,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCurrentResult(data.data);
      }
    } catch (err) {
      console.error("Scan error:", err);
    } finally {
      setIsScanning(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-400 border-emerald-500/40 bg-emerald-500/10";
    if (score >= 70) return "text-violet-400 border-violet-500/40 bg-violet-500/10";
    return "text-amber-400 border-amber-500/40 bg-amber-500/10";
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-heading flex items-center gap-2">
              <ShieldCheck className="h-7 w-7 text-emerald-600" />
              Corporate ATS Resume Engine
            </h1>
            <GlassBadge variant="emerald" className="font-heading">
              Universal Grader & Studio
            </GlassBadge>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            Audit your resume against strict corporate ATS algorithms and run AI Tailoring suggestions without needing a disjointed external tracker.
          </p>
        </div>

        {/* View Switcher: ATS Audit vs Tailoring Studio */}
        <div className="inline-flex items-center p-1 rounded-2xl bg-white/80 border border-slate-200 shadow-sm">
          <button
            onClick={() => setActiveTab("ats-audit")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${activeTab === "ats-audit" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
          >
            Standalone ATS Audit
          </button>
          <button
            onClick={() => setActiveTab("tailoring-studio")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${activeTab === "tailoring-studio"
              ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
              : "text-slate-600 hover:text-slate-900"
              }`}
          >
            AI Tailoring Studio
          </button>
        </div>
      </div>

      {/* ============================================================= */}
      {/* TAB 1: STANDALONE ATS AUDIT */}
      {/* ============================================================= */}
      {activeTab === "ats-audit" && (
        <div className="space-y-8">
          {/* Input Section */}
          <GlassPanel header="Resume Text Payload" className="space-y-4">
            <textarea
              rows={7}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste full resume text or load from current active resume..."
              className="w-full bg-white border border-slate-200 rounded-xl p-4 text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500 leading-relaxed shadow-sm"
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-slate-600 font-medium">File Label:</span>
                <GlassInput
                  type="text"
                  value={resumeName}
                  onChange={(e) => setResumeName(e.target.value)}
                  className="py-1 px-2.5 text-xs w-56"
                />
              </div>

              <GlassButton
                variant="primary"
                size="md"
                onClick={handleRunScan}
                disabled={isScanning || !resumeText.trim()}
                loading={isScanning}
                className="w-full sm:w-auto"
              >
                <Zap className="h-4 w-4 text-amber-300 fill-amber-300" />
                <span>{isScanning ? "Auditing Resume..." : "Run ATS Universal Scan"}</span>
              </GlassButton>
            </div>
          </GlassPanel>

          {/* Results Dashboard */}
          {currentResult && (
            <div className="space-y-6 animate-in fade-in duration-500">
              {/* Top Score Banner */}
              <GlassCard className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Overall Radial Gauge */}
                <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <div
                    className={`flex h-28 w-28 items-center justify-center rounded-full border-4 ${getScoreColor(
                      currentResult.overallScore
                    )} shadow-md mb-3`}
                  >
                    <span className="text-3xl font-extrabold font-heading text-slate-900">{currentResult.overallScore}</span>
                    <span className="text-xs text-slate-500 font-heading">/100</span>
                  </div>
                  <div className="text-base font-bold text-slate-900 font-heading">Overall ATS Score</div>
                  <p className="text-xs text-slate-500 mt-1">
                    {currentResult.overallScore >= 85
                      ? "Top 5% candidate pool ready"
                      : currentResult.overallScore >= 70
                        ? "Good baseline, requires metric tuning"
                        : "Needs significant quantification & verb fixes"}
                  </p>
                </div>

                {/* 4 Pillar Breakdown Bars */}
                <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Pillar 1: Formatting */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-800">1. Formatting Compliance</span>
                      <span className="font-heading font-extrabold text-emerald-600">{currentResult.formattingScore}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                        style={{ width: `${currentResult.formattingScore}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 block">Header standard, fonts, layout safety</span>
                  </div>

                  {/* Pillar 2: Completeness */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-800">2. Section Completeness</span>
                      <span className="font-heading font-extrabold text-indigo-600">{currentResult.completenessScore}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                        style={{ width: `${currentResult.completenessScore}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 block">Contact, LinkedIn, GitHub, length density</span>
                  </div>

                  {/* Pillar 3: Keyword Strength */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-800">3. Keyword & Action Verbs</span>
                      <span className="font-heading font-extrabold text-amber-600">{currentResult.keywordStrengthScore}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-1000"
                        style={{ width: `${currentResult.keywordStrengthScore}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 block">Power verbs density, zero passive phrases</span>
                  </div>

                  {/* Pillar 4: Quantification */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-800">4. Quantification & Metrics</span>
                      <span className="font-heading font-extrabold text-amber-600">{currentResult.quantificationScore}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-1000"
                        style={{ width: `${currentResult.quantificationScore}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 block">Numbers, latency %, financial, throughput</span>
                  </div>
                </div>
              </GlassCard>

              {/* Actionable Fixes & Strengths Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <GlassCard className="p-6 space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 font-heading flex items-center gap-2 pb-2 border-b border-slate-100">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Verified Strengths</span>
                  </h3>
                  <ul className="space-y-2 text-xs">
                    {currentResult.strengths.map((str, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </GlassCard>

                {/* Actionable Recommendations */}
                <GlassCard className="p-6 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 font-heading flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <span>Actionable Recommendations</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab("tailoring-studio")}
                      className="text-[11px] text-amber-800 hover:text-amber-900 font-semibold flex items-center gap-1 transition-colors px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 shadow-sm"
                    >
                      <Sparkles className="h-3 w-3 text-amber-600" />
                      <span>Fix in Studio →</span>
                    </button>
                  </div>
                  <ul className="space-y-2 text-xs">
                    {currentResult.actionableFixes.map((fix, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <span>{fix}</span>
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 2: AI TAILORING STUDIO (Resume -> Role Context -> Suggestions -> User Approval) */}
      {/* ============================================================= */}
      {activeTab === "tailoring-studio" && (
        <div className="space-y-6">
          <GlassPanel header="AI Resume Tailoring Studio">
            <p className="text-xs text-slate-600">
              Target a specific career level or specialization. Karyvo analyzes gaps, recommends power upgrades, and lets you approve changes before saving an isolated labeled version.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="sm:col-span-2">
                <label className="text-xs text-slate-600 font-medium block mb-1">Target Specialization / Role Focus</label>
                <GlassInput
                  type="text"
                  value={tailorRole}
                  onChange={(e) => setTailorRole(e.target.value)}
                  placeholder="e.g. Senior Backend / Distributed Systems Engineer"
                />
              </div>
              <div className="flex items-end">
                <GlassButton variant="primary" size="md" className="w-full">
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  <span>Synthesize Role Gaps</span>
                </GlassButton>
              </div>
            </div>
          </GlassPanel>

          {/* Comparison Flow Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: Current Resume Gaps */}
            <GlassCard className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <FileText className="h-4 w-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 font-heading">1. Detected Keywords</h3>
              </div>
              <p className="text-xs text-slate-600">High-value terms found in your current Master Profile:</p>
              <div className="flex flex-wrap gap-1.5">
                {["PostgreSQL", "Next.js", "Redis", "Distributed Systems", "REST/gRPC"].map((t) => (
                  <GlassBadge key={t} variant="emerald" className="text-[10px]">
                    ✓ {t}
                  </GlassBadge>
                ))}
              </div>
            </GlassCard>

            {/* Column 2: Missing Skill Opportunities */}
            <GlassCard className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900 font-heading">2. Missing Power Verbs</h3>
              </div>
              <p className="text-xs text-slate-600">High-impact terms that elevate rank for {tailorRole}:</p>
              <div className="flex flex-wrap gap-1.5">
                {["High Throughput", "Fault Tolerance", "Canary Rollouts", "p99 SLA", "Micro-benchmarking"].map((t) => (
                  <GlassBadge key={t} variant="amber" className="text-[10px]">
                    + {t}
                  </GlassBadge>
                ))}
              </div>
            </GlassCard>

            {/* Column 3: Tailoring Suggestions with Approval */}
            <GlassCard className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 font-heading">3. Proposed Upgrades</h3>
              </div>
              <p className="text-xs text-slate-600">Select suggestions to incorporate into new version:</p>

              <div className="space-y-2">
                {[
                  { id: "s1", label: "Quantify payment throughput to 4.2M daily txns", approved: tailorApproved.s1 },
                  { id: "s2", label: "Elevate Distributed Workflow Project to top project", approved: tailorApproved.s2 },
                  { id: "s3", label: "Inject sub-50ms p99 latency metric in Summary", approved: tailorApproved.s3 },
                ].map((sug) => (
                  <div
                    key={sug.id}
                    onClick={() => setTailorApproved({ ...tailorApproved, [sug.id]: !sug.approved })}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-2 ${tailorApproved[sug.id]
                      ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-medium"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                  >
                    <div
                      className={`h-4 w-4 rounded flex items-center justify-center mt-0.5 ${tailorApproved[sug.id] ? "bg-emerald-600 text-white font-bold" : "border border-slate-300"
                        }`}
                    >
                      {tailorApproved[sug.id] && "✓"}
                    </div>
                    <span className="text-[11px] leading-relaxed">{sug.label}</span>
                  </div>
                ))}
              </div>

              <GlassButton
                variant="gold"
                size="sm"
                onClick={() => {
                  setVersionSaved(true);
                  setTimeout(() => setVersionSaved(false), 3000);
                }}
                className="w-full mt-2"
              >
                <Check className="h-3.5 w-3.5" />
                <span>{versionSaved ? "Snapshot Saved to Versions!" : "Create Tailored Version"}</span>
              </GlassButton>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
}
