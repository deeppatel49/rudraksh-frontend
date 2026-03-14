-- Migration: Add comprehensive product fields to products table
-- Run this in Supabase SQL Editor to update your products table

-- Additional Info fields
ALTER TABLE products ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS image text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_alt text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS marketer text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS prescription_required boolean DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS therapeutic_class text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS action_class text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS in_stock boolean DEFAULT true;

-- Usage Information fields
ALTER TABLE products ADD COLUMN IF NOT EXISTS key_benefits jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS usage text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS benefits text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS uses text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS how_it_works text;

-- Storage & Precautions fields
ALTER TABLE products ADD COLUMN IF NOT EXISTS storage text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS precautions text;

-- Safety Information fields
ALTER TABLE products ADD COLUMN IF NOT EXISTS alcohol_interaction text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS pregnancy_safety text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS breastfeeding_safety text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS driving_safety text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS kidney_safety text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS liver_safety text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS habit_forming text;

-- Substitutes fields
ALTER TABLE products ADD COLUMN IF NOT EXISTS substitute_count text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS substitute_list text;

-- Ratings fields
ALTER TABLE products ADD COLUMN IF NOT EXISTS overall_rating text;

-- Timestamps
ALTER TABLE products ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create additional indexes
CREATE INDEX IF NOT EXISTS products_in_stock_idx ON products (in_stock);
CREATE INDEX IF NOT EXISTS products_price_idx ON products (price);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully! Products table now has all comprehensive fields.';
END $$;
