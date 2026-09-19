import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navigation/navbar";
import { Footer } from "@/components/navigation/footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Karyvo AI Builder — Build Your Resume. Beat ATS. Get Interview-Ready.",
  description:
    "India-first AI career platform. Master Career Profile powers Resume Builder, Standalone ATS Scanner, AI Bullet Improver, Cover Letter, and Role Interview simulator.",
  keywords: ["AI Resume Builder", "ATS Scanner", "Interview AI", "India tech jobs", "SDE resume", "Fresher placement"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`}>
      <body className="font-sans sky-cloud-canvas text-slate-800 flex flex-col min-h-screen selection:bg-indigo-500/20 selection:text-indigo-900 antialiased">
        <Navbar />
        <main className="flex-1 w-full relative z-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
