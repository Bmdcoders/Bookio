-- ============================================================
-- Bookio: Revenue OS & Marketplace Core Schema
-- ============================================================

-- 1. Custom Types
CREATE TYPE user_role AS ENUM ('creator', 'studio_owner', 'super_admin');
CREATE TYPE inventory_status AS ENUM ('available', 'booked', 'blocked');
CREATE TYPE payment_status AS ENUM ('pending', 'advance_paid', 'paid', 'refunded');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- 2. Profiles (Extends Auth.Users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role user_role DEFAULT 'creator'::user_role,
  phone TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) for Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'Unknown User'),
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'creator'::user_role)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 3. Studios (Supply Side)
CREATE TABLE studios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  base_price_per_hour INTEGER NOT NULL,
  photos TEXT[] DEFAULT '{}',
  facilities TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE, -- Phase 6 SuperAdmin Approval
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Studios
ALTER TABLE studios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Verified studios are viewable by everyone." ON studios FOR SELECT USING (is_verified = true OR auth.uid() = owner_id);
CREATE POLICY "Studio owners can insert their own studios." ON studios FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Studio owners can update their own studios." ON studios FOR UPDATE USING (auth.uid() = owner_id);

-- 4. Inventory (Yield Management)
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID REFERENCES studios(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time_slot TEXT NOT NULL, -- e.g., '10:00-11:00'
  start_time TIMESTAMPTZ NOT NULL, -- Used for Yield Cron Job
  status inventory_status DEFAULT 'available'::inventory_status,
  base_price INTEGER NOT NULL,
  current_price INTEGER NOT NULL,
  is_flash_deal BOOLEAN DEFAULT FALSE,
  is_price_locked BOOLEAN DEFAULT FALSE, -- If owner manually changes price, prevent algo override
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Inventory
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Inventory is viewable by everyone." ON inventory FOR SELECT USING (true);
CREATE POLICY "Studio owners can manage their inventory." ON inventory FOR ALL USING (
  auth.uid() IN (SELECT owner_id FROM studios WHERE studios.id = inventory.studio_id)
);

-- 5. Bookings (Demand Side Checkout)
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID REFERENCES studios(id) ON DELETE RESTRICT,
  creator_id UUID REFERENCES profiles(id) ON DELETE RESTRICT,
  inventory_id UUID REFERENCES inventory(id) ON DELETE RESTRICT,
  total_amount INTEGER NOT NULL,
  advance_paid INTEGER DEFAULT 0,
  platform_fee INTEGER NOT NULL, -- 5% computed at checkout
  payment_status payment_status DEFAULT 'pending'::payment_status,
  booking_status booking_status DEFAULT 'pending'::booking_status,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Creators can view their own bookings." ON bookings FOR SELECT USING (auth.uid() = creator_id);
CREATE POLICY "Studio owners can view bookings for their studios." ON bookings FOR SELECT USING (
  auth.uid() IN (SELECT owner_id FROM studios WHERE studios.id = bookings.studio_id)
);
CREATE POLICY "Creators can insert bookings." ON bookings FOR INSERT WITH CHECK (auth.uid() = creator_id);


-- ============================================================
-- Phase 4: Dynamic Yield Management Algorithm (Cron Job)
-- ============================================================

-- Function: Apply 25% discount to available slots less than 48 hours away
CREATE OR REPLACE FUNCTION apply_happy_hour_yield()
RETURNS void AS $$
BEGIN
  UPDATE inventory
  SET 
    current_price = base_price * 0.75,
    is_flash_deal = true
  WHERE 
    status = 'available' AND
    is_price_locked = false AND
    start_time <= (NOW() + interval '48 hours') AND
    start_time > NOW() AND
    is_flash_deal = false;
END;
$$ LANGUAGE plpgsql;

-- NOTE: To schedule this in Supabase:
-- You must go to Database > Extensions and enable `pg_cron`.
-- Then run this SQL query separately:
-- SELECT cron.schedule('yield_management', '0 * * * *', 'SELECT apply_happy_hour_yield()');
