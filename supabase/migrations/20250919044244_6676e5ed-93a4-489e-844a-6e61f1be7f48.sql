-- Add additional fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN contact_number text,
ADD COLUMN farm_name text,
ADD COLUMN farm_location text;

-- Update the handle_new_user function to include the new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, username, full_name, contact_number, farm_name, farm_location)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'contact_number', ''),
    COALESCE(NEW.raw_user_meta_data->>'farm_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'farm_location', '')
  );
  RETURN NEW;
END;
$function$;