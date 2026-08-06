-- PresUMart Supabase Production Database Schema

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  email TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  major TEXT NOT NULL,
  batch TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL,
  category TEXT NOT NULL,
  allow_nego BOOLEAN DEFAULT TRUE,
  image TEXT,
  seller TEXT NOT NULL,
  seller_email TEXT NOT NULL,
  seller_major TEXT,
  seller_batch TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY,
  seller_email TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_name TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_price NUMERIC NOT NULL,
  proposed_price NUMERIC,
  message_text TEXT,
  type TEXT NOT NULL DEFAULT 'nego',
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT DEFAULT 'COD',
  unread_by_seller BOOLEAN DEFAULT TRUE,
  unread_by_buyer BOOLEAN DEFAULT FALSE,
  replies JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security) & add public policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access users" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow public access products" ON public.products FOR ALL USING (true);
CREATE POLICY "Allow public access messages" ON public.messages FOR ALL USING (true);
