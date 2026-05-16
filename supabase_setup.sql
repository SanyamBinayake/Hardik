-- 0. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Categories Table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL, -- e.g., 'kg', 'litre', 'pkt'
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_url TEXT,
  stock_quantity INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_best_seller BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Profiles (for Admin)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  role TEXT DEFAULT 'user', -- 'admin' or 'user'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Orders Table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  address TEXT NOT NULL,
  pincode TEXT NOT NULL,
  order_notes TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  delivery_charge DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'delivered', 'cancelled'
  payment_method TEXT DEFAULT 'COD',
  payment_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Order Items Table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  price_at_time DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS (since you want a simple login without Supabase Auth)
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Seed Categories
INSERT INTO categories (name, slug) VALUES 
('Grains & Pulses', 'grains-pulses'),
('Edible Oils', 'edible-oils'),
('Spices & Masalas', 'spices-masalas'),
('Beverages', 'beverages'),
('Household', 'household');

-- Seed Products
INSERT INTO products (name, slug, description, price, unit, category_id, is_featured) 
SELECT 'Ground Nuts', 'ground-nuts', 'Fresh high-quality ground nuts.', 120.00, 'kg', id, true FROM categories WHERE slug = 'grains-pulses'
UNION ALL
SELECT 'Sugar', 'sugar', 'Refined white sugar.', 48.00, 'kg', id, true FROM categories WHERE slug = 'grains-pulses'
UNION ALL
SELECT 'Tea Powder', 'tea-powder', 'Strong and aromatic tea powder.', 220.00, 'kg', id, true FROM categories WHERE slug = 'beverages'
UNION ALL
SELECT 'Sunflower Oil', 'sunflower-oil', 'Pure refined sunflower oil.', 160.00, 'litre', id, true FROM categories WHERE slug = 'edible-oils';
