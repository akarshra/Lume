-- Lume E-Commerce - Supabase Schema Update
-- Instructions: Copy and paste this script into your Supabase SQL Editor and click "Run".

-- 1. Create Wishlist Table
CREATE TABLE IF NOT EXISTS public.wishlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) for Wishlist
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- Policies for Wishlist
CREATE POLICY "Users can view their own wishlist" 
    ON public.wishlist FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their own wishlist" 
    ON public.wishlist FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own wishlist" 
    ON public.wishlist FOR DELETE 
    USING (auth.uid() = user_id);


-- 2. Create Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_name TEXT, -- To display the reviewer name easily
    product_id TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) for Reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policies for Reviews
CREATE POLICY "Anyone can view reviews" 
    ON public.reviews FOR SELECT 
    USING (true);

CREATE POLICY "Authenticated users can leave a review" 
    ON public.reviews FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" 
    ON public.reviews FOR DELETE 
    USING (auth.uid() = user_id);

-- Make sure real-time is enabled for these tables if needed in the future
alter publication supabase_realtime add table public.wishlist;
alter publication supabase_realtime add table public.reviews;
