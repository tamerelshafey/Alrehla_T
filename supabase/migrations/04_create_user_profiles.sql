-- Create user role ENUM
DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM (
        'visitor', 'customer', 'student', 'instructor', 
        'publisher', 'general_supervisor', 'super_admin'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY, -- Will reference auth.users(id) but keeping it simple
    full_name TEXT NOT NULL,
    role user_role_enum NOT NULL DEFAULT 'visitor',
    is_guardian BOOLEAN DEFAULT false,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
-- 1. Users can view their own profile
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

-- 2. Users can update their own profile
CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- 3. Public profiles (e.g. for instructors to be viewed by students)
-- For now, let's allow read access to everyone since some info like instructor name is public
CREATE POLICY "Profiles are viewable by everyone" ON user_profiles
    FOR SELECT USING (true);

-- Optional: Create a trigger to automatically create a profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, full_name, role)
    VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', 'مستخدم جديد'), 'visitor');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if trigger exists and drop it before creating to avoid errors
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
