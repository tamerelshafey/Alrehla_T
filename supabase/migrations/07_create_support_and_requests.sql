-- Create ENUMs for Support & Requests
DO $$ BEGIN
    CREATE TYPE ticket_status_enum AS ENUM ('open', 'answered', 'closed');
    CREATE TYPE join_request_status_enum AS ENUM ('pending', 'approved', 'rejected');
    CREATE TYPE support_session_status_enum AS ENUM ('pending', 'contacted', 'resolved');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Support Tickets Table
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    requester_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    category TEXT NOT NULL,
    status ticket_status_enum NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Join Requests Table
CREATE TABLE IF NOT EXISTS join_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_name TEXT NOT NULL,
    requested_role TEXT NOT NULL CHECK (requested_role IN ('instructor', 'publisher')),
    status join_request_status_enum NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Support Session Requests Table
CREATE TABLE IF NOT EXISTS support_session_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    contact_name TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    message TEXT NOT NULL,
    status support_session_status_enum NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_session_requests ENABLE ROW LEVEL SECURITY;

-- Policies for Support Tickets
-- Users can view their own tickets
DO $$
BEGIN
    CREATE POLICY "Users can view their own tickets" ON support_tickets
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Users can create tickets
DO $$
BEGIN
    CREATE POLICY "Users can create tickets" ON support_tickets
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Policies for Join Requests (usually anyone can submit, only admins view/edit)
DO $$
BEGIN
    CREATE POLICY "Anyone can create join requests" ON join_requests
    FOR INSERT WITH CHECK (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Policies for Support Session Requests
DO $$
BEGIN
    CREATE POLICY "Anyone can create support session requests" ON support_session_requests
    FOR INSERT WITH CHECK (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
    
DO $$
BEGIN
    CREATE POLICY "Users can view their own support session requests" ON support_session_requests
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
