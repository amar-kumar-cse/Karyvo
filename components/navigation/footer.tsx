import Link from "next/link";
import { Sparkles, Shield, Heart, Crown } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-white/75 backdrop-blur-xl py-12 text-slate-600">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mb-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight font-heading">KARYVO AI</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-600">
              India-first AI career ecosystem. Build your resume, beat ATS filters, craft authentic cover letters, and master interview questions — powered by one single Master Career Profile.
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200/60 select-none">
              <Shield className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              <span>Strict AI Integrity Guarantee</span>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-900 mb-3 font-heading">Connected Platform</h2>
            <ul className="space-y-2 text-sm">
              <li><Link href="/profile" className="text-slate-600 hover:text-indigo-600 transition-colors">Master Career Profile</Link></li>
              <li><Link href="/resume" className="text-slate-600 hover:text-indigo-600 transition-colors">7-Step Resume Builder</Link></li>
              <li><Link href="/ats" className="text-slate-600 hover:text-indigo-600 transition-colors">Standalone ATS Scanner</Link></li>
              <li><Link href="/cover-letter" className="text-slate-600 hover:text-indigo-600 transition-colors">Role Cover Letter AI</Link></li>
              <li><Link href="/interview" className="text-slate-600 hover:text-indigo-600 transition-colors">Mock Interview AI</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-900 mb-3 font-heading">Indian Tech Markets</h2>
            <ul className="space-y-2 text-xs text-slate-500">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-300 shrink-0" aria-hidden="true" />
                <span>Bengaluru & Hyderabad Tech Hubs</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-300 shrink-0" aria-hidden="true" />
                <span>Fresher Placement Acceleration</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-300 shrink-0" aria-hidden="true" />
                <span>CTC & Notice Period Optimization</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-300 shrink-0" aria-hidden="true" />
                <span>Product & Service Tier Standards</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-300 shrink-0" aria-hidden="true" />
                <span>RBI-compliant Razorpay Payments</span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-900 mb-3 font-heading">Pro Access</h2>
            <p className="text-sm text-slate-600 mb-3 leading-relaxed">
              Unlock unlimited AI bullet enhancements, executive PDF rendering, and role interview simulations.
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200/80 bg-white/90 hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-heading text-xs font-semibold shadow-sm transition-all"
            >
              <Crown className="h-3.5 w-3.5 text-amber-500 fill-amber-500/20" aria-hidden="true" />
              <span>Upgrade Pro (₹499/mo)</span>
            </Link>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Karyvo AI Builder. Built with pride for Indian engineers & professionals.</p>
          <div className="flex items-center gap-1">
            <span>Engineered with precision</span>
            <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500 mx-1" />
            <span>for your career velocity.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
