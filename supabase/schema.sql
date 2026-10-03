-- ==============================================================================
-- KARYVO AI BUILDER — COMPLETE SUPABASE POSTGRESQL SCHEMA (HARDENED & FAIL-CLOSED)
-- Execute this script in your Supabase SQL Editor to initialize all tables,
-- foreign keys, indexes, and secure owner-only Row Level Security (RLS) policies.
-- ==============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Master Career Profile per user)
CREATE TABLE IF NOT EXISTS public.profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    phone TEXT DEFAULT '',
    location TEXT DEFAULT '',
    linkedin_url TEXT DEFAULT '',
    github_url TEXT DEFAULT '',
    portfolio_url TEXT DEFAULT '',
    summary TEXT DEFAULT '',
    is_fresher_mode BOOLEAN DEFAULT FALSE,
    education JSONB DEFAULT '[]'::jsonb,
    experience JSONB DEFAULT '[]'::jsonb,
    projects JSONB DEFAULT '[]'::jsonb,
    skills JSONB DEFAULT '{"technical":[],"frameworks":[],"tools":[],"soft":[]}'::jsonb,
    certifications JSONB DEFAULT '[]'::jsonb,
    achievements JSONB DEFAULT '[]'::jsonb,
    current_ctc TEXT DEFAULT '',
    expected_ctc TEXT DEFAULT '',
    notice_period TEXT DEFAULT '',
    preferred_location TEXT DEFAULT '',
    work_mode TEXT DEFAULT 'Remote',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Resumes Table
CREATE TABLE IF NOT EXISTS public.resumes (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    target_role TEXT NOT NULL,
    template_id TEXT NOT NULL DEFAULT 'modern-clean',
    content JSONB NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes(user_id);

-- 3. Resume Versions Table (Unique version number per resume)
CREATE TABLE IF NOT EXISTS public.resume_versions (
    id TEXT PRIMARY KEY,
    resume_id TEXT NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    version_label TEXT NOT NULL,
    change_summary TEXT,
    snapshot JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_resume_version UNIQUE(resume_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_resume_versions_resume_id ON public.resume_versions(resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_versions_user_id ON public.resume_versions(user_id);

-- 4. Cover Letters Table
CREATE TABLE IF NOT EXISTS public.cover_letters (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resume_id TEXT REFERENCES public.resumes(id) ON DELETE SET NULL,
    company_name TEXT NOT NULL,
    target_role TEXT NOT NULL,
    tone TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cover_letters_user_id ON public.cover_letters(user_id);

-- 5. Interview Sessions Table
CREATE TABLE IF NOT EXISTS public.interview_sessions (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_role TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    overall_score INT,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_id ON public.interview_sessions(user_id);

-- 6. ATS Scans Table
CREATE TABLE IF NOT EXISTS public.ats_scans (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resume_id TEXT REFERENCES public.resumes(id) ON DELETE SET NULL,
    resume_name TEXT NOT NULL,
    overall_score INT NOT NULL,
    formatting_score INT NOT NULL,
    completeness_score INT NOT NULL,
    keyword_strength_score INT NOT NULL,
    quantification_score INT NOT NULL,
    strengths JSONB DEFAULT '[]'::jsonb,
    issues JSONB DEFAULT '[]'::jsonb,
    actionable_fixes JSONB DEFAULT '[]'::jsonb,
    scanned_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ats_scans_user_id ON public.ats_scans(user_id);

-- 7. Subscriptions Table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    plan TEXT NOT NULL DEFAULT 'free',
    status TEXT NOT NULL DEFAULT 'active',
    billing_cycle TEXT,
    payment_id TEXT,
    order_id TEXT,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);

-- 8. Orders Table (Server-side Razorpay order audit & replay prevention)
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan TEXT NOT NULL,
    billing_cycle TEXT NOT NULL,
    amount INT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'created', -- 'created', 'paid', 'failed'
    razorpay_order_id TEXT UNIQUE NOT NULL,
    razorpay_payment_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON public.orders(razorpay_order_id);

-- ------------------------------------------------------------------------------
-- 9. Enable Row Level Security (RLS) on all tables
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cover_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ats_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 10. Drop insecure legacy policies (with anon access)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Users can manage own resume versions" ON public.resume_versions;
DROP POLICY IF EXISTS "Users can manage own cover letters" ON public.cover_letters;
DROP POLICY IF EXISTS "Users can manage own interview sessions" ON public.interview_sessions;
DROP POLICY IF EXISTS "Users can manage own ATS scans" ON public.ats_scans;
DROP POLICY IF EXISTS "Users can manage own subscription" ON public.subscriptions;

DROP POLICY IF EXISTS "profiles_owner" ON public.profiles;
DROP POLICY IF EXISTS "resumes_owner" ON public.resumes;
DROP POLICY IF EXISTS "resume_versions_owner" ON public.resume_versions;
DROP POLICY IF EXISTS "cover_letters_owner" ON public.cover_letters;
DROP POLICY IF EXISTS "interview_sessions_owner" ON public.interview_sessions;
DROP POLICY IF EXISTS "ats_scans_owner" ON public.ats_scans;
DROP POLICY IF EXISTS "subscriptions_owner_read" ON public.subscriptions;
DROP POLICY IF EXISTS "orders_owner_read" ON public.orders;

-- ------------------------------------------------------------------------------
-- 11. Strict Owner-Only RLS Policies (NO anon clause, NO client subscription/order write)
-- Note: Supabase service_role automatically bypasses RLS for trusted backend operations.
-- ------------------------------------------------------------------------------

-- Profiles: Authenticated users manage only their own profile
CREATE POLICY "profiles_owner" ON public.profiles
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Resumes: Authenticated users manage only their own resumes
CREATE POLICY "resumes_owner" ON public.resumes
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Resume Versions: Authenticated users manage only their own resume versions
CREATE POLICY "resume_versions_owner" ON public.resume_versions
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Cover Letters: Authenticated users manage only their own cover letters
CREATE POLICY "cover_letters_owner" ON public.cover_letters
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Interview Sessions: Authenticated users manage only their own interview sessions
CREATE POLICY "interview_sessions_owner" ON public.interview_sessions
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ATS Scans: Authenticated users manage only their own ATS scans
CREATE POLICY "ats_scans_owner" ON public.ats_scans
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Subscriptions: Authenticated users can READ their own subscription only.
-- Client CANNOT insert/update/delete subscriptions; only server-side service role can.
CREATE POLICY "subscriptions_owner_read" ON public.subscriptions
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- Orders: Authenticated users can READ their own orders only.
-- Orders are written only by server-side payment endpoints using service role.
CREATE POLICY "orders_owner_read" ON public.orders
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);
