-- Create ENUMs if they don't exist
DO $$ BEGIN
    CREATE TYPE product_category AS ENUM ('library', 'custom', 'subscription');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE product_owner_type AS ENUM ('platform', 'publisher');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create personalized_products table
CREATE TABLE IF NOT EXISTS personalized_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category product_category NOT NULL,
    price INTEGER NOT NULL,
    electronic_price INTEGER,
    short_description TEXT NOT NULL,
    cover_image_url TEXT,
    publisher_id TEXT, -- This can be a foreign key to publishers table later
    owner_type product_owner_type NOT NULL DEFAULT 'platform',
    features TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE personalized_products ENABLE ROW LEVEL SECURITY;

-- Create policies
-- 1. Anyone can view products (public read access)
DO $$
BEGIN
    CREATE POLICY "Products are viewable by everyone" ON personalized_products
    FOR SELECT USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Only admins can insert/update/delete products
-- We assume auth.users has some metadata or we will handle this via service role on the server for now.
-- For simplicity, let's just allow read to everyone, and write via service role (bypasses RLS).
