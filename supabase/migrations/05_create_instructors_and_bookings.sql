-- Drop old tables if they exist to avoid conflicts
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS instructors CASCADE;

-- ENUMs for instructors
DO $$ BEGIN
    CREATE TYPE instructor_status_enum AS ENUM ('pending_training', 'pending_approval', 'active', 'suspended');
    CREATE TYPE work_model_enum AS ENUM ('per_session', 'monthly');
    CREATE TYPE booking_status_enum AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'rescheduled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Instructors Table
CREATE TABLE IF NOT EXISTS instructors (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    bio TEXT NOT NULL,
    specialties TEXT[] NOT NULL,
    years_experience INTEGER NOT NULL,
    is_sample BOOLEAN DEFAULT false,
    status instructor_status_enum NOT NULL DEFAULT 'pending_training',
    training_passed BOOLEAN DEFAULT false,
    work_model work_model_enum NOT NULL DEFAULT 'per_session',
    requested_price INTEGER,
    selected_pricing_option_id TEXT,
    approved_price INTEGER,
    weekly_schedule JSONB,
    pending_schedule JSONB,
    monthly_hours_committed INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    dependent_participant_id TEXT,
    independent_participant_id TEXT,
    package_id TEXT NOT NULL,
    instructor_id TEXT REFERENCES instructors(id) ON DELETE SET NULL,
    course_subscription_id TEXT,
    status booking_status_enum NOT NULL DEFAULT 'pending',
    scheduled_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policies for Instructors
DO $$
BEGIN
    CREATE POLICY "Instructors are viewable by everyone" ON instructors
    FOR SELECT USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
    CREATE POLICY "Instructors can update their own profile" ON instructors
    FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Policies for Bookings
DO $$
BEGIN
    CREATE POLICY "Users can view their own bookings" ON bookings
    FOR SELECT USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
    CREATE POLICY "Users can create bookings" ON bookings
    FOR INSERT WITH CHECK (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
