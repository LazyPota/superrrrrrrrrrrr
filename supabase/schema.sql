-- PresUMart Production Supabase Database Schema with RLS & Auth Integration

-- 1. Users / Profiles Table (Linked with Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  major VARCHAR(255) NOT NULL,
  batch VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policies for users table
CREATE POLICY "Public profiles are viewable by everyone." 
  ON users FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own profile." 
  ON users FOR INSERT 
  WITH CHECK (auth.jwt() ->> 'email' = email OR auth.uid() = id);

CREATE POLICY "Users can update their own profile." 
  ON users FOR UPDATE 
  USING (auth.jwt() ->> 'email' = email OR auth.uid() = id);


-- 2. Products Table
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL CHECK (price >= 0),
  stock INT DEFAULT 1 CHECK (stock >= 0),
  category VARCHAR(255) NOT NULL,
  allow_nego BOOLEAN DEFAULT TRUE,
  condition VARCHAR(100) DEFAULT 'Bekas - Seperti Baru',
  image TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  seller VARCHAR(255) NOT NULL,
  seller_email VARCHAR(255) NOT NULL REFERENCES users(email) ON DELETE CASCADE,
  seller_major VARCHAR(255),
  seller_batch VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policies for products table
CREATE POLICY "Products are viewable by everyone." 
  ON products FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can insert products." 
  ON products FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated' AND (auth.jwt() ->> 'email' = seller_email OR seller_email IS NOT NULL));

CREATE POLICY "Sellers can update their own products." 
  ON products FOR UPDATE 
  USING (auth.jwt() ->> 'email' = seller_email OR auth.role() = 'service_role');

CREATE POLICY "Sellers can delete their own products." 
  ON products FOR DELETE 
  USING (auth.jwt() ->> 'email' = seller_email OR auth.role() = 'service_role');

-- Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_seller_email ON products(seller_email);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);


-- 3. Direct Messages / Nego Table
CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(255) PRIMARY KEY,
  seller_email VARCHAR(255) NOT NULL REFERENCES users(email) ON DELETE CASCADE,
  seller_name VARCHAR(255) NOT NULL,
  buyer_email VARCHAR(255) NOT NULL REFERENCES users(email) ON DELETE CASCADE,
  buyer_name VARCHAR(255) NOT NULL,
  product_id VARCHAR(255) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  product_price NUMERIC NOT NULL,
  proposed_price NUMERIC,
  message_text TEXT,
  type VARCHAR(50) NOT NULL DEFAULT 'nego',
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  payment_method VARCHAR(50) DEFAULT 'COD',
  unread_by_seller BOOLEAN DEFAULT TRUE,
  unread_by_buyer BOOLEAN DEFAULT FALSE,
  reviewed BOOLEAN DEFAULT FALSE,
  replies JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on messages table
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies for messages table (Only buyer or seller involved can view or edit)
CREATE POLICY "Users can view messages they are involved in." 
  ON messages FOR SELECT 
  USING (auth.jwt() ->> 'email' = buyer_email OR auth.jwt() ->> 'email' = seller_email OR auth.role() = 'service_role');

CREATE POLICY "Buyers and sellers can insert messages." 
  ON messages FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Buyers and sellers can update their messages." 
  ON messages FOR UPDATE 
  USING (auth.jwt() ->> 'email' = buyer_email OR auth.jwt() ->> 'email' = seller_email OR auth.role() = 'service_role');


-- 4. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id VARCHAR(255) PRIMARY KEY,
  product_id VARCHAR(255) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  seller_email VARCHAR(255) NOT NULL REFERENCES users(email) ON DELETE CASCADE,
  buyer_email VARCHAR(255) NOT NULL REFERENCES users(email) ON DELETE CASCADE,
  buyer_name VARCHAR(255) NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on reviews table
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone." 
  ON reviews FOR SELECT 
  USING (true);

CREATE POLICY "Buyers can insert reviews." 
  ON reviews FOR INSERT 
  WITH CHECK (auth.jwt() ->> 'email' = buyer_email OR auth.role() = 'service_role');

-- Indexes for fast review lookups
CREATE INDEX IF NOT EXISTS idx_reviews_seller_email ON reviews(seller_email);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
