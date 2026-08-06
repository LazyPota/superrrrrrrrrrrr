CREATE TABLE IF NOT EXISTS users (
  email VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  major VARCHAR(255) NOT NULL,
  batch VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL,
  category VARCHAR(255) NOT NULL,
  allow_nego BOOLEAN DEFAULT TRUE,
  condition VARCHAR(100) DEFAULT 'Bekas - Seperti Baru',
  image TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  seller VARCHAR(255) NOT NULL,
  seller_email VARCHAR(255) NOT NULL,
  seller_major VARCHAR(255),
  seller_batch VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(255) PRIMARY KEY,
  seller_email VARCHAR(255) NOT NULL,
  seller_name VARCHAR(255) NOT NULL,
  buyer_email VARCHAR(255) NOT NULL,
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

CREATE TABLE IF NOT EXISTS reviews (
  id VARCHAR(255) PRIMARY KEY,
  product_id VARCHAR(255) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  seller_email VARCHAR(255) NOT NULL,
  buyer_email VARCHAR(255) NOT NULL,
  buyer_name VARCHAR(255) NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
