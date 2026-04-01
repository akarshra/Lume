-- Lume E-Commerce - Orders Table Fix
-- Instructions: Run this script in the Supabase SQL Editor.

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION recreate_policies()
RETURNS void AS $$
BEGIN
  -- Drop existing ones if they get in the way
  DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.orders;
  DROP POLICY IF EXISTS "Enable insert for everyone" ON public.orders;
  DROP POLICY IF EXISTS "Enable select for everyone" ON public.orders;
  DROP POLICY IF EXISTS "Enable update for everyone" ON public.orders;
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END;
$$ LANGUAGE plpgsql;

SELECT recreate_policies();

CREATE POLICY "Enable insert for everyone" 
ON public.orders FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Enable select for everyone" 
ON public.orders FOR SELECT 
USING (true);

CREATE POLICY "Enable update for everyone" 
ON public.orders FOR UPDATE 
USING (true);
