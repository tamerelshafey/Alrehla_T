-- Create ENUM for subscription status
DO $$ BEGIN
    CREATE TYPE sub_status_enum AS ENUM ('active', 'cancelled', 'paused');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Testimonials Table
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_name TEXT NOT NULL,
    author_role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    cover_image_url TEXT,
    author_name TEXT NOT NULL DEFAULT 'فريق الرحلة',
    published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Box Subscriptions Table
CREATE TABLE IF NOT EXISTS box_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    status sub_status_enum NOT NULL DEFAULT 'active',
    next_shipment_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE box_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Testimonials are viewable by everyone" ON testimonials
    FOR SELECT USING (true);

CREATE POLICY "Blog posts are viewable by everyone" ON blog_posts
    FOR SELECT USING (true);

CREATE POLICY "Users can view their own subscriptions" ON box_subscriptions
    FOR SELECT USING (auth.uid() = user_id);
