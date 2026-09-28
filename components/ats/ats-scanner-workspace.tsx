"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
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
  UploadCloud,
  Image as ImageIcon,
  FileCheck,
  X,
  Eye,
  EyeOff,
  Copy,
  Briefcase,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

interface Props {
  initialScans: ATSScanResult[];
  sampleResumeText?: string;
}

export function ATSScannerWorkspace({ initialScans, sampleResumeText }: Props) {
  const [activeTab, setActiveTab] = useState<"ats-audit" | "tailoring-studio">("ats-audit");
  const [inputMode, setInputMode] = useState<"upload" | "text">("upload");

  // File Upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resume text states
  const [resumeText, setResumeText] = useState(sampleResumeText || "");
  const [resumeName, setResumeName] = useState(
    initialScans.length > 0 ? initialScans[0].resumeName : "Arjun_Sharma_Resume.pdf"
  );

  // Scanning & Result states
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string>("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showExtractedText, setShowExtractedText] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const [currentResult, setCurrentResult] = useState<ATSScanResult | null>(
    initialScans.length > 0 ? initialScans[0] : null
  );

  // Tailoring Studio states
  const [tailorRole, setTailorRole] = useState(
    currentResult?.detectedRole || "Senior Full-Stack Engineer"
  );
  const [tailorApproved, setTailorApproved] = useState<{ [key: string]: boolean }>({
    s1: true,
    s2: false,
    s3: true,
  });
  const [versionSaved, setVersionSaved] = useState(false);

  // Helper to format file sizes
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Drag & drop handlers
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    setUploadError(null);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileSelection(file);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    const validExtensions = [".pdf", ".png", ".jpg", ".jpeg", ".webp", ".txt", ".md"];
    const ext = "." + file.name.split(".").pop()?.toLowerCase();

    if (!validExtensions.includes(ext) && !file.type.startsWith("image/") && file.type !== "application/pdf") {
      setUploadError("Please upload a PDF (.pdf), Image (.png, .jpg, .webp), or plain text file.");
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      setUploadError("File size exceeds 12MB limit. Please upload a smaller file.");
      return;
    }

    setSelectedFile(file);
    setResumeName(file.name);
    setUploadError(null);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Main scan execution
  const handleRunScan = async () => {
    setUploadError(null);

    // If in upload mode and file is selected, do multipart upload
    if (inputMode === "upload") {
      if (!selectedFile) {
        setUploadError("Please select or drop a resume file to scan.");
        return;
      }

      setIsScanning(true);
      setScanStep("Reading document & extracting layout...");

      try {
        const formData = new FormData();
        formData.append("file", selectedFile);

        setTimeout(() => setScanStep("Auditing headers & layout against ATS standards..."), 1200);
        setTimeout(() => setScanStep("Evaluating power action verbs & quantification metrics..."), 2400);

        const res = await fetch("/api/ats/scan", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to scan document.");
        }

        if (data.data) {
          setCurrentResult(data.data);
          if (data.extractedText) {
            setResumeText(data.extractedText);
          }
          if (data.data.detectedRole) {
            setTailorRole(data.data.detectedRole);
          }
        }
      } catch (err: any) {
        console.error("Scan error:", err);
        setUploadError(err.message || "An error occurred during scanning. Please try again.");
      } finally {
        setIsScanning(false);
        setScanStep("");
      }
    } else {
      // Manual text mode scan
      if (!resumeText.trim()) {
        setUploadError("Please paste or enter your resume text first.");
        return;
      }

      setIsScanning(true);
      setScanStep("Analyzing text payload against corporate ATS models...");

      try {
        const res = await fetch("/api/ats/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resumeText,
            resumeName: resumeName || "Resume_Payload.txt",
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to analyze resume text.");
        }

        if (data.data) {
          setCurrentResult(data.data);
          if (data.data.detectedRole) {
            setTailorRole(data.data.detectedRole);
          }
        }
      } catch (err: any) {
        console.error("Scan error:", err);
        setUploadError(err.message || "An error occurred during scanning.");
      } finally {
        setIsScanning(false);
        setScanStep("");
      }
    }
  };

  const handleCopyExtractedText = () => {
    if (!resumeText) return;
    navigator.clipboard.writeText(resumeText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-600 border-emerald-500/40 bg-emerald-500/10";
    if (score >= 70) return "text-indigo-600 border-indigo-500/40 bg-indigo-500/10";
    return "text-amber-600 border-amber-500/40 bg-amber-500/10";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 88)
      return {
        label: "Top 3% Corporate Elite - ATS Certified",
        variant: "emerald" as const,
        description: "Exceptional alignment. Ready for automated high-volume corporate screening.",
      };
    if (score >= 75)
      return {
        label: "Interview Ready - High Pass Probability",
        variant: "violet" as const,
        description: "Strong baseline. Will bypass primary ATS keyword gates smoothly.",
      };
    return {
      label: "Borderline - Moderate Metric Gaps",
      variant: "amber" as const,
      description: "Needs metric quantification and stronger action verbs to prevent automatic filtration.",
    };
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4 pb-6 border-b border-slate-200/80">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-heading flex items-center gap-2">
              <ShieldCheck className="h-7 w-7 text-emerald-600" />
              Corporate ATS Resume Engine
            </h1>
            <GlassBadge variant="emerald" className="font-heading">
              Universal Grader & Studio
            </GlassBadge>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
            Drop your PDF or image resume directly to audit against Fortune 500 ATS algorithms (Workday, Taleo, Greenhouse, Lever).
          </p>
        </div>

        {/* View Switcher: ATS Audit vs Tailoring Studio */}
        <div className="inline-flex items-center p-1 rounded-2xl bg-white/80 border border-slate-200 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab("ats-audit")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "ats-audit"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Standalone ATS Audit
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("tailoring-studio")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "tailoring-studio"
                ? "bg-indigo-600 text-white shadow-sm"
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
          {/* Input Panel with Mode Toggle (Upload File vs Text) */}
          <GlassPanel
            header={
              <div className="flex items-center justify-between w-full">
                <span className="font-heading font-bold text-slate-900 text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-600" />
                  Resume Document Input
                </span>
                <div className="flex items-center gap-1 bg-slate-100/90 p-0.5 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setInputMode("upload");
                      setUploadError(null);
                    }}
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                      inputMode === "upload"
                        ? "bg-white text-indigo-600 shadow-sm font-semibold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <UploadCloud className="h-3.5 w-3.5" />
                    <span>Upload File (PDF / Image)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInputMode("text");
                      setUploadError(null);
                    }}
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                      inputMode === "text"
                        ? "bg-white text-indigo-600 shadow-sm font-semibold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Paste / Edit Text</span>
                  </button>
                </div>
              </div>
            }
            className="space-y-4"
          >
            {/* MODE 1: FILE UPLOAD (DRAG & DROP ZONE) */}
            {inputMode === "upload" && (
              <div className="space-y-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept=".pdf,image/png,image/jpeg,image/jpg,image/webp,.txt,.md"
                  className="hidden"
                />

                {!selectedFile ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
                      isDragOver
                        ? "border-indigo-600 bg-indigo-50/80 scale-[1.01] shadow-lg shadow-indigo-100"
                        : "border-slate-300 hover:border-indigo-500 bg-gradient-to-b from-slate-50/60 via-white to-indigo-50/20 hover:bg-indigo-50/30"
                    }`}
                  >
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 mb-4 shadow-sm group-hover:scale-105 transition-transform">
                      <UploadCloud className="h-8 w-8" />
                    </div>

                    <h3 className="text-base font-bold text-slate-900 font-heading">
                      Drag & Drop your Resume (PDF or Image)
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                      Click to browse your device. Our AI OCR parses scanned PDFs, images, and text formats with 100% layout fidelity.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                      <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-md">
                        PDF (Recommended)
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                        PNG / JPG / WEBP (Images)
                      </span>
                      <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md">
                        Max 12MB
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Selected File Card */
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                        {selectedFile.type.startsWith("image/") ? (
                          <ImageIcon className="h-6 w-6" />
                        ) : (
                          <FileCheck className="h-6 w-6" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 font-heading max-w-xs sm:max-w-md truncate">
                            {selectedFile.name}
                          </span>
                          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Ready to scan
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                          <span>{formatFileSize(selectedFile.size)}</span>
                          <span>•</span>
                          <span>{selectedFile.type || "Document"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                      >
                        Change File
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Remove file"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MODE 2: PASTE TEXT AREA */}
            {inputMode === "text" && (
              <div className="space-y-3">
                <textarea
                  rows={8}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste full resume text or load from current active resume..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-4 text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500 leading-relaxed shadow-sm"
                />

                <div className="flex items-center gap-2">
                  <label htmlFor="ats-file-label" className="text-xs text-slate-700 font-medium shrink-0">
                    File Label:
                  </label>
                  <GlassInput
                    id="ats-file-label"
                    type="text"
                    value={resumeName}
                    onChange={(e) => setResumeName(e.target.value)}
                    className="py-1.5 px-3 text-xs w-full sm:w-64"
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {uploadError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                {resumeText && (
                  <button
                    type="button"
                    onClick={() => setShowExtractedText(!showExtractedText)}
                    className="text-xs text-slate-600 hover:text-indigo-600 font-medium flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    {showExtractedText ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    <span>{showExtractedText ? "Hide Parsed Text" : "View Extracted Text"}</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <GlassButton
                  variant="primary"
                  size="md"
                  onClick={handleRunScan}
                  disabled={isScanning || (inputMode === "upload" ? !selectedFile : !resumeText.trim())}
                  loading={isScanning}
                  className="w-full sm:w-auto shadow-md shadow-indigo-100"
                >
                  <Zap className="h-4 w-4 fill-current text-white" />
                  <span>
                    {isScanning
                      ? scanStep || "Auditing Resume..."
                      : inputMode === "upload"
                      ? "Scan Uploaded Resume"
                      : "Run ATS Universal Scan"}
                  </span>
                </GlassButton>
              </div>
            </div>

            {/* Collapsible Parsed Text Viewer */}
            {showExtractedText && resumeText && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 font-heading flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-indigo-600" />
                    Exact Text Parsed by ATS Engine ({resumeText.split(/\s+/).length} words)
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyExtractedText}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-indigo-50"
                  >
                    {copiedText ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedText ? "Copied!" : "Copy Text"}</span>
                  </button>
                </div>
                <pre className="text-[11px] font-mono text-slate-700 bg-white p-3 rounded-lg border border-slate-200 overflow-x-auto max-h-60 leading-relaxed whitespace-pre-wrap">
                  {resumeText}
                </pre>
              </div>
            )}
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
                    <span className="text-3xl font-extrabold font-heading text-slate-900">
                      {currentResult.overallScore}
                    </span>
                    <span className="text-xs text-slate-500 font-heading">/100</span>
                  </div>
                  <div className="text-base font-bold text-slate-900 font-heading">Overall ATS Score</div>

                  {/* Verdict Badge */}
                  <div className="mt-2">
                    <GlassBadge variant={getScoreBadge(currentResult.overallScore).variant} className="text-[11px]">
                      {getScoreBadge(currentResult.overallScore).label}
                    </GlassBadge>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 px-2">
                    {getScoreBadge(currentResult.overallScore).description}
                  </p>
                </div>

                {/* 4 Pillar Breakdown Bars */}
                <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Pillar 1: Formatting */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-800">1. Formatting Compliance</span>
                      <span className="font-heading font-extrabold text-emerald-600">
                        {currentResult.formattingScore}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                        style={{ width: `${currentResult.formattingScore}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-600 block">Header standard, fonts, layout safety</span>
                  </div>

                  {/* Pillar 2: Completeness */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-800">2. Section Completeness</span>
                      <span className="font-heading font-extrabold text-indigo-600">
                        {currentResult.completenessScore}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                        style={{ width: `${currentResult.completenessScore}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-600 block">Contact, LinkedIn, GitHub, length density</span>
                  </div>

                  {/* Pillar 3: Keyword Strength */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-800">3. Keyword & Action Verbs</span>
                      <span className="font-heading font-extrabold text-amber-600">
                        {currentResult.keywordStrengthScore}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-1000"
                        style={{ width: `${currentResult.keywordStrengthScore}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-600 block">Power verbs density, zero passive phrases</span>
                  </div>

                  {/* Pillar 4: Quantification */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-800">4. Quantification & Metrics</span>
                      <span className="font-heading font-extrabold text-amber-600">
                        {currentResult.quantificationScore}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-1000"
                        style={{ width: `${currentResult.quantificationScore}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-600 block">Numbers, latency %, financial, throughput</span>
                  </div>
                </div>
              </GlassCard>

              {/* Detected Profile & Keyword Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                {/* Detected Domain & Skills */}
                <GlassCard className="p-6 h-full flex flex-col space-y-3">
                  <div className="min-h-[36px] flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 font-heading flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-indigo-600 shrink-0" />
                      <span>Detected Domain Profile</span>
                    </h3>
                    <GlassBadge variant="violet" className="text-xs">
                      {currentResult.detectedRole || "Software Engineer"}
                    </GlassBadge>
                  </div>

                  <p className="text-xs text-slate-600">
                    High-value technical competencies recognized in your document:
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {currentResult.detectedSkills && currentResult.detectedSkills.length > 0 ? (
                      currentResult.detectedSkills.map((sk) => (
                        <span
                          key={sk}
                          className="text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg"
                        >
                          ✓ {sk}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">No specific skills cataloged yet.</span>
                    )}
                  </div>
                </GlassCard>

                {/* Missing Keyword Recommendations */}
                <GlassCard className="p-6 h-full flex flex-col space-y-3">
                  <div className="min-h-[36px] flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 font-heading flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-600 shrink-0" />
                      <span>Recommended Industry Keywords</span>
                    </h3>
                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      Boost Score
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">
                    Terms frequently parsed by top recruiters hiring for {currentResult.detectedRole || "your role"}:
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {currentResult.missingKeywords && currentResult.missingKeywords.length > 0 ? (
                      currentResult.missingKeywords.map((kw) => (
                        <span
                          key={kw}
                          className="text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg"
                        >
                          + {kw}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-emerald-600 font-medium">
                        ✓ All top industry keyword categories covered!
                      </span>
                    )}
                  </div>
                </GlassCard>
              </div>

              {/* Actionable Fixes & Strengths Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                {/* Strengths */}
                <GlassCard className="p-6 h-full flex flex-col space-y-3">
                  <div className="min-h-[36px] flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 font-heading flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Verified Strengths</span>
                    </h3>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {currentResult.strengths?.length || 0} Passed
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col pt-1">
                    {currentResult.strengths && currentResult.strengths.length > 0 ? (
                      <ul className="space-y-2 text-xs">
                        {currentResult.strengths.map((str, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-slate-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="flex-1 flex items-center justify-center p-6 text-center rounded-xl bg-slate-50/80 border border-slate-200/60">
                        <p className="text-xs text-slate-500 italic">
                          No specific strengths identified for this scan yet.
                        </p>
                      </div>
                    )}
                  </div>
                </GlassCard>

                {/* Actionable Recommendations */}
                <GlassCard className="p-6 h-full flex flex-col space-y-3">
                  <div className="min-h-[36px] flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 font-heading flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                      <span>Actionable Recommendations</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab("tailoring-studio")}
                      className="text-xs text-indigo-700 hover:text-indigo-800 font-semibold flex items-center gap-1 transition-colors px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 shadow-sm"
                    >
                      <Sparkles className="h-3 w-3 text-indigo-600" />
                      <span>Fix in Studio →</span>
                    </button>
                  </div>
                  <div className="flex-1 flex flex-col pt-1">
                    {currentResult.actionableFixes && currentResult.actionableFixes.length > 0 ? (
                      <ul className="space-y-2 text-xs">
                        {currentResult.actionableFixes.map((fix, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-slate-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                            <span>{fix}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="flex-1 flex items-center justify-center p-6 text-center rounded-xl bg-slate-50/80 border border-slate-200/60">
                        <p className="text-xs text-slate-500 italic">
                          No critical issues detected. Excellent resume alignment!
                        </p>
                      </div>
                    )}
                  </div>
                </GlassCard>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 2: AI TAILORING STUDIO */}
      {/* ============================================================= */}
      {activeTab === "tailoring-studio" && (
        <div className="space-y-6">
          <GlassPanel header="AI Resume Tailoring Studio">
            <p className="text-xs text-slate-600">
              Target a specific career level or specialization. Karyvo analyzes gaps, recommends power upgrades, and lets you approve changes before saving an isolated labeled version.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="sm:col-span-2">
                <label className="text-xs text-slate-600 font-medium block mb-1">
                  Target Specialization / Role Focus
                </label>
                <GlassInput
                  type="text"
                  value={tailorRole}
                  onChange={(e) => setTailorRole(e.target.value)}
                  placeholder="e.g. Senior Backend / Distributed Systems Engineer"
                />
              </div>
              <div className="flex items-end">
                <GlassButton variant="primary" size="md" className="w-full">
                  <Sparkles className="h-4 w-4 text-white" />
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
                {(currentResult?.detectedSkills && currentResult.detectedSkills.length > 0
                  ? currentResult.detectedSkills.slice(0, 6)
                  : ["PostgreSQL", "Next.js", "Redis", "Distributed Systems", "REST/gRPC"]
                ).map((t) => (
                  <GlassBadge key={t} variant="emerald" className="text-xs">
                    ✓ {t}
                  </GlassBadge>
                ))}
              </div>
            </GlassCard>

            {/* Column 2: Missing Skill Opportunities */}
            <GlassCard className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900 font-heading">2. Missing Power Keywords</h3>
              </div>
              <p className="text-xs text-slate-600">High-impact terms that elevate rank for {tailorRole}:</p>
              <div className="flex flex-wrap gap-1.5">
                {(currentResult?.missingKeywords && currentResult.missingKeywords.length > 0
                  ? currentResult.missingKeywords
                  : ["High Throughput", "Fault Tolerance", "Canary Rollouts", "p99 SLA", "Micro-benchmarking"]
                ).map((t) => (
                  <GlassBadge key={t} variant="amber" className="text-xs">
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
                  { id: "s1", label: "Quantify project throughput to 4.2M daily transactions", approved: tailorApproved.s1 },
                  { id: "s2", label: "Elevate Distributed Workflow Architecture to top project", approved: tailorApproved.s2 },
                  { id: "s3", label: "Inject sub-50ms p99 latency metric in Summary", approved: tailorApproved.s3 },
                ].map((sug) => (
                  <div
                    key={sug.id}
                    onClick={() => setTailorApproved({ ...tailorApproved, [sug.id]: !sug.approved })}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-2 ${
                      tailorApproved[sug.id]
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-medium"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded flex items-center justify-center mt-0.5 ${
                        tailorApproved[sug.id] ? "bg-emerald-600 text-white font-bold" : "border border-slate-300"
                      }`}
                    >
                      {tailorApproved[sug.id] && "✓"}
                    </div>
                    <span className="text-xs leading-relaxed">{sug.label}</span>
                  </div>
                ))}
              </div>

              <GlassButton
                variant="primary"
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
