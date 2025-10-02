-- Create user roles infrastructure for secure role-based access control
-- This prevents privilege escalation attacks by separating roles from user profiles

-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create policy for users to view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Migrate existing role data from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, 
  CASE 
    WHEN role::text = 'admin' THEN 'admin'::public.app_role
    ELSE 'user'::public.app_role
  END
FROM public.profiles
ON CONFLICT (user_id, role) DO NOTHING;

-- Update RLS policies for typhoons table to restrict modifications to admins only
DROP POLICY IF EXISTS "Authenticated users can insert typhoon records" ON public.typhoons;
DROP POLICY IF EXISTS "Authenticated users can update typhoon records" ON public.typhoons;
DROP POLICY IF EXISTS "Authenticated users can delete typhoon records" ON public.typhoons;

CREATE POLICY "Only admins can insert typhoon records"
ON public.typhoons
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update typhoon records"
ON public.typhoons
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete typhoon records"
ON public.typhoons
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));