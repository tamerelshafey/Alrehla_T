-- Create ENUM for AgeGroup if it doesn't exist
DO $$ BEGIN
    CREATE TYPE age_group_enum AS ENUM ('under_12', '12_plus');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create creative_writing_packages table
CREATE TABLE IF NOT EXISTS creative_writing_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    age_group age_group_enum NOT NULL,
    price INTEGER NOT NULL,
    duration_text TEXT NOT NULL,
    sessions_count INTEGER NOT NULL,
    session_duration TEXT,
    target_audience TEXT NOT NULL,
    prerequisite_note TEXT,
    prerequisite_package_id TEXT,
    short_description TEXT NOT NULL,
    full_description TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE creative_writing_packages ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$
BEGIN
    CREATE POLICY "Packages are viewable by everyone" ON creative_writing_packages
    FOR SELECT USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
