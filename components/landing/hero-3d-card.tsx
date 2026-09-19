"use client";

import { useEffect, useRef, useState } from "react";
import { ShieldCheck, TrendingUp, Sparkles, CheckCircle2 } from "lucide-react";
import { GlassBadge } from "@/components/ui/glass";

export function Hero3DResumeCard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: -6, y: 12 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Disable oscillation if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setRotate({ x: 0, y: 0 });
      return;
    }

    if (isHovered) return;
    let frameId: number;
    let start = performance.now();

    const animate = (time: number) => {
      const elapsed = (time - start) / 1000;
      const x = Math.sin(elapsed * 0.7) * 5 - 3;
      const y = Math.cos(elapsed * 0.5) * 8 + 8;
      setRotate({ x, y });
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isHovered]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Subtle restrained tilt (-12 to +12 degrees)
    const rY = ((mouseX / rect.width) - 0.5) * 24;
    const rX = -(((mouseY / rect.height) - 0.5) * 24);

    setRotate({ x: rX, y: rY });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full max-w-[480px] h-[550px] mx-auto flex items-center justify-center cursor-pointer select-none [perspective:1400px]"
    >
      {/* 3D Scene Root */}
      <div
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transformStyle: "preserve-3d",
          transition: isHovered ? "transform 0.1s ease-out" : "transform 0.4s ease-out",
        }}
        className="relative w-[340px] sm:w-[380px] h-[480px] rounded-2xl p-6 bg-white/95 backdrop-blur-xl border border-white/80 shadow-[0_25px_60px_-15px_rgba(30,58,138,0.18),0_10px_25px_-5px_rgba(0,0,0,0.06)]"
      >
        {/* Glow backlight inside 3D coordinate space */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-indigo-500/20 via-sky-400/20 to-violet-500/15 blur-2xl -z-10 opacity-80" />

        {/* Mini Document Top Bar */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>
          <GlassBadge variant="emerald" className="text-xs py-0.5">
            ATS PASS: 96%
          </GlassBadge>
        </div>

        {/* Resume Content Snapshot */}
        <div className="space-y-4 text-left">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-heading tracking-tight flex items-center gap-1.5">
              Arjun Sharma
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </h2>
            <p className="text-xs text-indigo-600 font-semibold">Software Development Engineer (SDE-1)</p>
            <p className="text-xs text-slate-600">Bengaluru, India • arjun@example.com • 8.92 CGPA</p>
          </div>

          {/* Experience Item */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-800">
              <span className="font-heading">Razorpay</span>
              <span className="text-xs text-slate-500">2022 – Present</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">
              <span className="text-indigo-600 font-semibold">Architected</span> distributed payment routing service handling{" "}
              <span className="text-emerald-600 font-semibold">4.2M daily transactions</span>, slashing p99 latency by{" "}
              <span className="text-emerald-600 font-semibold">35%</span>.
            </p>
          </div>

          {/* Skills Grid */}
          <div className="space-y-1.5">
            <span className="text-xs uppercase font-semibold text-slate-500 tracking-wider">Verified Skill Index</span>
            <div className="flex flex-wrap gap-1.5">
              {["React/Next.js", "Node.js", "PostgreSQL", "Go", "Docker", "Redis", "System Design"].map((skill) => (
                <span
                  key={skill}
                  className="text-xs px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Indian Market Snapshot */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-xs">
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-slate-500 block">Notice Period</span>
              <span className="text-amber-600 font-semibold font-heading">Immediate / 30D</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-slate-500 block">Work Mode</span>
              <span className="text-indigo-600 font-semibold font-heading">Bengaluru / Hybrid</span>
            </div>
          </div>
        </div>

        {/* Floating Glass Badge 1: Top Right - ATS Score 96 */}
        <div
          style={{ transform: "translateZ(45px)" }}
          className="absolute -top-4 -right-4 flex items-center gap-2 rounded-xl bg-white/95 px-3.5 py-2 border border-emerald-200 shadow-[0_8px_25px_rgba(16,185,129,0.18)] text-left"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 font-heading">96 / 100</div>
            <div className="text-xs font-medium text-emerald-600">ATS High Pass</div>
          </div>
        </div>

        {/* Floating Glass Badge 2: Bottom Left - Keywords Strong */}
        <div
          style={{ transform: "translateZ(40px)" }}
          className="absolute -bottom-4 -left-4 flex items-center gap-2 rounded-xl bg-white/95 px-3.5 py-2 border border-indigo-200 shadow-[0_8px_25px_rgba(99,102,241,0.18)] text-left"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 font-heading">Zero Passive Words</div>
            <div className="text-xs font-medium text-indigo-600">Power Verbs Verified</div>
          </div>
        </div>

        {/* Floating Glass Badge 3: Bottom Right - Gold Pro Signals */}
        <div
          style={{ transform: "translateZ(50px)" }}
          className="absolute -bottom-3 -right-3 flex items-center gap-2 rounded-xl bg-amber-50/95 border border-amber-200 px-3 py-1.5 shadow-[0_8px_25px_rgba(245,158,11,0.15)] text-left"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
            <TrendingUp className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-600 font-heading">+42% Metrics</div>
            <div className="text-xs text-slate-500">Quantified Impact</div>
          </div>
        </div>
      </div>
    </div>
  );
}
