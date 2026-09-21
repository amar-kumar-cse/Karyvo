"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  User,
  ShieldCheck,
  Send,
  Headphones,
  Crown,
  Sparkles,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { GlassBadge } from "@/components/ui/glass";

export function Navbar() {
  const pathname = usePathname();
  const [isPro, setIsPro] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetch("/api/payments/create-order")
      .then(() => {
        const storedPro = localStorage.getItem("karyvo_pro_active");
        if (storedPro === "true") setIsPro(true);
      })
      .catch(() => { });
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/profile", label: "Master Profile", icon: User },
    { href: "/resume", label: "Resume Builder", icon: FileText },
    { href: "/ats", label: "ATS Scanner", icon: ShieldCheck },
    { href: "/cover-letter", label: "Cover Letter", icon: Send },
    { href: "/interview", label: "Interview AI", icon: Headphones },
  ];

  return (
    <header className="sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-8 pt-3 pb-2">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 rounded-2xl border border-white/70 bg-white/75 backdrop-blur-xl shadow-[0_10px_30px_-5px_rgba(30,58,138,0.1),0_4px_12px_-2px_rgba(0,0,0,0.03)]">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group select-none">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-800 p-0.5 shadow-[0_2px_10px_rgba(79,70,229,0.25)] transition-transform duration-300 group-hover:scale-105">
            <div className="flex h-full w-full items-center justify-center rounded-lg bg-white">
              <Sparkles className="h-4 w-4 text-indigo-600 group-hover:text-violet-600 transition-colors" />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-base font-extrabold tracking-tight text-slate-900 font-heading">
              KARYVO
            </span>
            <GlassBadge variant="violet" className="text-xs py-0 px-1.5 font-bold">
              AI
            </GlassBadge>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${isActive
                  ? "text-indigo-700 bg-indigo-50/90 border border-indigo-200/80 shadow-sm font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/80 border border-transparent"
                  }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Actions (Pro Badge, Mobile Toggle) */}
        <div className="flex items-center gap-2">
          <Link
            href="/pricing"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-200/80 bg-amber-50/60 text-amber-700 hover:text-amber-800 hover:bg-amber-100/60 transition-colors text-xs font-medium"
          >
            <Crown className="h-3.5 w-3.5 text-amber-600 fill-amber-500/10" aria-hidden="true" />
            <span className="font-heading">{isPro ? "Pro Active" : "Upgrade Pro"}</span>
          </Link>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden flex items-center justify-center h-8 w-8 rounded-xl border border-slate-200 bg-white/80 text-slate-600 hover:text-slate-900 transition-colors shadow-sm"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Glass Dropdown Menu */}
      {mobileOpen && (
        <div className="md:hidden mt-2 mx-auto max-w-7xl rounded-2xl border border-white/80 bg-white/95 backdrop-blur-2xl p-4 shadow-xl space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-100">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium transition-all ${isActive
                    ? "text-indigo-700 bg-indigo-50 border border-indigo-200 font-semibold"
                    : "text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Link
              href="/resume"
              className="flex-1 py-2 rounded-xl border border-slate-200 bg-white text-center text-xs font-semibold text-slate-700 hover:text-indigo-600 shadow-sm"
            >
              Build Resume
            </Link>
            <Link
              href="/pricing"
              className="flex-1 py-2 rounded-xl border border-amber-300 bg-amber-50 text-center text-xs font-bold text-amber-800 shadow-sm"
            >
              {isPro ? "Pro Active" : "Pricing Plans"}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
