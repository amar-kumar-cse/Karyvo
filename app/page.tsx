import Link from "next/link";
import { Hero3DResumeCard } from "@/components/landing/hero-3d-card";
import { AmbientSpotlight } from "@/components/landing/ambient-spotlight";
import { InteractiveBulletDemo } from "@/components/landing/interactive-bullet-demo";
import {
  GlassCard,
  GlassBadge,
  GlassButton,
} from "@/components/ui/glass";
import {
  Sparkles,
  ShieldCheck,
  FileText,
  Send,
  Headphones,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Layers,
  Crown,
  FileDown,
  Briefcase,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative space-y-20 sm:space-y-28 pb-24 overflow-hidden">
      {/* Subtle Mouse-Follow Spotlight */}
      <AmbientSpotlight />

      {/* HERO SECTION WITH 3D ROTATING RESUME CARD */}
      <section className="relative pt-10 sm:pt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headline & Value Prop */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2">
              <GlassBadge variant="violet" className="py-1 px-3">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span>India-First AI Career Platform</span>
              </GlassBadge>
            </div>

            {/* Classic Premium Headline (Manrope 800, High Contrast, Subtle Accent) */}
            <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 font-heading tracking-tight leading-[1.12]">
              Build Your Resume. <br />
              <span className="text-indigo-600">
                Beat Corporate ATS.
              </span> <br />
              Get Interview-Ready.
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans">
              One central <strong className="text-slate-900">Master Career Profile</strong> powers your entire journey. Build ATS-proof resumes, optimize bullets with Google’s XYZ formula, craft role cover letters, and master real interview questions.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link href="/resume" className="w-full sm:w-auto">
                <GlassButton variant="primary" size="lg" className="w-full sm:w-auto">
                  <span>Build My Resume Free</span>
                  <ArrowRight className="h-4 w-4" />
                </GlassButton>
              </Link>

              <Link href="/ats" className="w-full sm:w-auto">
                <GlassButton variant="secondary" size="lg" className="w-full sm:w-auto">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Free ATS Scan</span>
                </GlassButton>
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="mt-8 pt-8 border-t border-slate-200/80 grid grid-cols-3 gap-4 text-center lg:text-left">
              <div>
                <span className="block text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">98%</span>
                <span className="text-xs text-slate-500 font-medium">ATS Pass Rate</span>
              </div>
              <div>
                <span className="block text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">XYZ</span>
                <span className="text-xs text-slate-500 font-medium">AI Bullet Formula</span>
              </div>
              <div>
                <span className="block text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">100%</span>
                <span className="text-xs text-slate-500 font-medium">Zero Hallucinations</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Interactive Rotating Card (Single WOW Moment) */}
          <div className="lg:col-span-6 flex justify-center">
            <Hero3DResumeCard />
          </div>
        </div>
      </section>

      {/* LIVE INTERACTIVE GOOGLE XYZ FORMULA DEMO */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-20 relative">
        <InteractiveBulletDemo />
      </section>

      {/* CONNECTED MASTER CAREER PROFILE LOOP */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-20 relative">
        <div className="text-center space-y-3 mb-12">
          <GlassBadge variant="violet" className="py-1 px-3">
            THE CONNECTED ARCHITECTURE
          </GlassBadge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading tracking-tight">
            Enter Your Career Facts Once. Reuse Everywhere.
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Say goodbye to disjointed tools. Karyvo routes verified information from your Master Profile across all features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Card 1: Master Profile */}
          <GlassCard variant="interactive" className="space-y-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-heading">1. Master Career Profile</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your single source of truth. Supports Fresher Mode, College, CGPA, Projects, Skills, Indian CTC expectations, and Notice Period.
            </p>
            <Link href="/profile" className="text-xs text-indigo-600 font-semibold flex items-center gap-1 pt-1 hover:underline">
              Setup Profile <ArrowRight className="h-3 w-3" />
            </Link>
          </GlassCard>

          {/* Card 2: 7-Step Builder */}
          <GlassCard variant="interactive" className="space-y-3">
            <div className="h-10 w-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-200">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-heading">2. Resume Builder</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              7-step wizard with split physically-lit live preview, Google XYZ formula bullet improvers, and named version snapshots.
            </p>
            <Link href="/resume" className="text-xs text-violet-600 font-semibold flex items-center gap-1 pt-1 hover:underline">
              Build Resume <ArrowRight className="h-3 w-3" />
            </Link>
          </GlassCard>

          {/* Card 3: Standalone ATS */}
          <GlassCard variant="interactive" className="space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-heading">3. Standalone ATS Scanner</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Grades Formatting, Section Completeness, Keyword Strength, and Measurable Quantification without needing a job description.
            </p>
            <Link href="/ats" className="text-xs text-emerald-600 font-semibold flex items-center gap-1 pt-1 hover:underline">
              Scan Resume <ArrowRight className="h-3 w-3" />
            </Link>
          </GlassCard>

          {/* Card 4: Role Interview AI */}
          <GlassCard variant="interactive" className="space-y-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <Headphones className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-heading">4. Role Mock Interview</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Select your target role dropdown. Submit answers to receive instant scoring, actionable improvements, and model solutions.
            </p>
            <Link href="/interview" className="text-xs text-amber-600 font-semibold flex items-center gap-1 pt-1 hover:underline">
              Practice Interview <ArrowRight className="h-3 w-3" />
            </Link>
          </GlassCard>
        </div>
      </section>

      {/* TEMPLATE SHOWCASE */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-20 relative">
        <GlassCard className="p-8 sm:p-12 text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
              Engineered to Match Real Industry ATS Scanners
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
              Our templates pass strict corporate parsing algorithms at Google, Amazon, Swiggy, and Razorpay without distortion.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <div className="p-5 rounded-2xl bg-white/80 border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-indigo-600 font-heading">TEMPLATE 01</span>
              <h3 className="text-base font-bold text-slate-900 font-heading">Modern Tech Clean</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Balanced two-column contact header with prominent project architectures and verified skills.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white/80 border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-emerald-600 font-heading">TEMPLATE 02</span>
              <h3 className="text-base font-bold text-slate-900 font-heading">Minimal ATS Single-Column</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                100% text-parseable layout optimized for Workday, Taleo, and Greenhouse parsers.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white/80 border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-amber-600 font-heading">TEMPLATE 03</span>
              <h3 className="text-base font-bold text-slate-900 font-heading">Fresher Placement Priority</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Elevates college, degree, CGPA, hackathon ranks, and semester project achievements.
              </p>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* CALL TO ACTION BANNER */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center z-20 relative">
        <GlassCard variant="gold" className="p-10 sm:p-14 space-y-6">
          <div className="inline-flex items-center gap-2">
            <GlassBadge variant="gold" className="py-1 px-3">
              <Crown className="h-3.5 w-3.5" />
              <span>Ready for Top Tech Offers</span>
            </GlassBadge>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading tracking-tight">
            Stop Sending Unoptimized Resumes.
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            Take your career into your own hands. Create your Master Profile, craft an ATS-grade resume, and practice mock interview questions today.
          </p>

          <div>
            <Link href="/resume">
              <GlassButton variant="primary" size="lg">
                <span>Get Started Now</span>
                <ArrowRight className="h-4 w-4" />
              </GlassButton>
            </Link>
          </div>
        </GlassCard>
      </section>
    </div>
  );
}
