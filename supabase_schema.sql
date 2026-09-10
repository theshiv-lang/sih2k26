-- ========================================================================
-- SAHAYAK (सहायक) - SUPABASE POSTGRESQL INITIALIZATION SCHEMA
-- Smart India Hackathon (SIH) 2026 - Hybrid Database Architecture
-- ========================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------
-- 1. CITIZENS TABLE (Demographic and Socioeconomic Repository)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.citizens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    gender VARCHAR(50) NOT NULL,
    age INTEGER NOT NULL,
    state VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    annual_income BIGINT NOT NULL,
    occupation VARCHAR(100) NOT NULL,
    landholding_acres DOUBLE PRECISION DEFAULT 0.0,
    is_student BOOLEAN DEFAULT FALSE,
    education_level VARCHAR(100),
    is_differently_abled BOOLEAN DEFAULT FALSE,
    mobile VARCHAR(50),
    email VARCHAR(255),
    aadhaar_masked VARCHAR(50) DEFAULT 'XXXX-XXXX-XXXX',
    marital_status VARCHAR(50),
    has_girl_child BOOLEAN DEFAULT FALSE,
    girl_child_age INTEGER DEFAULT 0,
    bpl_card_holder BOOLEAN DEFAULT FALSE,
    is_pregnant_or_lactating BOOLEAN DEFAULT FALSE,
    crop_insured BOOLEAN DEFAULT FALSE,
    persona_type VARCHAR(100),
    father_name VARCHAR(255),
    contact_number VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Incremental migration command (if table already exists)
ALTER TABLE public.citizens 
ADD COLUMN IF NOT EXISTS father_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS contact_number VARCHAR(50);

-- ------------------------------------------------------------------------
-- 2. SCHEME_APPLICATIONS TABLE (Real-Time Officer Verification Queue)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.scheme_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    citizen_id UUID REFERENCES public.citizens(id) ON DELETE SET NULL,
    citizen_name VARCHAR(255) NOT NULL,
    scheme_id VARCHAR(100) NOT NULL,
    scheme_title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Under Review', 'Approved', 'Rejected')),
    details JSONB DEFAULT '{}'::jsonb,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create performance indexes for real-time querying
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.scheme_applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_scheme_id ON public.scheme_applications(scheme_id);
CREATE INDEX IF NOT EXISTS idx_applications_submitted_at ON public.scheme_applications(submitted_at DESC);

-- ------------------------------------------------------------------------
-- 3. SUPABASE REALTIME ENABLEMENT
-- ------------------------------------------------------------------------
-- Set replica identity to full so update/delete payloads deliver full records
ALTER TABLE public.scheme_applications REPLICA IDENTITY FULL;

-- Add scheme_applications table to supabase_realtime publication
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'scheme_applications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.scheme_applications;
    END IF;
END $$;

-- ------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) CONFIGURATION
-- ------------------------------------------------------------------------

-- [OPTION A: RECOMMENDED FOR TESTING / DEMOS] Disable RLS to ensure 100% Realtime CDC Broadcast
ALTER TABLE public.scheme_applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizens DISABLE ROW LEVEL SECURITY;

-- [OPTION B: PRODUCTION RLS WITH PERMISSIVE POLICIES] 
-- If you choose to keep RLS enabled, uncomment the following block:
/*
ALTER TABLE public.citizens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheme_applications ENABLE ROW LEVEL SECURITY;

-- Permissive policy for scheme_applications (Select, Insert, Update)
DROP POLICY IF EXISTS "Permissive all on scheme_applications" ON public.scheme_applications;
CREATE POLICY "Permissive all on scheme_applications" 
    ON public.scheme_applications FOR ALL 
    USING (true) WITH CHECK (true);

-- Permissive policy for citizens (Select, Insert, Update)
DROP POLICY IF EXISTS "Permissive all on citizens" ON public.citizens;
CREATE POLICY "Permissive all on citizens" 
    ON public.citizens FOR ALL 
    USING (true) WITH CHECK (true);
*/

-- ------------------------------------------------------------------------
-- 5. REALTIME PUBLICATION RESET & QUEUE PURGE COMMANDS
-- ------------------------------------------------------------------------
-- Force addition of scheme_applications to realtime publication:
ALTER PUBLICATION supabase_realtime ADD TABLE scheme_applications;

-- Safely clear verification queue without dropping tables or altering citizens schema:
TRUNCATE TABLE scheme_applications CASCADE;
