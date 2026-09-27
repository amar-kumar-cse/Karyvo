-- ==============================================================================
-- KARYVO AI BUILDER — COMPLETE SUPABASE POSTGRESQL SCHEMA
-- Execute this script in your Supabase SQL Editor to initialize all tables,
-- foreign keys, indexes, and Row Level Security (RLS) policies.
-- ==============================================================================

-- 1. Profiles Table (Master Career Profile per user)
CREATE TABLE IF NOT EXISTS public.profiles (
    user_id TEXT PRIMARY KEY,
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
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    target_role TEXT NOT NULL,
    template_id TEXT NOT NULL DEFAULT 'modern-clean',
    content JSONB NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes(user_id);

-- 3. Resume Versions Table
CREATE TABLE IF NOT EXISTS public.resume_versions (
    id TEXT PRIMARY KEY,
    resume_id TEXT NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    version_number INT NOT NULL,
    version_label TEXT NOT NULL,
    change_summary TEXT,
    snapshot JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resume_versions_resume_id ON public.resume_versions(resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_versions_user_id ON public.resume_versions(user_id);

-- 4. Cover Letters Table
CREATE TABLE IF NOT EXISTS public.cover_letters (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    resume_id TEXT,
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
    user_id TEXT NOT NULL,
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
    user_id TEXT NOT NULL,
    resume_id TEXT,
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
    user_id TEXT NOT NULL UNIQUE,
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

-- 8. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cover_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ats_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 9. Basic RLS Policies (Allow access to service role, authenticated users, and anon trial sessions)
DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;
CREATE POLICY "Users can manage own profile" ON public.profiles
    FOR ALL 
    USING (auth.uid()::text = user_id OR auth.role() = 'service_role' OR auth.role() = 'anon')
    WITH CHECK (auth.uid()::text = user_id OR auth.role() = 'service_role' OR auth.role() = 'anon');

DROP POLICY IF EXISTS "Users can manage own resumes" ON public.resumes;
CREATE POLICY "Users can manage own resumes" ON public.resumes
    FOR ALL 
    USING (auth.uid()::text = user_id OR auth.role() = 'service_role' OR auth.role() = 'anon')
    WITH CHECK (auth.uid()::text = user_id OR auth.role() = 'service_role' OR auth.role() = 'anon');

DROP POLICY IF EXISTS "Users can manage own resume versions" ON public.resume_versions;
CREATE POLICY "Users can manage own resume versions" ON public.resume_versions
    FOR ALL 
    USING (auth.uid()::text = user_id OR auth.role() = 'service_role' OR auth.role() = 'anon')
    WITH CHECK (auth.uid()::text = user_id OR auth.role() = 'service_role' OR auth.role() = 'anon');

DROP POLICY IF EXISTS "Users can manage own cover letters" ON public.cover_letters;
CREATE POLICY "Users can manage own cover letters" ON public.cover_letters
    FOR ALL 
    USING (auth.uid()::text = user_id OR auth.role() = 'service_role' OR auth.role() = 'anon')
    WITH CHECK (auth.uid()::text = user_id OR auth.role() = 'service_role' OR auth.role() = 'anon');

DROP POLICY IF EXISTS "Users can manage own interview sessions" ON public.interview_sessions;
CREATE POLICY "Users can manage own interview sessions" ON public.interview_sessions
    FOR ALL 
    USING (auth.uid()::text = user_id OR auth.role() = 'service_role' OR auth.role() = 'anon')
    WITH CHECK (auth.uid()::text = user_id OR auth.role() = 'service_role' OR auth.role() = 'anon');

DROP POLICY IF EXISTS "Users can manage own ATS scans" ON public.ats_scans;
CREATE POLICY "Users can manage own ATS scans" ON public.ats_scans
    FOR ALL 
    USING (auth.uid()::text = user_id OR auth.role() = 'service_role' OR auth.role() = 'anon')
    WITH CHECK (auth.uid()::text = user_id OR auth.role() = 'service_role' OR auth.role() = 'anon');

DROP POLICY IF EXISTS "Users can manage own subscription" ON public.subscriptions;
CREATE POLICY "Users can manage own subscription" ON public.subscriptions
    FOR ALL 
    USING (auth.uid()::text = user_id OR auth.role() = 'service_role' OR auth.role() = 'anon')
    WITH CHECK (auth.uid()::text = user_id OR auth.role() = 'service_role' OR auth.role() = 'anon');

