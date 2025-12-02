-- Create status enum type
CREATE TYPE public.user_status AS ENUM ('pending', 'approved', 'rejected');

-- Add status column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN status public.user_status NOT NULL DEFAULT 'pending';

-- Update existing users to approved (so current users can still log in)
UPDATE public.profiles SET status = 'approved';

-- Create policy for admins to update user status
CREATE POLICY "Admins can update user profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create policy for admins to delete user profiles
CREATE POLICY "Admins can delete user profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));