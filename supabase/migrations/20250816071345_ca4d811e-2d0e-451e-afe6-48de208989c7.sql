-- Create users table for admin authentication
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create planting_recommendations table
CREATE TABLE public.planting_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  planting_date DATE,
  harvesting_date DATE,
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create monthly_rainfall table
CREATE TABLE public.monthly_rainfall (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month INT CHECK (month BETWEEN 1 AND 12),
  year INT CHECK (year >= 2000),
  rainfall_amount NUMERIC(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily_rainfall table
CREATE TABLE public.daily_rainfall (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE UNIQUE NOT NULL,
  rainfall_amount NUMERIC(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planting_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_rainfall ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_rainfall ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table (only admins can manage users)
CREATE POLICY "Admin users can view all users" 
ON public.users FOR SELECT 
USING (true);

CREATE POLICY "Admin users can insert users" 
ON public.users FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admin users can update users" 
ON public.users FOR UPDATE 
USING (true);

CREATE POLICY "Admin users can delete users" 
ON public.users FOR DELETE 
USING (true);

-- Create RLS policies for planting_recommendations (publicly readable, admin writable)
CREATE POLICY "Everyone can view planting recommendations" 
ON public.planting_recommendations FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert planting recommendations" 
ON public.planting_recommendations FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update planting recommendations" 
ON public.planting_recommendations FOR UPDATE 
USING (true);

CREATE POLICY "Authenticated users can delete planting recommendations" 
ON public.planting_recommendations FOR DELETE 
USING (true);

-- Create RLS policies for monthly_rainfall (publicly readable, admin writable)
CREATE POLICY "Everyone can view monthly rainfall" 
ON public.monthly_rainfall FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert monthly rainfall" 
ON public.monthly_rainfall FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update monthly rainfall" 
ON public.monthly_rainfall FOR UPDATE 
USING (true);

CREATE POLICY "Authenticated users can delete monthly rainfall" 
ON public.monthly_rainfall FOR DELETE 
USING (true);

-- Create RLS policies for daily_rainfall (publicly readable, admin writable)
CREATE POLICY "Everyone can view daily rainfall" 
ON public.daily_rainfall FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert daily rainfall" 
ON public.daily_rainfall FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update daily rainfall" 
ON public.daily_rainfall FOR UPDATE 
USING (true);

CREATE POLICY "Authenticated users can delete daily rainfall" 
ON public.daily_rainfall FOR DELETE 
USING (true);