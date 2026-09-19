"use client";

import { useState } from "react";
import { Sparkles, Zap, Check, Copy } from "lucide-react";
import { GlassCard, GlassButton } from "@/components/ui/glass";

interface PresetExample {
  role: string;
  before: string;
  context: string;
}

const PRESETS: PresetExample[] = [
  {
    role: "Backend SDE",
    before: "Built payment API and handled database queries for users",
    context: "SDE-1 at FinTech startup using Go, Kafka, PostgreSQL",
  },
  {
    role: "Frontend Dev",
    before: "Made dashboard UI screens in React and fixed bugs",
    context: "Frontend engineer building SaaS analytics in Next.js & Tailwind",
  },
  {
    role: "Campus Fresher",
    before: "Completed final year college project using machine learning",
    context: "B.Tech CSE final year, Python, TensorFlow, Flask API",
  },
];

export function InteractiveBulletDemo() {
  const [selectedPreset, setSelectedPreset] = useState<number>(0);
  const [inputBullet, setInputBullet] = useState<string>(PRESETS[0].before);
  const [contextText, setContextText] = useState<string>(PRESETS[0].context);
  const [improvedBullet, setImprovedBullet] = useState<string>(
    "Architected distributed payment routing microservice in Go & Kafka processing 4.2M daily transactions, reducing p99 checkout latency by 35% with 99.99% availability."
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleSelectPreset = (idx: number) => {
    setSelectedPreset(idx);
    setInputBullet(PRESETS[idx].before);
    setContextText(PRESETS[idx].context);
  };

  const handleTransform = async () => {
    if (!inputBullet.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/improve-bullet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bullet: inputBullet.trim(),
          context: contextText.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && data.data?.improved) {
        setImprovedBullet(data.data.improved);
      }
    } catch (err) {
      console.error("Failed to transform bullet:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(improvedBullet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <GlassCard variant="interactive" className="p-6 sm:p-8 rounded-2xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-indigo-600 font-heading">
                Interactive Live Demo
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-heading mt-1">
              Google XYZ Formula Bullet Improver
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Accomplished [X], as measured by [Y], by doing [Z]. Test it live below:
            </p>
          </div>

          {/* Presets */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 self-start sm:self-auto">
            {PRESETS.map((p, idx) => (
              <button
                key={p.role}
                onClick={() => handleSelectPreset(idx)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${selectedPreset === idx
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                {p.role}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Comparison Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
          {/* Input: Average Weak Bullet */}
          <div className="space-y-3 p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                  Standard / Weak Bullet
                </span>
                <span className="text-xs text-slate-500 font-medium">Unquantified & Passive</span>
              </div>
              <textarea
                value={inputBullet}
                onChange={(e) => setInputBullet(e.target.value)}
                rows={3}
                className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 resize-none outline-none focus:ring-0 leading-relaxed font-sans"
                placeholder="Type any ordinary resume bullet here..."
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-slate-500 italic" title={contextText}>
                Context: {contextText}
              </span>
              <GlassButton
                onClick={handleTransform}
                disabled={isLoading || !inputBullet.trim()}
                variant="primary"
                size="sm"
                className="gap-1.5 text-xs py-1.5 px-3 font-bold"
              >
                {isLoading ? (
                  <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    <Zap className="h-3.5 w-3.5 text-amber-300" />
                    <span>Optimize</span>
                  </>
                )}
              </GlassButton>
            </div>
          </div>

          {/* Output: Google XYZ Optimized Bullet */}
          <div className="p-5 sm:p-6 rounded-xl bg-indigo-50/70 border border-indigo-200 flex flex-col justify-between gap-4 shadow-sm">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                  Karyvo AI XYZ Transformation
                </span>
                <span className="text-xs text-emerald-600 font-mono font-bold bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                  ATS Score: 98%
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                {improvedBullet}
              </p>
            </div>

            <div className="pt-3 border-t border-indigo-200/60 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-semibold">
                <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-600 border border-indigo-200">Action Verbs</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-600 border border-amber-200">Metrics %</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-600 border border-emerald-200">Tech Scope</span>
              </div>

              <button
                onClick={handleCopy}
                type="button"
                aria-label={copied ? "Copied to clipboard" : "Copy transformed bullet to clipboard"}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-indigo-200 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                    <span className="text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
