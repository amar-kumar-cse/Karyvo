"use client";

import { useState } from "react";
import { CoverLetter, CoverLetterTone } from "@/types/cover-letter";
import {
  GlassCard,
  GlassPanel,
  GlassButton,
  GlassInput,
  GlassBadge,
} from "@/components/ui/glass";
import {
  Send,
  Sparkles,
  Copy,
  Check,
  Building,
  Briefcase,
  Sliders,
  Printer,
  FileText,
  RotateCcw,
} from "lucide-react";

interface Props {
  initialLetters: CoverLetter[];
}

export function CoverLetterWorkspace({ initialLetters }: Props) {
  const [companyName, setCompanyName] = useState("Google India");
  const [targetRole, setTargetRole] = useState("Software Development Engineer (SDE-1)");
  const [tone, setTone] = useState<CoverLetterTone>("Confident & High-Impact");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentLetter, setCurrentLetter] = useState<CoverLetter | null>(
    initialLetters.length > 0 ? initialLetters[0] : null
  );
  const [copied, setCopied] = useState(false);
  const [lettersList, setLettersList] = useState<CoverLetter[]>(initialLetters);

  const handleGenerate = async () => {
    if (!companyName.trim() || !targetRole.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          targetRole,
          tone,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCurrentLetter(data.data);
        setLettersList([data.data, ...lettersList]);
      }
    } catch (err) {
      console.error("Cover letter error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!currentLetter?.content) return;
    navigator.clipboard.writeText(currentLetter.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-heading">
              Role Cover Letter AI
            </h1>
            <GlassBadge variant="violet" className="font-heading inline-flex items-center gap-1.5">
              <Send className="h-3 w-3 text-indigo-600" aria-hidden="true" />
              <span>Company + Role + Tone</span>
            </GlassBadge>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            Generate tailored, persuasive cover letters instantly. Genuinely grounded in your Master Career Profile with zero fluff or hallucinated experiences.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Inputs */}
        <div className="lg:col-span-5 space-y-6">
          <GlassPanel header="Target Opportunity">
            <div>
              <label className="text-xs text-slate-700 font-medium block mb-1 flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5 text-indigo-600" /> Target Company Name
              </label>
              <GlassInput
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Razorpay, Google, Swiggy"
              />
            </div>

            <div>
              <label className="text-xs text-slate-700 font-medium block mb-1 flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-indigo-600" /> Target Role Title
              </label>
              <GlassInput
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Backend Engineer"
              />
            </div>

            <div>
              <label className="text-xs text-slate-700 font-medium block mb-1 flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-amber-500" /> Communication Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as CoverLetterTone)}
                className="w-full bg-white/95 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 shadow-sm"
              >
                <option value="Professional & Polished">Professional & Polished (Corporate & Enterprise)</option>
                <option value="Confident & High-Impact">Confident & High-Impact (High-Growth Startups)</option>
                <option value="Modern & Creative">Modern & Creative (Product & Design Focus)</option>
                <option value="Enthusiastic Fresher">Enthusiastic Fresher (Campus & Graduate Drives)</option>
              </select>
            </div>

            <GlassButton
              variant="primary"
              size="md"
              onClick={handleGenerate}
              disabled={isGenerating || !companyName.trim() || !targetRole.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  <span>Synthesizing Cover Letter...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Tailored Cover Letter</span>
                </>
              )}
            </GlassButton>
          </GlassPanel>

          {/* Saved Letters History */}
          {lettersList.length > 0 && (
            <GlassCard className="p-5 space-y-3">
              <span className="text-xs font-bold text-slate-700 block font-heading">
                Saved Cover Letters
              </span>
              <div className="space-y-2 max-h-[220px] overflow-y-auto">
                {lettersList.map((letItem) => (
                  <button
                    key={letItem.id}
                    onClick={() => setCurrentLetter(letItem)}
                    className={`w-full text-left p-3 rounded-xl border transition-all text-xs ${currentLetter?.id === letItem.id
                        ? "bg-indigo-50 border-indigo-200 text-indigo-900 shadow-sm"
                        : "bg-white/80 border-slate-200 text-slate-600 hover:bg-white"
                      }`}
                  >
                    <div className="font-bold text-slate-900 font-heading">{letItem.companyName}</div>
                    <div className="text-xs text-slate-600 font-medium mt-0.5">{letItem.targetRole} • {letItem.tone}</div>
                  </button>
                ))}
              </div>
            </GlassCard>
          )}
        </div>

        {/* Right Preview */}
        <div className="lg:col-span-7">
          {currentLetter ? (
            <GlassCard className="p-6 sm:p-8 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div>
                  <h2 className="text-base font-bold text-slate-900 font-heading">{currentLetter.companyName}</h2>
                  <span className="text-xs text-indigo-600 font-medium">{currentLetter.targetRole}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <GlassButton
                    variant="secondary"
                    size="md"
                    onClick={handleGenerate}
                    title="Regenerate with fresh phrasing"
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Regenerate</span>
                  </GlassButton>
                  <GlassButton variant="secondary" size="md" onClick={handleCopy}>
                    {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    <span>{copied ? "Copied!" : "Copy"}</span>
                  </GlassButton>
                  <GlassButton
                    variant="outline"
                    size="md"
                    onClick={() => window.print()}
                    className="border-amber-400/80 bg-amber-50/70 text-amber-800 hover:bg-amber-100/70 shadow-sm"
                  >
                    <Printer className="h-4 w-4 text-amber-600" aria-hidden="true" />
                    <span>Print PDF</span>
                  </GlassButton>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-white/90 border border-slate-200 text-slate-800 text-xs sm:text-sm whitespace-pre-line leading-relaxed font-sans select-text shadow-inner">
                {currentLetter.content}
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="p-12 text-center space-y-3">
              <FileText className="h-10 w-10 text-slate-400 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-900 font-heading">No Cover Letter Generated Yet</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                Fill in the target Company Name and Role on the left to generate an authentic, customized cover letter.
              </p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
