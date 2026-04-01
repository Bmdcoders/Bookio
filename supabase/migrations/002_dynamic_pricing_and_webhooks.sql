-- Bookio Phase 4: Dynamic Pricing & Webhook Configuration

--------------------------------------------------------------------------------
-- 1. EXTENSIONS
--------------------------------------------------------------------------------
-- Required for scheduling the background task and making external HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

--------------------------------------------------------------------------------
-- 2. SCHEMA MODIFICATIONS (INVENTORY)
--------------------------------------------------------------------------------
-- Add columns to support the "Happy Hour" logic and prevent manual override collisions
ALTER TABLE public.inventory
ADD COLUMN IF NOT EXISTS is_flash_deal BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_price_locked BOOLEAN DEFAULT false;

--------------------------------------------------------------------------------
-- 3. HAPPY HOUR ALGORITHM (YIELD MANAGEMENT)
--------------------------------------------------------------------------------
-- This function identifies available slots within the next 48 hours that 
-- haven't been manually locked by the studio owner, and applies a 25% discount.
CREATE OR REPLACE FUNCTION apply_happy_hour_discounts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.inventory i
  SET 
    current_price = (s.base_price_per_hour * 0.75),
    is_flash_deal = true
  FROM public.studios s
  WHERE i.studio_id = s.id
    AND i.status = 'available'
    AND i.is_price_locked = false
    AND i.is_flash_deal = false
    -- Simplified: Apply to dates occurring today and tomorrow
    AND i.date <= (CURRENT_DATE + interval '2 days')::date;
  
  -- Optionally: Add log table tracking for metrics here in the future
END;
$$;

-- Schedule the job to run exactly on the 0th minute of every hour
SELECT cron.schedule(
  'happy_hour_yield_job',
  '0 * * * *',
  $$ SELECT apply_happy_hour_discounts(); $$
);

--------------------------------------------------------------------------------
-- 4. DATABASE WEBHOOK (WHATSAPP NOTIFIER)
--------------------------------------------------------------------------------
-- When a booking is inserted, trigger the Supabase Edge Function to dispatch WhatsApp signals.
-- Note: Replace '{SUPABASE_URL}' and '{SUPABASE_ANON_KEY}' with your project variables later.
CREATE OR REPLACE FUNCTION trigger_booking_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  edge_function_url TEXT := 'https://{SUPABASE_REFERENCE_ID}.supabase.co/functions/v1/booking-notifier';
  service_role_key TEXT := '{SUPABASE_SERVICE_ROLE_KEY}';
  request_body JSONB;
BEGIN
  -- Construct the payload
  request_body := jsonb_build_object(
    'type', TG_OP,
    'table', TG_TABLE_NAME,
    'schema', TG_TABLE_SCHEMA,
    'record', row_to_json(NEW)
  );

  -- Perform the async HTTP POST request using pg_net
  PERFORM net.http_post(
    url := edge_function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    body := request_body
  );

  RETURN NEW;
END;
$$;

-- Attach the trigger specifically to INSERT operations on the bookings table
DROP TRIGGER IF EXISTS on_booking_confirmed ON public.bookings;
CREATE TRIGGER on_booking_confirmed
  AFTER INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION trigger_booking_notification();
