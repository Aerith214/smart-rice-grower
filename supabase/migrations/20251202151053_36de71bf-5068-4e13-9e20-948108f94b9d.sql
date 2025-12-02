-- Add email_verified column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email_verified boolean NOT NULL DEFAULT false;

-- Update handle_new_user function to set email_verified = false
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, full_name, contact_number, farm_name, farm_location, role, status, email_verified)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'contact_number', ''),
    COALESCE(NEW.raw_user_meta_data->>'farm_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'farm_location', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'user'),
    'pending'::public.user_status,
    false
  );
  RETURN NEW;
END;
$$;