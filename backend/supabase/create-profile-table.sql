-- Run this in your Supabase SQL Editor to create the profile table

CREATE TABLE IF NOT EXISTS admin_user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  gender TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  pincode TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT admin_user_profiles_user_id_unique UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS admin_user_profiles_user_id_idx ON admin_user_profiles (user_id);
