-- Update handle_new_user function to auto-approve and auto-verify super admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  is_super_admin boolean;
BEGIN
  -- Check if this is the super admin email
  is_super_admin := NEW.email = 'arictediguzman@gmail.com';
  
  INSERT INTO public.profiles (user_id, username, full_name, contact_number, farm_name, farm_location, role, status, email_verified)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'full_name', CASE WHEN is_super_admin THEN 'Super Admin' ELSE '' END),
    COALESCE(NEW.raw_user_meta_data->>'contact_number', ''),
    COALESCE(NEW.raw_user_meta_data->>'farm_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'farm_location', ''),
    CASE WHEN is_super_admin THEN 'admin'::public.user_role ELSE COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'user') END,
    CASE WHEN is_super_admin THEN 'approved'::public.user_status ELSE 'pending'::public.user_status END,
    CASE WHEN is_super_admin THEN true ELSE false END
  );
  
  -- Auto-assign admin role in user_roles table for super admin
  IF is_super_admin THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$function$;