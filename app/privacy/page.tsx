import Link from "next/link";
import { ArrowLeft, Shield, Lock, Eye, FileText, CheckCircle2 } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass";

export const metadata = {
  title: "Privacy Policy | Karyvo AI Builder",
  description: "Learn how Karyvo protects your resume data, career profiles, and AI processing integrity.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 border border-indigo-200/60 text-indigo-700">
            <Shield className="h-3.5 w-3.5" />
            <span>Privacy & Data Transparency</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
            Privacy Policy & AI Transparency Notice
          </h1>
          <p className="text-sm text-slate-600">
            Last updated: October 2026. This policy explains how Karyvo handles your career data and AI workloads.
          </p>
        </div>

        <GlassPanel className="p-8 space-y-8 text-slate-700 leading-relaxed text-sm">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center gap-2">
              <Lock className="h-5 w-5 text-indigo-600" />
              <span>1. Your Career Data Belongs Exclusively to You</span>
            </h2>
            <p>
              Karyvo stores your Master Career Profile, saved resumes, version snapshots, cover letters, and interview
              evaluations in isolated database tables strictly protected by Supabase Row-Level Security (RLS). Only your
              authenticated account session can query, modify, or delete your career assets. We never sell, rent, or monetize
              your resume data or personal identifiers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center gap-2">
              <Eye className="h-5 w-5 text-indigo-600" />
              <span>2. AI Document Processing & OCR Disclosure</span>
            </h2>
            <p>
              When you upload a resume document (PDF, PNG, JPG, or WEBP) to our ATS Health Scanner or Resume Builder:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Local-First Parsing:</strong> Text-native PDFs and plain text are parsed locally on our secure server using
                in-house parsing engines.
              </li>
              <li>
                <strong>Google Gemini Multimodal OCR:</strong> If a scanned image or complex rasterized document is uploaded,
                it is processed using Google Gemini Vision API strictly for optical character extraction. The document data is
                transmitted via encrypted HTTPS and is not retained or used by third parties to train generalized public models.
              </li>
              <li>
                <strong>AI Bullet Enhancement & Summaries:</strong> When you request AI bullet rewriting or profile summaries,
                only the relevant career facts and target role are provided to the LLM.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <span>3. Anti-Hallucination & Metric Integrity Guarantee</span>
            </h2>
            <p>
              Karyvo adheres to a strict factual boundary policy. Our AI prompts are instructed to never fabricate metrics,
              invent employment history, or inject unverified performance numbers (such as speculative latency or revenue figures).
              Any bullet optimization preserves your authentic achievements while polishing phrasing and ATS alignment.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              <span>4. Data Retention, Portability & Deletion</span>
            </h2>
            <p>
              You maintain total control over your career records:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>You can export your complete profile and resume versions at any time.</li>
              <li>Deleting a resume or career profile immediately and permanently removes all related version snapshots and ATS scans from our database.</li>
              <li>Account cancellation or deletion requests can be initiated at any time from your profile settings.</li>
            </ul>
          </section>

          <section className="space-y-3 pt-4 border-t border-slate-200">
            <h2 className="text-base font-bold text-slate-900 font-heading">Contact & Security Inquiries</h2>
            <p className="text-xs text-slate-500">
              For questions regarding privacy, security compliance, or data subject requests, please reach out to{" "}
              <a href="mailto:support@karyvo.ai" className="text-indigo-600 hover:underline">
                support@karyvo.ai
              </a>.
            </p>
          </section>
        </GlassPanel>
      </div>
    </div>
  );
}
