-- Drop old tables if they exist to avoid conflicts
DROP TABLE IF EXISTS portfolio_documents CASCADE;
DROP TABLE IF EXISTS instructor_payouts CASCADE;
DROP TABLE IF EXISTS publisher_payouts CASCADE;
DROP TABLE IF EXISTS publishers CASCADE;

-- Drop old types
DROP TYPE IF EXISTS publisher_status_enum CASCADE;
DROP TYPE IF EXISTS document_status_enum CASCADE;
DROP TYPE IF EXISTS payout_status_enum CASCADE;

-- Create ENUMs
DO $$ BEGIN
    CREATE TYPE publisher_status_enum AS ENUM ('pending', 'active', 'suspended');
    CREATE TYPE document_status_enum AS ENUM ('draft', 'submitted', 'reviewed');
    CREATE TYPE payout_status_enum AS ENUM ('pending', 'paid');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Publishers Table
CREATE TABLE publishers (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    logo_url TEXT,
    bio TEXT NOT NULL,
    is_sample BOOLEAN DEFAULT false,
    status publisher_status_enum NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Portfolio Documents Table (Student's Writing)
CREATE TABLE portfolio_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    status document_status_enum NOT NULL DEFAULT 'draft',
    instructor_feedback TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Instructor Payouts Table
CREATE TABLE instructor_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instructor_id TEXT NOT NULL REFERENCES instructors(id) ON DELETE CASCADE,
    period TEXT NOT NULL,
    amount INTEGER NOT NULL,
    status payout_status_enum NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Publisher Payouts Table
CREATE TABLE publisher_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publisher_id TEXT NOT NULL REFERENCES publishers(id) ON DELETE CASCADE,
    period TEXT NOT NULL,
    amount INTEGER NOT NULL,
    status payout_status_enum NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE publishers ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructor_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE publisher_payouts ENABLE ROW LEVEL SECURITY;

-- Policies for Publishers
CREATE POLICY "Publishers are viewable by everyone" ON publishers
    FOR SELECT USING (true);

-- Policies for Portfolio Documents
CREATE POLICY "Users can view their own documents" ON portfolio_documents
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Users can create their own documents" ON portfolio_documents
    FOR INSERT WITH CHECK (auth.uid() = student_id);
    
CREATE POLICY "Users can update their own documents" ON portfolio_documents
    FOR UPDATE USING (auth.uid() = student_id);

-- Policies for Payouts
CREATE POLICY "Instructors can view their own payouts" ON instructor_payouts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM instructors WHERE instructors.id = instructor_payouts.instructor_id AND instructors.user_id = auth.uid()
        )
    );

CREATE POLICY "Publishers can view their own payouts" ON publisher_payouts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM publishers WHERE publishers.id = publisher_payouts.publisher_id AND publishers.user_id = auth.uid()
        )
    );
