-- ============================================================
-- BOOKIO: Initial Database Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- =====================
-- 1. CUSTOM ENUM TYPES
-- =====================

CREATE TYPE user_role AS ENUM ('creator', 'studio_owner', 'super_admin');
CREATE TYPE slot_status AS ENUM ('available', 'booked', 'blocked');
CREATE TYPE booking_status AS ENUM ('confirmed', 'cancelled', 'pending');
CREATE TYPE payment_status AS ENUM ('pending', 'advance_paid', 'fully_paid', 'refunded');

-- =====================
-- 2. PROFILES TABLE
-- Extends Supabase auth.users with app-specific fields
-- =====================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  role user_role NOT NULL DEFAULT 'creator',
  phone TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies: Users can read all profiles, but only update their own
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =====================
-- 3. STUDIOS TABLE
-- =====================

CREATE TABLE studios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  description TEXT,
  base_price_per_hour NUMERIC(10,2) NOT NULL DEFAULT 0,
  photos TEXT[] DEFAULT '{}',
  facilities TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE studios ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Active studios are viewable by everyone"
  ON studios FOR SELECT
  USING (is_active = true);

CREATE POLICY "Studio owners can view all own studios"
  ON studios FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Studio owners can insert studios"
  ON studios FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Studio owners can update own studios"
  ON studios FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Studio owners can delete own studios"
  ON studios FOR DELETE
  USING (auth.uid() = owner_id);

-- Index for fast owner lookups
CREATE INDEX idx_studios_owner_id ON studios(owner_id);

-- =====================
-- 4. INVENTORY TABLE (Time Slots)
-- =====================

CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time_slot TEXT NOT NULL,          -- e.g., '10:00-11:00'
  status slot_status NOT NULL DEFAULT 'available',
  current_price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Available inventory is viewable by everyone"
  ON inventory FOR SELECT
  USING (true);

CREATE POLICY "Studio owners can manage own inventory"
  ON inventory FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM studios
      WHERE studios.id = inventory.studio_id
      AND studios.owner_id = auth.uid()
    )
  );

CREATE POLICY "Studio owners can update own inventory"
  ON inventory FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM studios
      WHERE studios.id = inventory.studio_id
      AND studios.owner_id = auth.uid()
    )
  );

CREATE POLICY "Studio owners can delete own inventory"
  ON inventory FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM studios
      WHERE studios.id = inventory.studio_id
      AND studios.owner_id = auth.uid()
    )
  );

-- Indexes for common queries
CREATE INDEX idx_inventory_studio_id ON inventory(studio_id);
CREATE INDEX idx_inventory_date ON inventory(date);
CREATE INDEX idx_inventory_status ON inventory(status);
CREATE INDEX idx_inventory_studio_date ON inventory(studio_id, date);

-- =====================
-- 5. BOOKINGS TABLE
-- =====================

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID NOT NULL REFERENCES studios(id),
  creator_id UUID NOT NULL REFERENCES profiles(id),
  slot_ids UUID[] NOT NULL DEFAULT '{}',
  total_amount NUMERIC(10,2) NOT NULL,
  advance_paid NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_status payment_status NOT NULL DEFAULT 'pending',
  booking_status booking_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Creators can view own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = creator_id);

CREATE POLICY "Studio owners can view bookings for their studios"
  ON bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM studios
      WHERE studios.id = bookings.studio_id
      AND studios.owner_id = auth.uid()
    )
  );

CREATE POLICY "Creators can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own bookings"
  ON bookings FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "Studio owners can update bookings for their studios"
  ON bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM studios
      WHERE studios.id = bookings.studio_id
      AND studios.owner_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_bookings_studio_id ON bookings(studio_id);
CREATE INDEX idx_bookings_creator_id ON bookings(creator_id);
CREATE INDEX idx_bookings_status ON bookings(booking_status);

-- =====================
-- 6. AUTO-CREATE PROFILE ON SIGNUP
-- =====================

-- Function: automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.phone, ''),
    COALESCE(
      (NEW.raw_user_meta_data->>'role')::user_role,
      'creator'
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: fire on every new auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================
-- 7. UPDATED_AT TRIGGER HELPER
-- =====================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_studios_updated_at
  BEFORE UPDATE ON studios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
