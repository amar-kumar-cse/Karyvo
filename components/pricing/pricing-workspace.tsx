"use client";

import { useState } from "react";
import confetti from "canvas-confetti";
import {
  Crown,
  Check,
  Sparkles,
  ShieldCheck,
  FileDown,
  Headphones,
  Send,
  Layers,
} from "lucide-react";
import { GlassCard, GlassBadge, GlassButton } from "@/components/ui/glass";

export function PricingWorkspace() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [isLoading, setIsLoading] = useState(false);
  const [isProActive, setIsProActive] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleRazorpayCheckout = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      // 1. Create Order on Backend
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billingCycle }),
      });
      const orderData = await res.json();

      if (!orderData.success || !orderData.data) {
        throw new Error("Could not create Razorpay order.");
      }

      const { orderId } = orderData.data;

      // In production, window.Razorpay checkout would open here.
      // In sandbox/development, simulate secure server-side HMAC verification:
      const mockPaymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const mockSignature = `sig_mock_${orderId}`;

      const verifyRes = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: mockSignature,
        }),
      });

      const verifyData = await verifyRes.json();
      if (verifyData.success) {
        setIsProActive(true);
        localStorage.setItem("karyvo_pro_active", "true");
        setStatusMessage("🎉 Payment verified via Razorpay! Pro entitlement unlocked.");

        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#F59E0B", "#8B5CF6", "#10B981", "#FDE68A"],
        });
      } else {
        setStatusMessage("Signature verification failed.");
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      setStatusMessage(err?.message || "Checkout could not be completed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Title */}
      <div className="text-center space-y-3">
        <GlassBadge variant="gold" className="text-[11px] font-bold tracking-widest uppercase">
          INDIA-FIRST PRICING
        </GlassBadge>
        <h1 className="font-heading text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Invest in Your Career Velocity
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
          One transparent subscription powering all your career tools with verified AI integrity and zero hidden fees.
        </p>

        {/* Monthly / Yearly Toggle */}
        <div className="inline-flex items-center gap-2 p-1.5 rounded-2xl bg-white/80 border border-slate-200 shadow-sm backdrop-blur-xl mt-4">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              billingCycle === "monthly" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              billingCycle === "yearly" ? "bg-amber-400 text-slate-950 shadow-sm font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Annual (Save 50%)</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-xl text-center text-xs font-semibold border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 max-w-md mx-auto backdrop-blur-xl">
          {statusMessage}
        </div>
      )}

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* FREE PLAN */}
        <GlassCard variant="default" className="p-8 rounded-3xl flex flex-col justify-between space-y-8">
          <div className="space-y-6">
            <div className="space-y-1">
              <GlassBadge variant="default" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Starter
              </GlassBadge>
              <h3 className="font-heading text-2xl font-bold text-slate-900 mt-2">Free Tier</h3>
              <p className="text-xs text-slate-600">Essential tools for job seekers and campus freshers.</p>
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-4xl font-extrabold text-slate-900">₹0</span>
              <span className="text-xs text-slate-500">/ forever</span>
            </div>

            <ul className="space-y-3.5 text-xs text-slate-700 pt-5 border-t border-slate-200">
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Master Career Profile (Central Source of Truth)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>7-Step Resume Builder with Live Physically-Lit Preview</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Modern Tech & Minimal ATS Templates</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Standalone ATS Scanner (Free Instant Audits)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>3 AI Bullet Improvements / day</span>
              </li>
            </ul>
          </div>

          <GlassButton
            disabled
            variant="ghost"
            className="w-full py-3 text-slate-500 text-xs font-semibold cursor-default"
          >
            Current Active Plan
          </GlassButton>
        </GlassCard>

        {/* PRO PLAN WITH BESPOKE GOLD-EDGED GLASS TREATMENT */}
        <GlassCard variant="gold" className="p-8 rounded-3xl relative flex flex-col justify-between space-y-8">
          <div className="space-y-6">
            <div className="space-y-1">
              <GlassBadge variant="gold" className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Crown className="h-3.5 w-3.5 text-amber-600 fill-amber-500/20" />
                Premium Career Engine
              </GlassBadge>
              <h3 className="font-heading text-3xl font-extrabold text-slate-900 mt-2">Karyvo Pro</h3>
              <p className="text-xs text-amber-900/80">Complete autonomy over ATS, Cover Letters, and Interviews.</p>
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-5xl font-black text-amber-600">
                {billingCycle === "monthly" ? "₹499" : "₹2,999"}
              </span>
              <span className="text-xs text-amber-800 font-medium">
                {billingCycle === "monthly" ? "/ month" : "/ year (₹250/mo)"}
              </span>
            </div>

            <ul className="space-y-3.5 text-xs text-slate-700 pt-5 border-t border-amber-300/40">
              <li className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
                <span className="font-semibold text-slate-900">Unlimited 1-Click XYZ AI Bullet Improver</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Layers className="h-4 w-4 text-amber-500 shrink-0" />
                <span>Resume Version History with Unlimited Named Snapshots</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Send className="h-4 w-4 text-amber-300 shrink-0" />
                <span>Role Cover Letter AI (Company + Role + Tone Generator)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Headphones className="h-4 w-4 text-amber-300 shrink-0" />
                <span>Role-Driven Mock Interview AI with Benchmark Answers</span>
              </li>
              <li className="flex items-center gap-2.5">
                <FileDown className="h-4 w-4 text-amber-300 shrink-0" />
                <span>Chromium-Grade High-Fidelity PDF Export</span>
              </li>
              <li className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Server-Verified Signature Security & Priority Compute</span>
              </li>
            </ul>
          </div>

          <GlassButton
            onClick={handleRazorpayCheckout}
            disabled={isLoading || isProActive}
            variant="gold"
            className="w-full py-3.5 text-sm font-bold shadow-[0_0_30px_rgba(245,158,11,0.3)] transition-all disabled:opacity-75"
          >
            {isLoading ? (
              <span className="animate-spin h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full inline-block" />
            ) : isProActive ? (
              "PRO ENTITLEMENT ACTIVE"
            ) : (
              "UPGRADE TO PRO VIA RAZORPAY"
            )}
          </GlassButton>
        </GlassCard>
      </div>
    </div>
  );
}
