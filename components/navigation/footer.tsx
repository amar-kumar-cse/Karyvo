import Link from "next/link";
import { Sparkles, Shield, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-white/75 backdrop-blur-xl py-12 text-slate-600">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight font-heading">KARYVO AI</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">
              India-first AI career ecosystem. Build your resume, beat ATS filters, craft authentic cover letters, and master interview questions — powered by one single Master Career Profile.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-amber-700 font-medium">
              <Shield className="h-3.5 w-3.5 text-amber-600" />
              <span>Strict AI Integrity Guarantee</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3 font-heading">Connected Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/profile" className="text-slate-600 hover:text-indigo-600 transition-colors">Master Career Profile</Link></li>
              <li><Link href="/resume" className="text-slate-600 hover:text-indigo-600 transition-colors">7-Step Resume Builder</Link></li>
              <li><Link href="/ats" className="text-slate-600 hover:text-indigo-600 transition-colors">Standalone ATS Scanner</Link></li>
              <li><Link href="/cover-letter" className="text-slate-600 hover:text-indigo-600 transition-colors">Role Cover Letter AI</Link></li>
              <li><Link href="/interview" className="text-slate-600 hover:text-indigo-600 transition-colors">Mock Interview AI</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3 font-heading">Indian Tech Markets</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>Bengaluru & Hyderabad Tech Hubs</li>
              <li>Fresher Placement Acceleration</li>
              <li>CTC & Notice Period Optimization</li>
              <li>Product & Service Tier Standards</li>
              <li>RBI-compliant Razorpay Payments</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3 font-heading">Pro Access</h4>
            <p className="text-xs text-slate-600 mb-3">
              Unlock unlimited AI bullet enhancements, executive PDF rendering, and role interview simulations.
            </p>
            <Link
              href="/pricing"
              className="inline-block px-3.5 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-semibold shadow-sm transition-all"
            >
              Explore Pro Plan (₹499/mo)
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
