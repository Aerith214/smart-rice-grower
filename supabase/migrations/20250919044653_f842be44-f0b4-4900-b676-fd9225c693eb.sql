-- Add role enum and role column to profiles table
CREATE TYPE public.user_role AS ENUM ('user', 'admin');

ALTER TABLE public.profiles 
ADD COLUMN role public.user_role DEFAULT 'user';

-- Update the handle_new_user function to set role based on metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, username, full_name, contact_number, farm_name, farm_location, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'contact_number', ''),
    COALESCE(NEW.raw_user_meta_data->>'farm_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'farm_location', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'user')
  );
  RETURN NEW;
END;
$function$;