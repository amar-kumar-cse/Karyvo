# Karyvo AI Builder

> **India-First AI Career Platform** — Build ATS-proof resumes, optimize bullets using Google's XYZ formula, craft tailored role cover letters, and master technical and behavioral interview preparation with an interactive mock AI coach.

---

## 🚀 Overview

**Karyvo** connects all career preparation workflows through a single, central **Master Career Profile**:
- **7-Step Resume Builder**: Structured guided builder with real-time physically-lit preview and instant PDF export.
- **Standalone ATS Scanner**: Deterministic audit scoring formatting, completeness, keyword density, and quantified impact metrics without requiring a job description.
- **XYZ AI Bullet Improver**: Transforms passive accomplishments into quantified, high-impact statements (*"Accomplished [X], as measured by [Y], by doing [Z]"*).
- **Role Mock Interview AI**: Interactive mock interview coach with evaluation, rating rubric, and ideal answer synthesis.
- **Targeted Cover Letter AI**: Generates company- and role-aligned cover letters grounded in your profile facts.
- **Version Snapshot Engine**: Restore and manage named versions of your resume tailored for specific job tracks.
- **Pro Tier Integration**: Seamless Razorpay checkout with webhook verification and Pro perks.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom Glassmorphism design tokens
- **Icons**: [Lucide React](https://lucide.dev/)
- **Validation**: [Zod](https://zod.dev/) schemas
- **Database / Backend**: Supabase (PostgreSQL with Row Level Security) + Local Storage offline fallback
- **Payments**: [Razorpay](https://razorpay.com/) Payment Gateway

---

## 🏁 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/amar-kumar-cse/Karyvo.git
cd Karyvo

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

---

## 📜 Available Scripts

- `npm run dev` — Launches the Next.js local development server.
- `npm run build` — Builds the optimized production application.
- `npm run start` — Starts the production build server.
- `npm run lint` — Runs ESLint code quality checks.

---

## 🔒 Security & Anti-Hallucination

All AI generation pipelines in Karyvo run through strict anti-hallucination guardrails:
- No speculative metrics or unearned skills are fabricated.
- Only verifiable facts supplied in the Master Career Profile are utilized during generation.

---

## 📄 License

This project is licensed under the MIT License.
